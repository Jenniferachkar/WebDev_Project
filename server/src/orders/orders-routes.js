import Stripe from 'stripe'
import config from '../config.js'
import Product from '../products/product-schema.js'
import Order from './order-schema.js'

const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null

// Adresse du wallet qui reçoit les paiements crypto
const MERCHANT_WALLET = config.merchantWalletAddress || '0xYourWalletAddressHere'

function computeDynamicPrice(product) {
  const stock = product.stock ?? 0
  let factor = 1
  if (stock <= 5) factor = 1.15
  else if (stock <= 10) factor = 1.10
  else if (stock >= 50) factor = 0.90
  return Math.round(product.price * factor * 100) / 100
}

/**
 * @param {import('fastify').FastifyInstance} app
 */
function ordersRoutes(app) {
  // Créer une commande + initier le paiement
  app.post('', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { items, paymentMethod, shippingAddress, couponCode } = request.body
    const userId = request.user.sub

    if (!items || items.length === 0) {
      return reply.status(400).send({ error: 'Le panier est vide' })
    }

    // Récupérer les produits depuis la DB pour avoir les vrais prix
    const productIds = items.map(i => i.productId)
    const products = await Product.find({ _id: { $in: productIds } })

    if (products.length !== items.length) {
      return reply.status(400).send({ error: 'Un ou plusieurs produits sont introuvables' })
    }

    // Construire les items de commande avec les prix réels
    const orderItems = items.map((item) => {
      const product = products.find(p => p._id.toString() === item.productId)
      const price = computeDynamicPrice(product)
      return {
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }
    })

    let totalEUR = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalUSDC = orderItems.reduce((sum, item) => {
      const product = products.find(p => p._id.toString() === item.product.toString())
      const priceUsed = item.price // déjà dynamique
      return sum + (product.priceUSDC || priceUsed * 1.08) * item.quantity
    }, 0)

    // Réduction première commande : 20% avec code NEW20
    let discountEUR = 0
    let appliedCoupon = null
    if (couponCode === 'NEW20') {
      const alreadyOrdered = await Order.exists({ user: userId })
      if (!alreadyOrdered) {
        discountEUR = Math.round(totalEUR * 0.2 * 100) / 100
        totalEUR = Math.max(0, totalEUR - discountEUR)
        appliedCoupon = couponCode
      }
    }

    // Créer la commande en DB
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalEUR,
      totalUSDC: Math.round(totalUSDC * 100) / 100,
      paymentMethod,
      shippingAddress,
      couponCode: appliedCoupon,
      discountEUR,
    })

    // Selon la méthode de paiement, initier le flux correspondant
    if (paymentMethod === 'card') {
      // Mode démo : si Stripe n'est pas configuré, marquer la commande comme payée directement
      if (!stripe) {
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: 'paid',
          status: 'confirmed',
        })
        return reply.status(201).send({
          order,
          paymentMethod: 'card',
          demo: true,
          message: 'Paiement carte simulé (mode démo).',
        })
      }

      // Créer un PaymentIntent Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalEUR * 100), // en centimes
        currency: 'eur',
        metadata: { orderId: order._id.toString() },
      })

      await Order.findByIdAndUpdate(order._id, {
        stripePaymentIntentId: paymentIntent.id,
      })

      return reply.status(201).send({
        order,
        clientSecret: paymentIntent.client_secret,
        paymentMethod: 'card',
      })
    }

    if (paymentMethod === 'usdc' || paymentMethod === 'token') {
      // Pour crypto : retourner l'adresse du wallet + le montant en USDC
      return reply.status(201).send({
        order,
        paymentMethod,
        cryptoPayment: {
          walletAddress: MERCHANT_WALLET,
          amountUSDC: order.totalUSDC,
          orderId: order._id.toString(),
          // Le frontend devra appeler /orders/:id/confirm-crypto après le paiement
        },
      })
    }

    return reply.status(400).send({ error: 'Méthode de paiement non supportée' })
  })

  // Confirmer un paiement crypto (le frontend envoie le txHash après transaction MetaMask)
  app.post('/:id/confirm-crypto', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params
    const { txHash } = request.body

    if (!txHash) {
      return reply.status(400).send({ error: 'Transaction hash requis' })
    }

    const order = await Order.findById(id)
    if (!order) {
      return reply.status(404).send({ error: 'Commande introuvable' })
    }

    // En production : vérifier le txHash on-chain via ethers.js ou alchemy
    // Pour l'instant on fait confiance au frontend (à sécuriser en prod)
    await Order.findByIdAndUpdate(id, {
      txHash,
      paymentStatus: 'paid',
      status: 'confirmed',
    })

    return reply.send({ message: 'Paiement crypto confirmé', orderId: id })
  })

  // Webhook Stripe pour confirmer le paiement carte
  app.post('/webhook/stripe', async (request, reply) => {
    if (!stripe || !config.stripeWebhookSecret) {
      return reply.status(503).send({ error: 'Webhook Stripe indisponible: configuration manquante' })
    }

    const sig = request.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        config.stripeWebhookSecret,
      )
    } catch (err) {
      return reply.status(400).send({ error: `Webhook Error: ${err.message}` })
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const orderId = paymentIntent.metadata.orderId

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      })
    }

    return reply.send({ received: true })
  })

  // Lister les commandes de l'utilisateur connecté
  app.get('/my', { onRequest: [app.authenticate] }, async (request, reply) => {
    const orders = await Order.find({ user: request.user.sub })
      .populate('items.product', 'name images')
      .sort('-createdAt')
    return reply.send({ orders })
  })

  // Récupérer une commande par ID
  app.get('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const order = await Order.findById(request.params.id)
      .populate('items.product', 'name images price')
    if (!order) {
      return reply.status(404).send({ error: 'Commande introuvable' })
    }
    return reply.send({ order })
  })

  // Annuler une commande (simple annulation user)
  app.post('/:id/cancel', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params
    const order = await Order.findOne({ _id: id, user: request.user.sub })
    if (!order) return reply.status(404).send({ error: 'Commande introuvable' })
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return reply.status(400).send({ error: 'Commande non annulable' })
    }
    order.status = 'cancelled'
    order.paymentStatus = 'refunded'
    await order.save()
    return reply.send({ message: 'Commande annulée', orderId: id })
  })
}

export default ordersRoutes
