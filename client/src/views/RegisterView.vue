<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Créer un compte</h1>
      <form @submit.prevent="handleRegister">
        <div class="field">
          <label>Username</label>
          <input v-model="username" required placeholder="john_doe" />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" required placeholder="votre@email.com" />
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input v-model="password" type="password" required placeholder="••••••••" />
        </div>
        <p class="error" v-if="auth.error">{{ auth.error }}</p>
        <p class="success" v-if="success">{{ success }}</p>
        <div v-if="verificationInfo?.verificationUrl" class="debug-link">
          Lien de vérification (dev) :
          <a :href="verificationInfo.verificationUrl" target="_blank" rel="noreferrer">
            Vérifier mon email
          </a>
        </div>
        <button type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Inscription...' : 'S\'inscrire' }}
        </button>
      </form>
      <p class="link">Déjà un compte ? <RouterLink to="/login">Se connecter</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const username = ref('')
const success = ref('')
const verificationInfo = ref(null)

async function handleRegister() {
  try {
    const data = await auth.register(email.value, password.value, username.value)
    verificationInfo.value = data
    success.value = 'Compte créé ! Vérifiez votre email pour activer votre compte.'
  } catch (err) {
    if (!auth.error)
      auth.error = err.message || 'Échec de l’inscription.'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: 2rem 1.5rem;
}

.auth-card {
  width: min(460px, 100%);
  background: white;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  display: grid;
  gap: 1rem;
}

.auth-card h1 { margin: 0; }

.field { display: grid; gap: 0.35rem; }
.field label { font-weight: 600; }
.field input {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
}

.error { color: #c62828; font-weight: 600; }
.success { color: #2e7d32; font-weight: 600; margin-bottom: 0.25rem; }
.debug-link {
  margin: 0.25rem 0 0.5rem;
  font-size: 0.9rem;
}
.debug-link a { color: #1a73e8; text-decoration: underline; }

.auth-card button {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 10px;
  background: #1a1a1a;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.auth-card button:disabled { opacity: 0.7; cursor: not-allowed; }

.link { margin: 0; }
.link a { color: #1a73e8; }
</style>
