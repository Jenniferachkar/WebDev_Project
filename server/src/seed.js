// server/src/seed.js
// Lancer avec : node src/seed.js
// Ajoute des produits de test dans la base de données

/* eslint-disable no-console */

import mongoose from 'mongoose'
import config from './config.js'
import Product from './products/product-schema.js'

const sampleProducts = [
  {
    name: 'T-shirt Oversize Blanc',
    description: 'T-shirt oversize 100% coton bio, coupe relaxée et confortable.',
    price: 29.90,
    priceUSDC: 32,
    category: 't-shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanc', 'Noir', 'Gris'],
    stock: 50,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
  },
  {
    name: 'Jean Slim Bleu',
    description: 'Jean slim en denim stretch, confort toute la journée.',
    price: 59.90,
    priceUSDC: 64,
    category: 'pantalons',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Bleu', 'Noir'],
    stock: 30,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
  },
  {
    name: 'Robe Fleurie Été',
    description: 'Robe légère à fleurs, parfaite pour l\'été. Matière viscose douce.',
    price: 49.90,
    priceUSDC: 54,
    category: 'robes',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Fleuri Rose', 'Fleuri Bleu'],
    stock: 25,
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500'],
  },
  {
    name: 'Veste en Cuir Noir',
    description: 'Veste en cuir synthétique de qualité, style biker intemporel.',
    price: 119.90,
    priceUSDC: 129,
    category: 'vestes',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Noir', 'Marron'],
    stock: 15,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
  },
  {
    name: 'Sneakers Blanches',
    description: 'Sneakers minimalistes en cuir blanc, semelle légère.',
    price: 89.90,
    priceUSDC: 97,
    category: 'chaussures',
    sizes: ['S', 'M', 'L'],
    colors: ['Blanc', 'Blanc/Gum'],
    stock: 40,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
  },
  {
    name: 'Sac Tote Canvas',
    description: 'Tote bag en canvas épais, grand compartiment, bandoulière incluse.',
    price: 34.90,
    priceUSDC: 37,
    category: 'accessoires',
    sizes: [],
    colors: ['Naturel', 'Noir', 'Écru'],
    stock: 60,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
  },
]

async function seed() {
  await mongoose.connect(config.mongoUri)
  console.log('Connected to MongoDB')

  await Product.deleteMany({})
  console.log('Cleared existing products')

  const created = await Product.insertMany(sampleProducts)
  console.log(`✅ Seeded ${created.length} products`)

  await mongoose.disconnect()
  console.log('Done!')
}

seed().catch(console.error)
