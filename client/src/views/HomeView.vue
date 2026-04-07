<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="brand-mark">JennyFits</div>
        <div class="cta-row">
          <RouterLink to="/register" class="cta primary">S'inscrire</RouterLink>
          <RouterLink to="/login" class="cta secondary">Se connecter</RouterLink>
          <RouterLink to="/shop" class="cta ghost">Continuer en invité</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.home { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

.hero {
  min-height: 520px;
  display: grid;
  place-items: center;
  padding: 5rem 0 4rem;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.6), transparent 35%), #f7f6f4;
  border-radius: 28px;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

.brand-mark {
  font-size: clamp(2.8rem, 6vw, 4.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.cta-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.6rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  border: 1px solid transparent;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
  transform: translateZ(0);
  min-width: 180px;
}

.cta:hover,
.cta:focus-visible {
  transform: scale(1.04);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.08);
}

.cta:active {
  transform: scale(1.02);
}

.primary {
  background: #1a1a1a;
  color: white;
}

.primary:hover,
.primary:focus-visible { background: #2a2a2a; }

.secondary {
  background: #ffffff;
  color: #1a1a1a;
  border-color: #dcdcdc;
}

.secondary:hover,
.secondary:focus-visible {
  background: #f3f3f3;
}

.ghost {
  background: transparent;
  color: #1a1a1a;
  border-color: #dcdcdc;
}

.ghost:hover,
.ghost:focus-visible {
  background: #f8f8f8;
}
</style>
