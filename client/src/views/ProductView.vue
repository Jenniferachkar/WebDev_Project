<template>
  <div class="product-page" v-if="product">
    <RouterLink to="/shop" class="back">← Retour à la boutique</RouterLink>

    <div class="product-layout">
      <div class="product-gallery">
        <img v-if="product.images?.[0]" :src="product.images[0]" :alt="product.name" />
        <div v-else class="placeholder">👗</div>
      </div>

      <div class="product-details">
        <p class="category">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>

        <div class="prices">
          <span class="price-eur">{{ displayPrice(product) }} €</span>
          <span class="price-old" v-if="product.dynamicPrice && product.dynamicPrice !== product.price">{{ product.price.toFixed(2) }} €</span>
          <span class="price-usdc" v-if="product.priceUSDC">{{ product.priceUSDC }} USDC</span>
        </div>
        <p class="pricing-note" v-if="product.pricingNote">{{ product.pricingNote }}</p>

        <div class="option-group" v-if="product.sizes?.length">
          <label>Taille</label>
          <div class="size-options">
            <button
              v-for="size in product.sizes"
              :key="size"
              :class="{ selected: selectedSize === size }"
              @click="selectedSize = size"
            >{{ size }}</button>
          </div>
        </div>

        <div class="option-group" v-if="product.colors?.length">
          <label>Couleur</label>
          <div class="color-options">
            <button
              v-for="color in product.colors"
              :key="color"
              :class="{ selected: selectedColor === color }"
              @click="selectedColor = color"
            >{{ color }}</button>
          </div>
        </div>

        <div class="option-group">
          <label>Quantité</label>
          <div class="qty-controls">
            <button @click="qty > 1 && qty--">−</button>
            <span>{{ qty }}</span>
            <button @click="qty++">+</button>
          </div>
        </div>

        <button class="add-to-cart" @click="addToCart" :disabled="!canAdd">
          🛒 Ajouter au panier
        </button>

        <p class="success" v-if="added">✅ Ajouté au panier !</p>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="loading">Chargement...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '../utils/api.js'
import { useCartStore } from '../stores/cart.js'

const route = useRoute()
const cart = useCartStore()

const product = ref(null)
const loading = ref(true)
const selectedSize = ref('')
const selectedColor = ref('')
const qty = ref(1)
const added = ref(false)

const canAdd = computed(() => {
  const needSize = product.value?.sizes?.length > 0
  const needColor = product.value?.colors?.length > 0
  return (!needSize || selectedSize.value) && (!needColor || selectedColor.value)
})

async function fetchProduct() {
  try {
    const data = await api.get(`/products/${route.params.id}`)
    product.value = data.product
  } finally {
    loading.value = false
  }
}

function addToCart() {
  cart.addItem(product.value, selectedSize.value, selectedColor.value, qty.value)
  added.value = true
  setTimeout(() => added.value = false, 2000)
}

onMounted(fetchProduct)

function displayPrice(p) {
  const price = p.dynamicPrice ?? p.price
  return price?.toFixed(2)
}
</script>

<style scoped>
.product-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }

.back {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 768px) {
  .product-layout { grid-template-columns: 1fr; }
}

.product-gallery img, .product-gallery .placeholder {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 16px;
  background: #f0ede8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
}

.category { text-transform: capitalize; color: #888; font-size: 0.9rem; margin-bottom: 0.5rem; }

h1 { font-size: 2rem; margin-bottom: 1rem; }

.description { color: #555; line-height: 1.6; margin-bottom: 1.5rem; }

.prices { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; }
.price-eur { font-size: 1.8rem; font-weight: 700; }
.price-old { font-size: 1rem; color: #999; text-decoration: line-through; }
.price-usdc { background: #e8f5f3; color: #2a9d8f; padding: 4px 10px; border-radius: 20px; font-size: 0.9rem; }
.pricing-note { color: #777; font-size: 0.9rem; margin-top: 0.4rem; }

.option-group { margin-bottom: 1.25rem; }
.option-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; }

.size-options, .color-options { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.size-options button, .color-options button {
  padding: 0.4rem 0.9rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.size-options button.selected, .color-options button.selected {
  border-color: #1a1a1a;
  background: #1a1a1a;
  color: white;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.qty-controls button {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.qty-controls span { font-size: 1.1rem; font-weight: 600; }

.add-to-cart {
  width: 100%;
  padding: 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.add-to-cart:hover { background: #333; }
.add-to-cart:disabled { background: #ccc; cursor: not-allowed; }

.success { color: #2a9d8f; margin-top: 0.75rem; font-weight: 500; }
.loading { text-align: center; padding: 4rem; }
</style>
