<template>
  <div class="auth-page">
    <div class="auth-card">
      <div v-if="loading">
        <p>⏳ Vérification de votre email...</p>
      </div>
      <div v-else-if="success">
        <h1>✅ Email vérifié !</h1>
        <p>Votre compte est maintenant actif.</p>
        <RouterLink to="/login" class="btn">Se connecter</RouterLink>
      </div>
      <div v-else>
        <h1>❌ Lien invalide</h1>
        <p>{{ error }}</p>
        <RouterLink to="/login" class="btn">Retour</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '../utils/api.js'

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const { token } = route.query
  try {
    await api.get(`/users/verify-email?token=${token}`)
    success.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
