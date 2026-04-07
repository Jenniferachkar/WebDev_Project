import Product from './product-schema.js'

function computeDynamicPrice(product) {
  const stock = product.stock ?? 0
  let factor = 1
  let note = 'Prix standard'

  if (stock <= 5) {
    factor = 1.15
    note = 'Demande forte (stock faible)'
  } else if (stock <= 10) {
    factor = 1.10
    note = 'Demande élevée'
  } else if (stock >= 50) {
    factor = 0.90
    note = 'Offre élevée (stock important)'
  }

  const dynamicPrice = Math.round(product.price * factor * 100) / 100
  const deltaPct = Math.round((factor - 1) * 100)
  return { dynamicPrice, deltaPct, pricingNote: note }
}

/**
 * @param {import('fastify').FastifyInstance} app
 */
function productsRoutes(app) {
  // Lister tous les produits (public)
  app.get('', async (request, reply) => {
    const { page = 1, limit = 12, category, sort = '-createdAt', search } = request.query
    const skip = (Number(page) - 1) * Number(limit)

    const filter = { isActive: true }
    if (category) {
      filter.category = category
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ])

    const withPricing = products.map(p => {
      const pricing = computeDynamicPrice(p)
      return { ...p.toObject(), ...pricing }
    })

    return reply.send({ products: withPricing, total, page: Number(page), limit: Number(limit) })
  })

  // Récupérer un produit par ID (public)
  app.get('/:id', async (request, reply) => {
    const { id } = request.params
    const product = await Product.findById(id)
    if (!product || !product.isActive) {
      return reply.status(404).send({ error: 'Produit introuvable' })
    }
    const pricing = computeDynamicPrice(product)
    return reply.send({ product: { ...product.toObject(), ...pricing } })
  })

  // Créer un produit (admin uniquement)
  app.post('', { onRequest: [app.authenticate] }, async (request, reply) => {
    const product = await Product.create(request.body)
    return reply.status(201).send({ product })
  })

  // Modifier un produit (admin uniquement)
  app.put('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params
    const product = await Product.findByIdAndUpdate(id, request.body, { new: true })
    if (!product) {
      return reply.status(404).send({ error: 'Produit introuvable' })
    }
    return reply.send({ product })
  })

  // Supprimer un produit (admin uniquement)
  app.delete('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params
    await Product.findByIdAndUpdate(id, { isActive: false })
    return reply.status(204).send()
  })
}

export default productsRoutes
