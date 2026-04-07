<template>
  <div class="orders-page">
    <h1>Mes commandes</h1>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="orders.length === 0" class="empty">
      <p>Vous n'avez pas encore de commande.</p>
      <RouterLink to="/shop" class="btn-shop">Aller à la boutique</RouterLink>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order._id" class="order-card">
        <div class="order-header">
          <div>
            <p class="order-id">Commande #{{ order._id.slice(-8).toUpperCase() }}</p>
            <p class="order-date">{{ new Date(order.createdAt).toLocaleDateString('fr-FR') }}</p>
          </div>
          <div class="order-badges">
            <span class="badge" :class="order.status">{{ statusLabel(order.status) }}</span>
            <span class="badge payment" :class="order.paymentStatus">{{ paymentLabel(order.paymentStatus) }}</span>
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item._id" class="order-item">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>{{ (item.price * item.quantity).toFixed(2) }} €</span>
          </div>
        </div>

        <div class="delivery-block">
          <div class="delivery-header">
            <span>Suivi livraison</span>
            <span class="delivery-status">{{ statusLabel(order.status) }}</span>
          </div>
          <div class="delivery-progress">
            <div v-for="(step, idx) in deliverySteps" :key="step.key" class="step">
              <div
                class="dot"
                :class="{
                  done: idx <= deliveryIndex(order.status),
                  current: idx === deliveryIndex(order.status)
                }"
              ></div>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <span class="payment-method">
            {{ methodIcon(order.paymentMethod) }} {{ methodLabel(order.paymentMethod) }}
          </span>
          <span class="order-total">{{ order.totalEUR.toFixed(2) }} €</span>
          <button
            v-if="order.status !== 'cancelled' && order.status !== 'delivered'"
            class="btn-cancel"
            @click="cancelOrder(order._id)"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../utils/api.js'

const orders = ref([])
const loading = ref(true)
const cancelling = ref(null)

const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' }[s] || s)
const paymentLabel = (s) => ({ pending: 'Paiement en attente', paid: 'Payée', failed: 'Échoué', refunded: 'Remboursée' }[s] || s)
const methodLabel = (m) => ({ card: 'Carte bancaire', usdc: 'USDC', token: 'Token ERC-20' }[m] || m)
const methodIcon = (m) => ({ card: '💳', usdc: '🪙', token: '🔷' }[m] || '💰')

const deliverySteps = [
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmée' },
  { key: 'shipped', label: 'Expédiée' },
  { key: 'delivered', label: 'Livrée' },
]

function deliveryIndex(status) {
  const map = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 }
  return map[status] ?? 0
}

onMounted(async () => {
  try {
    const data = await api.get('/orders/my')
    orders.value = data.orders
  } finally {
    loading.value = false
  }
})

async function cancelOrder(id) {
  if (cancelling.value) return
  cancelling.value = id
  try {
    await api.post(`/orders/${id}/cancel`)
    orders.value = orders.value.filter(o => o._id !== id)
  } finally {
    cancelling.value = null
  }
}
</script>

<style scoped>
.orders-page { padding: 2rem; max-width: 800px; margin: 0 auto; }
h1 { font-size: 2rem; margin-bottom: 2rem; }

.loading, .empty { text-align: center; padding: 4rem; color: #888; }
.btn-shop {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  border-radius: 10px;
}

.order-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-id { font-weight: 700; font-size: 0.95rem; }
.order-date { font-size: 0.85rem; color: #888; margin-top: 0.25rem; }

.order-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.confirmed, .badge.paid { background: #d4edda; color: #155724; }
.badge.pending { background: #fff3cd; color: #856404; }
.badge.cancelled, .badge.failed { background: #f8d7da; color: #721c24; }
.badge.shipped { background: #cce5ff; color: #004085; }

.order-items { border-top: 1px solid #f5f5f5; padding-top: 1rem; margin-bottom: 1rem; }

.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 0.3rem 0;
  color: #555;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 1rem;
  gap: 0.75rem;
}

.payment-method { font-size: 0.85rem; color: #888; }
.order-total { font-weight: 700; font-size: 1.1rem; }
.btn-cancel {
  padding: 0.45rem 0.85rem;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  background: #fff5f5;
  color: #c62828;
  cursor: pointer;
  font-weight: 600;
}

.delivery-block {
  border: 1px solid #f2f2f2;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: #fafafa;
}
.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.delivery-status { font-weight: 700; color: #444; }
.delivery-progress {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}
.step { text-align: center; font-size: 0.8rem; color: #777; }
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e0e0e0;
  margin: 0 auto 4px;
}
.dot.done { background: #2e7d32; }
.dot.current { background: #f9a825; }
</style>
