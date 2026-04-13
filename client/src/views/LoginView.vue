<!-- LoginView.vue -->
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Connexion</h1>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" required placeholder="votre@email.com" />
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input v-model="password" type="password" required placeholder="••••••••" />
        </div>
        <p class="error" v-if="auth.error">{{ auth.error }}</p>
        <button type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
      <p class="link">Pas encore de compte ? <RouterLink to="/register">S'inscrire</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await auth.login(email.value, password.value)
    const target = route.query.redirect || '/shop'
    router.push(target)
  } catch (err) {
    if (!auth.error)
      auth.error = err.message || 'Échec de la connexion.'
  }
}
</script>

<style scoped>
@import '../assets/auth.css';
</style>

