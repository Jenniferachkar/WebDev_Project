import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      await api.post('/auth/login', { email, password })
      await fetchMe()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, username) {
    loading.value = true
    error.value = null
    try {
      const data = await api.post('/auth/register', { email, password, username })
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await api.post('/auth/logout', {})
    user.value = null
  }

  async function fetchMe() {
    try {
      const data = await api.get('/users/me')
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  return { user, loading, error, isLoggedIn, login, register, logout, fetchMe }
})
