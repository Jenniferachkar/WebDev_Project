<template>
  <div class="shop">
    <div class="hero-bar">
      <h1>Boutique</h1>
      <input class="search" v-model="search" @input="debouncedSearch" placeholder="Rechercher un article..." />
    </div>

    <div class="categories-bar">
      <button
        v-for="cat in categories"
        :key="cat.slug || 'all'"
        :class="['cat-btn', { active: selectedCategory === cat.slug }]"
        @click="selectCategory(cat.slug)"
      >
        <span class="cat-emoji">{{ cat.emoji }}</span>
        <span class="cat-label">{{ cat.label }}</span>
      </button>
    </div>


    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="products.length === 0" class="empty">
      Aucun produit trouvé.
    </div>

    <div v-else class="products-grid">
      <RouterLink
        v-for="product in products"
        :key="product._id"
        :to="`/product/${product._id}`"
        class="product-card"
      >
        <div class="product-image">
          <img v-if="product.images?.[0]" :src="product.images[0]" :alt="product.name" />
          <div v-else class="placeholder-img">👗</div>
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="category">{{ product.category }}</p>
          <div class="prices">
            <span class="price-eur">{{ displayPrice(product) }} €</span>
            <span class="price-old" v-if="product.dynamicPrice && product.dynamicPrice !== product.price">{{ product.price.toFixed(2) }} €</span>
            <span class="price-usdc" v-if="product.priceUSDC">{{ product.priceUSDC }} USDC</span>
          </div>
          <div class="pricing-note" v-if="product.pricingNote">{{ product.pricingNote }}</div>
        </div>
      </RouterLink>
    </div>

    <div class="pagination" v-if="total > limit">
      <button :disabled="page === 1" @click="page--; fetchProducts()">← Précédent</button>
      <span>Page {{ page }} / {{ Math.ceil(total / limit) }}</span>
      <button :disabled="page >= Math.ceil(total / limit)" @click="page++; fetchProducts()">Suivant →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../utils/api.js'

const categories = [
  { slug: '', label: 'Tout', emoji: '✨', variants: ['✨', '🧥', '👗', '👕', '👟'] },
  { slug: 't-shirts', label: 'T-shirts', emoji: '👕', variants: ['👕🔵', '👕⚪', '👕⚫', '👕🟢', '👕🟠'] },
  { slug: 'pantalons', label: 'Pantalons', emoji: '👖', variants: ['👖🔵', '👖⚫', '👖🟤', '👖🩶'] },
  { slug: 'robes', label: 'Robes', emoji: '👗', variants: ['👗🔴', '👗💜', '👗🖤', '👗💙', '👗🧡'] },
  { slug: 'vestes', label: 'Vestes', emoji: '🧥', variants: ['🧥🩶', '🧥🟢', '🧥🟦', '🧥🟣'] },
  { slug: 'chaussures', label: 'Chaussures', emoji: '👟', variants: ['👟⚪', '👟⚫', '👟🟠', '👟🟣'] },
  { slug: 'accessoires', label: 'Accessoires', emoji: '👜', variants: ['👜🩷', '👜🟦', '👜🟨', '👜🟠'] },
]

const products = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = 12
const selectedCategory = ref('')
const search = ref('')
let searchTimeout = null
const currentCategory = computed(() => categories.find(cat => cat.slug === selectedCategory.value) || categories[0])

async function fetchProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: page.value, limit })
    if (selectedCategory.value) params.append('category', selectedCategory.value)
    if (search.value) params.append('search', search.value)

    const data = await api.get(`/products?${params}`)
    products.value = data.products
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function selectCategory(slug) {
  selectedCategory.value = slug || ''
  page.value = 1
  fetchProducts()
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; fetchProducts() }, 400)
}

onMounted(fetchProducts)

function displayPrice(product) {
  const price = product.dynamicPrice ?? product.price
  return price?.toFixed(2)
}
</script>

<style scoped>
.shop { padding: 2rem; max-width: 1200px; margin: 0 auto; }

.hero-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-bar h1 { font-size: 2rem; }

.search {
  flex: 1;
  min-width: 240px;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid #dedede;
  font-size: 0.95rem;
  background: #fff;
}

.categories-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1.05rem 1.15rem;
  border-radius: 18px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  font-size: 1.05rem;
}

.cat-btn:hover,
.cat-btn:focus-visible {
  transform: scale(1.03);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  border-color: #d0d0d0;
}

.cat-btn.active {
  border-color: #1a1a1a;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}

.cat-emoji { font-size: 1.5rem; }
.cat-label { font-weight: 700; font-size: 1.05rem; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.product-card {
  text-decoration: none;
  color: inherit;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.product-image { height: 240px; overflow: hidden; background: #f0ede8; }
.product-image img { width: 100%; height: 100%; object-fit: cover; }

.placeholder-img {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
}

.product-info { padding: 1rem; }
.product-info h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
.category { font-size: 0.8rem; color: #888; text-transform: capitalize; margin-bottom: 0.5rem; }

.prices { display: flex; gap: 0.75rem; align-items: center; }
.price-eur { font-weight: 700; font-size: 1.1rem; }
.price-old { font-size: 0.9rem; color: #999; text-decoration: line-through; }
.price-usdc { font-size: 0.8rem; color: #2a9d8f; background: #e8f5f3; padding: 2px 6px; border-radius: 4px; }
.pricing-note { font-size: 0.8rem; color: #888; margin-top: 0.35rem; }

.loading, .empty { text-align: center; padding: 4rem; color: #888; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
