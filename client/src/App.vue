<template>
  <div id="app">
    <nav class="navbar">
      <RouterLink to="/" class="logo">👗 JennyFits</RouterLink>
      <div v-if="!isHome" class="nav-links">
        <RouterLink to="/shop">Boutique</RouterLink>
        <RouterLink to="/cart" class="cart-link">
          🛒 <span v-if="cart.totalItems > 0" class="badge">{{ cart.totalItems }}</span>
        </RouterLink>
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/orders">Mes commandes</RouterLink>
          <div class="user-chip">
            <span class="avatar">🙂</span>
            <span class="username">{{ auth.user?.username || auth.user?.email }}</span>
          </div>
          <button @click="auth.logout()" class="btn-logout">Déconnexion</button>
        </template>
        <template v-else>
          <RouterLink to="/login">Connexion</RouterLink>
          <RouterLink to="/register" class="btn-register">S'inscrire</RouterLink>
        </template>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useCartStore } from './stores/cart.js'

const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()
const isHome = computed(() => route.name === 'home' || route.path === '/')

onMounted(() => auth.fetchMe())
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #f8f7f5;
  color: #1a1a1a;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
  color: #1a1a1a;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover { color: #1a1a1a; }

.cart-link { position: relative; font-size: 1.2rem; }

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e63946;
  color: white;
  font-size: 0.65rem;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.btn-register {
  background: #1a1a1a;
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.btn-logout {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: #fff;
  font-weight: 600;
}

.avatar {
  font-size: 1rem;
}

main { min-height: calc(100vh - 65px); }
</style>
