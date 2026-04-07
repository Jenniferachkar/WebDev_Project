<template>
  <div class="checkout-page">
    <h1>Finaliser la commande</h1>

    <div class="checkout-layout">
      <!-- Formulaire -->
      <div class="checkout-form">
        <!-- Adresse de livraison -->
        <section class="form-section">
          <h2>📦 Adresse de livraison</h2>
          <div class="form-grid">
            <input v-model="form.street" placeholder="Rue et numéro" class="full-width" />
            <input v-model="form.city" placeholder="Ville" />
            <input v-model="form.postalCode" placeholder="Code postal" />
            <input v-model="form.country" placeholder="Pays" />
          </div>
        </section>

        <!-- Méthode de paiement -->
        <section class="form-section">
          <h2>💳 Méthode de paiement</h2>
          <div class="payment-options">
            <label :class="{ selected: paymentMethod === 'card' }">
              <input type="radio" v-model="paymentMethod" value="card" />
              💳 Carte bancaire
            </label>
            <label :class="{ selected: paymentMethod === 'usdc' }">
              <input type="radio" v-model="paymentMethod" value="usdc" />
              🪙 USDC (Stablecoin)
            </label>
            <label :class="{ selected: paymentMethod === 'token' }">
              <input type="radio" v-model="paymentMethod" value="token" />
              🔷 Token ERC-20
            </label>
          </div>
        </section>

        <!-- Paiement carte (mode démo ou Stripe) -->
        <section class="form-section" v-if="paymentMethod === 'card'">
          <h2>Informations carte (test)</h2>
          <div class="form-grid">
            <input
              v-model="card.number"
              placeholder="Numéro de carte (ex: 4242 4242 4242 4242)"
              class="full-width"
              :class="{ invalid: submitted && !cardNumberValid }"
            />
            <input
              v-model="card.exp"
              placeholder="MM/AA"
              :class="{ invalid: submitted && !cardExpValid }"
              @input="formatExp"
            />
            <input
              v-model="card.cvc"
              placeholder="CVC"
              :class="{ invalid: submitted && !cardCvcValid }"
            />
          </div>
          <p class="card-hint" :class="{ bad: (!cardNumberValid && submitted) || cardDigits.length > 19 }">
            <template v-if="cardDigits.length === 0">Entrez 16 chiffres de test (ex: 4242...)</template>
            <template v-else-if="cardRemaining > 0">Il manque {{ cardRemaining }} chiffre{{ cardRemaining > 1 ? 's' : '' }} — {{ cardDots }}</template>
            <template v-else-if="cardDigits.length > 19">Trop de chiffres</template>
          </p>
          <p class="card-ghost">{{ cardPlaceholders }}</p>
          <p class="card-hint bad" v-if="submitted && !cardExpValid">Expiration invalide (MM/AA).</p>
          <p class="card-hint bad" v-if="submitted && !cardCvcValid">CVC invalide (3-4 chiffres).</p>
          <p class="stripe-note">En démo : on valide sans vrai paiement.</p>
        </section>

        <!-- Paiement crypto -->
        <section class="form-section" v-if="paymentMethod === 'usdc' || paymentMethod === 'token'">
          <h2>Paiement crypto</h2>
          <p class="crypto-info">
            Connectez votre wallet MetaMask. Après confirmation de la commande, vous serez invité à  envoyer
            <strong>{{ cart.totalUSDC.toFixed(2) }} USDC</strong> vers notre adresse.
          </p>
          <button class="btn-metamask" @click="connectWallet" v-if="!walletAddress">
            🦊 Connecter MetaMask
          </button>
          <p v-else class="wallet-connected">âœ… Wallet connecté : {{ shortAddress }}</p>
          <button class="btn-secondary" type="button" @click="simulateCrypto" :disabled="loading">
            Simuler un paiement crypto
          </button>
        </section>

        <div class="promo" v-if="isFirstOrder && !couponApplied">
          <p><strong>Nouveau ?</strong> -20% avec le code <code>{{ couponCode }}</code></p>
          <button class="btn-secondary" type="button" @click="receiveCoupon">Recevoir le code promo</button>
        </div>

        <p class="error" v-if="error">{{ error }}</p>

        <button class="btn-pay" @click="placeOrder" :disabled="loading || !canSubmit">
          <span v-if="loading">â³ Traitement...</span>
          <span v-else>Payer {{ totalAfterDiscount.toFixed(2) }} €</span>
        </button>
      </div>

      <!-- Récapitulatif -->
      <div class="order-summary">
        <h2>Récapitulatif</h2>
        <div v-for="item in cart.items" :key="`${item.productId}-${item.size}`" class="summary-item">
          <span>{{ item.name }} × {{ item.quantity }}</span>
          <span>{{ (item.price * item.quantity).toFixed(2) }} €</span>
        </div>
        <div class="summary-total">
          <span>Sous-total</span>
          <span>{{ cart.totalEUR.toFixed(2) }} €</span>
        </div>
        <div v-if="couponApplied" class="summary-discount">
          <span>Code {{ couponCode }} (-20%)</span>
          <span>- {{ discountAmount.toFixed(2) }} €</span>
        </div>
        <div class="summary-total total-payable">
          <span>Total à  payer</span>
          <span>{{ totalAfterDiscount.toFixed(2) }} €</span>
        </div>
        <div v-if="paymentMethod !== 'card'" class="summary-crypto">
          â‰ˆ {{ cart.totalUSDC.toFixed(2) }} USDC
        </div>
      </div>
    </div>

    <!-- Modal succès -->
    <div class="success-modal" v-if="orderSuccess">
      <div class="modal-content">
        <h2>🎉 Commande confirmée !</h2>
        <p>Merci pour votre achat. Vous recevrez une confirmation par email.</p>
        <RouterLink to="/orders" class="btn-orders">Voir mes commandes</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../utils/api.js'
import { useCartStore } from '../stores/cart.js'

const cart = useCartStore()

const paymentMethod = ref('card')
const walletAddress = ref('')
const loading = ref(false)
const error = ref('')
const orderSuccess = ref(false)
const card = ref({ number: '', exp: '', cvc: '' })
const submitted = ref(false)
const couponCode = ref('NEW20')
const couponApplied = ref(false)
const isFirstOrder = ref(false)

const form = ref({
  street: '',
  city: '',
  postalCode: '',
  country: 'France',
})

const shortAddress = computed(() =>
  walletAddress.value ? `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}` : ''
)

const cardNumberValid = computed(() => /^\d{12,19}$/.test(card.value.number.replace(/\s+/g, '')))
const cardExpValid = computed(() => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(card.value.exp.trim()))
const cardCvcValid = computed(() => /^\d{3,4}$/.test(card.value.cvc.trim()))
const discountAmount = computed(() => couponApplied.value ? Math.round(cart.totalEUR * 0.2 * 100) / 100 : 0)
const totalAfterDiscount = computed(() => Math.max(0, cart.totalEUR - discountAmount.value))
const cardDigits = computed(() => card.value.number.replace(/\D/g, ''))
const cardRemaining = computed(() => Math.max(0, 16 - cardDigits.value.length))
const cardDots = computed(() => cardRemaining.value > 0 ? '•'.repeat(cardRemaining.value) : '')
const cardPlaceholders = computed(() => {
  const filled = (cardDigits.value + '_'.repeat(16)).slice(0, 16)
  const groups = filled.match(/.{1,4}/g)
  return groups ? groups.join(' ') : filled
})

const canSubmit = computed(() => {
  if (paymentMethod.value === 'card') {
    return cardNumberValid.value && cardExpValid.value && cardCvcValid.value
  }
  // crypto démo : pas de blocage
  return true
})

onMounted(async () => {
  try {
    const data = await api.get('/orders/my')
    isFirstOrder.value = (data.orders?.length ?? 0) === 0
  } catch {
    // ignore
  }
})

async function connectWallet() {
  if (!window.ethereum) {
    error.value = 'MetaMask non détecté. Installez l\'extension MetaMask.'
    return
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    walletAddress.value = accounts[0]
  } catch {
    error.value = 'Connexion MetaMask refusée.'
  }
}

function formatExp() {
  let exp = card.value.exp.replace(/\D/g, '')
  if (exp.length > 2) exp = exp.slice(0, 2) + '/' + exp.slice(2, 4)
  card.value.exp = exp.slice(0, 5)
}

async function placeOrder() {
  error.value = ''
  loading.value = true
  submitted.value = true

  try {
    const orderData = {
      items: cart.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
      paymentMethod: paymentMethod.value,
      shippingAddress: {
        street: form.value.street || 'Demo Street 1',
        city: form.value.city || 'Paris',
        postalCode: form.value.postalCode || '75000',
        country: form.value.country || 'France',
      },
      couponCode: couponApplied.value ? couponCode.value : undefined,
    }

    const data = await api.post('/orders', orderData)

    if (paymentMethod.value === 'card') {
      // Mode démo : toujours succès (pas de Stripe en place)
      orderSuccess.value = true
      cart.clear()
    } else {
      // Crypto : demander à  MetaMask d'envoyer les USDC
      const cryptoInfo = data.cryptoPayment
      await handleCryptoPayment(cryptoInfo, data.order._id)
    }
  } catch (err) {
    if (err.status === 401) {
      // En démo, on confirme quand même si la session a expiré
      orderSuccess.value = true
      cart.clear()
      error.value = ''
    } else {
      error.value = err.message
    }
  } finally {
    loading.value = false
  }
}

async function handleCryptoPayment(cryptoInfo, orderId) {
  // Si MetaMask absent ou pour la démo, on simule un txHash
  if (!window.ethereum || !walletAddress.value) {
    const txHash = `demo-tx-${Date.now()}`
    await api.post(`/orders/${orderId}/confirm-crypto`, { txHash })
    orderSuccess.value = true
    cart.clear()
    return
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: walletAddress.value,
        to: cryptoInfo.walletAddress,
        value: '0x0', // En prod: encoder le transfert ERC-20 USDC
        data: '0x', // En prod: ABI encodé du transfert USDC
      }],
    })
    await api.post(`/orders/${orderId}/confirm-crypto`, { txHash })
    orderSuccess.value = true
    cart.clear()
  } catch {
    // Si MetaMask annule, on repasse en mode démo pour que tu puisses continuer
    const txHash = `demo-tx-${Date.now()}`
    await api.post(`/orders/${orderId}/confirm-crypto`, { txHash })
    orderSuccess.value = true
    cart.clear()
  }
}

async function simulateCrypto() {
  // déclenche un order puis confirme directement avec un tx hash simulé
  await placeOrder()
}

async function receiveCoupon() {
  couponApplied.value = true
  try {
    await navigator.clipboard.writeText(couponCode.value)
  } catch {
    // ignore clipboard errors
  }
}
</script>

<style scoped>
.checkout-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
h1 { font-size: 2rem; margin-bottom: 2rem; }

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .checkout-layout { grid-template-columns: 1fr; }
}

.form-section {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.form-section h2 { font-size: 1.1rem; margin-bottom: 1rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-grid input.full-width { grid-column: 1 / -1; }

.form-grid input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.payment-options { display: flex; flex-direction: column; gap: 0.75rem; }

.payment-options label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #eee;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.payment-options label.selected { border-color: #1a1a1a; background: #fafafa; }
.payment-options input { display: none; }

.stripe-card-element {
  border: 1px solid #ddd;
  padding: 0.75rem;
  border-radius: 8px;
  background: white;
  min-height: 42px;
}
.form-grid input.invalid {
  border-color: #e53935;
  box-shadow: 0 0 0 2px rgba(229,57,53,0.15);
}
.card-hint { font-size: 0.85rem; color: #777; margin-top: 0.25rem; }
.card-hint.bad { color: #e53935; }
.card-ghost { font-family: 'Courier New', monospace; font-size: 0.9rem; color: #555; margin-top: 0.1rem; }

.stripe-note { font-size: 0.8rem; color: #888; margin-top: 0.5rem; }

.crypto-info { color: #555; line-height: 1.6; margin-bottom: 1rem; }

.btn-metamask {
  padding: 0.75rem 1.5rem;
  background: #f6851b;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
}

.wallet-connected { color: #2a9d8f; font-weight: 500; }
.btn-secondary {
  margin-top: 0.75rem;
  padding: 0.7rem 1.1rem;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-weight: 600;
}

.error { color: #e63946; background: #fee; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; }

.btn-pay {
  width: 100%;
  padding: 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-pay:disabled { background: #ccc; cursor: not-allowed; }

.order-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: sticky;
  top: 80px;
}

.order-summary h2 { font-size: 1.1rem; margin-bottom: 1rem; }

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 0.75rem;
}
.summary-discount {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #2e7d32;
}
.total-payable { margin-top: 0.35rem; }

.summary-crypto {
  text-align: center;
  color: #2a9d8f;
  font-size: 0.85rem;
  background: #e8f5f3;
  padding: 0.4rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.success-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
}

.modal-content h2 { font-size: 1.5rem; margin-bottom: 0.75rem; }
.modal-content p { color: #555; margin-bottom: 1.5rem; }

.btn-orders {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
}

.promo {
  margin: 1rem 0;
  padding: 0.9rem 1rem;
  border: 1px solid #f2f2f2;
  border-radius: 10px;
  background: #fdf8e4;
  color: #5d4a00;
  font-size: 0.95rem;
}
.promo code {
  background: #fff;
  padding: 0.1rem 0.3rem;
  border-radius: 6px;
  border: 1px solid #e0d5a8;
}
</style>

