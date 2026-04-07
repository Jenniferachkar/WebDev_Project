<template>
  <div class="cart-page">
    <h1>Mon panier</h1>

    <div v-if="cart.items.length === 0" class="empty">
      <p>🛒 Votre panier est vide</p>
      <RouterLink to="/shop" class="btn-shop">Continuer les achats</RouterLink>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items">
        <div v-for="item in cart.items" :key="`${item.productId}-${item.size}-${item.color}`" class="cart-item">
          <div class="item-image">
            <img v-if="item.image" :src="item.image" :alt="item.name" />
            <span v-else>👗</span>
          </div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-meta">
              <span v-if="item.size">Taille: {{ item.size }}</span>
              <span v-if="item.color">Couleur: {{ item.color }}</span>
            </p>
            <p class="item-price">{{ item.price.toFixed(2) }} €</p>
          </div>
          <div class="item-qty">
            <button @click="cart.updateQuantity(item.productId, item.size, item.color, item.quantity - 1)">−</button>
            <span>{{ item.quantity }}</span>
            <button @click="cart.updateQuantity(item.productId, item.size, item.color, item.quantity + 1)">+</button>
          </div>
          <div class="item-total">{{ (item.price * item.quantity).toFixed(2) }} €</div>
          <button class="remove" @click="cart.removeItem(item.productId, item.size, item.color)">✕</button>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Récapitulatif</h2>
        <div class="summary-line">
          <span>Sous-total</span>
          <span>{{ cart.totalEUR.toFixed(2) }} €</span>
        </div>
        <div class="summary-line">
          <span>Livraison</span>
          <span>Gratuite</span>
        </div>
        <div class="summary-line total">
          <span>Total</span>
          <span>{{ cart.totalEUR.toFixed(2) }} €</span>
        </div>
        <div class="crypto-total">
          ~{{ cart.totalUSDC.toFixed(2) }} USDC
        </div>
        <RouterLink to="/checkout" class="btn-checkout">
          Passer la commande →
        </RouterLink>
        <RouterLink to="/shop" class="btn-continue">← Continuer les achats</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart.js'

const cart = useCartStore()
</script>

<style scoped>
.cart-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
h1 { font-size: 2rem; margin-bottom: 2rem; }

.empty { text-align: center; padding: 4rem; }
.empty p { font-size: 1.5rem; margin-bottom: 1rem; }

.btn-shop {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  border-radius: 10px;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0ede8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 2rem;
}

.item-image img { width: 100%; height: 100%; object-fit: cover; }

.item-info { flex: 1; }
.item-info h3 { font-size: 0.95rem; font-weight: 600; }
.item-meta { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }
.item-price { font-weight: 600; margin-top: 0.25rem; }

.item-qty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-qty button {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.item-total { font-weight: 700; min-width: 70px; text-align: right; }

.remove {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 1rem;
}

.cart-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.cart-summary h2 { font-size: 1.2rem; margin-bottom: 1rem; }

.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

.summary-line.total {
  font-size: 1.1rem;
  font-weight: 700;
  border-bottom: none;
  margin-top: 0.5rem;
}

.crypto-total {
  text-align: center;
  color: #2a9d8f;
  font-size: 0.85rem;
  background: #e8f5f3;
  padding: 0.4rem;
  border-radius: 8px;
  margin: 0.5rem 0;
}

.btn-checkout {
  display: block;
  text-align: center;
  padding: 1rem;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  margin-top: 1rem;
}

.btn-continue {
  display: block;
  text-align: center;
  margin-top: 0.75rem;
  color: #888;
  font-size: 0.9rem;
  text-decoration: none;
}
</style>
