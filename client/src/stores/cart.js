import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const totalEUR = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const totalUSDC = computed(() => items.value.reduce((sum, i) => sum + (i.priceUSDC || i.price * 1.08) * i.quantity, 0))

  function addItem(product, size, color, quantity = 1) {
    const existing = items.value.find(
      i => i.productId === product._id && i.size === size && i.color === color
    )
    const price = product.dynamicPrice ?? product.price
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        productId: product._id,
        name: product.name,
        price,
        priceUSDC: product.priceUSDC,
        image: product.images?.[0],
        size,
        color,
        quantity,
      })
    }
  }

  function removeItem(productId, size, color) {
    items.value = items.value.filter(
      i => !(i.productId === productId && i.size === size && i.color === color)
    )
  }

  function updateQuantity(productId, size, color, quantity) {
    const item = items.value.find(
      i => i.productId === productId && i.size === size && i.color === color
    )
    if (item) {
      if (quantity <= 0) removeItem(productId, size, color)
      else item.quantity = quantity
    }
  }

  function clear() {
    items.value = []
  }

  return { items, totalItems, totalEUR, totalUSDC, addItem, removeItem, updateQuantity, clear }
}, { persist: true })
