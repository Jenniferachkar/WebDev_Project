# JennyFits — Projet e-commerce

Projet Web Dev ESILV A4 — Jennifer El Achkar

Un site de vente de vêtements pensé pour tester plusieurs modes de paiement : carte bancaire (Stripe), stablecoin USDC et token ERC-20 via MetaMask. L’objectif pédagogique : pratiquer un vrai flux full-stack (front Vue 3 + back Fastify + MongoDB) avec authentification, panier et commandes.

## Ce que tu vas construire
- Authentification avec vérification email, connexion/déconnexion (JWT en cookie httpOnly)
- Catalogue filtrable, pagination, page produit avec variantes (taille, couleur, quantité)
- Panier persistant côté client (Pinia + localStorage)
- Paiement carte (Stripe PaymentIntent) et crypto (USDC + token ERC-20 via MetaMask)
- Création et suivi des commandes (statut paiement + historique utilisateur)

## Architecture rapide (monorepo Turborepo)
- `client/` : Vue 3 + Vite + Pinia + Vue Router
- `server/` : Node.js + Fastify + MongoDB (Mongoose)
- `mongo-init/` : scripts d’init si tu lances Mongo avec Docker
- `package.json` (workspace) + `turbo.json` : scripts communs

## Prérequis
- Node.js 20+
- npm 10+
- Docker Desktop (optionnel mais pratique pour MongoDB)
- Un compte Stripe (clés de test) et MetaMask installé pour tester la crypto

## Étapes pour lancer en local
1) Installer les dépendances
```bash
npm install
```
2) Préparer les variables d’environnement back
```bash
cp server/.env-example server/.env.development.local
# Ouvre le fichier et renseigne MONGODB_URI, JWT_SECRET, STRIPE_*, SMTP_*, MERCHANT_WALLET_ADDRESS
```
3) (Optionnel) Démarrer MongoDB avec Docker
```bash
docker-compose up -d
```
4) Seeder la base avec des produits de test
```bash
cd server
node src/seed.js
cd ..
```
5) Lancer front + back en développement (Turborepo)
```bash
npm run dev
```
6) Ouvrir le front sur http://localhost:5173 et tester les parcours (inscription, ajout panier, paiement test Stripe ou réseau de test dans MetaMask)

## Commandes utiles
- `npm run dev` : démarre front et back ensemble
- `npm run lint` : lint côté client et serveur
- `npm test` dans `client/` : tests front
- `npm run test` dans `server/` : tests API si présents

## Variables d’environnement principales
Voir `server/.env-example` pour la liste complète.

| Variable | À quoi ça sert |
| --- | --- |
| `MONGODB_URI` | Connexion à MongoDB |
| `JWT_SECRET` | Signature des JWT côté serveur |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (test `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Signature du webhook Stripe |
| `MERCHANT_WALLET_ADDRESS` | Adresse Ethereum qui reçoit les paiements crypto |
| `SMTP_*` | Config email (Ethereal possible pour les tests) |

## Choix techniques (pourquoi ces outils ?)
- Fastify : rapide, validation intégrée des schémas
- Mongoose : mapping MongoDB simple pour prototyper
- Pinia : store clair et typable, remplace Vuex
- Stripe : gère la carte en conformité PCI, pas de carte brute sur le serveur
- MetaMask + ethers.js : intégration simple des paiements crypto
- JWT httpOnly : évite l’accès JS au token (XSS)

## Prochaine étape (déploiement)
- Brancher Stripe en mode live et configurer un domaine HTTPS
- Héberger le back (Railway/Render/Fly.io) et le front (Vercel/Netlify)
- Mettre à jour les URLs dans la config (`client/src/config` si présent) et les webhooks Stripe

Bon dev !
