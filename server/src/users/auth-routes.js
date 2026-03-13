import { randomBytes } from 'node:crypto'

import config from '../config.js'
import { sendRegistrationEmail } from '../services/mailer.js'
import User from '../users/user-schema.js'
import { hashPassword } from '../utils/crypto.js'

const emailRegex = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-0-9]+\.)+[a-z]{2,})$/i

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
function authRoutes(app) {
  app.post('/register', async (request, reply) => {
    // Récupérer et valider les données d'inscription
    const { email, password, username } = request.body

    // Validation basique des champs
    if (!email || !password || !username) {
      return reply.status(400).send({ error: 'Email, password et username requis' })
    }

    // Normaliser l'email (trim et lowercase)
    const normalizedEmail = email.trim().toLowerCase()

    // Valider le format de l'email
    if (!emailRegex.test(normalizedEmail)) {
      return reply.status(400).send({ error: 'Email invalide' })
    }

    // Vérifier si l'utilisateur existe déjà
    // TODO: faire une vérification sur le username aussi
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return reply.status(409).send({ error: 'Cet email est déjà utilisé' })
    }

    // Créer le hash du mot de passe et le token de validation
    const passwordHash = await hashPassword(password)
    const validationToken = randomBytes(32).toString('hex')

    // Créer l'utilisateur dans la base de données (compte non validé)
    const user = await User.create({
      email: normalizedEmail,
      username: `${username}-${validationToken.slice(0, 6)}`,
      passwordHash,
      validationToken,
    })

    // Générer l'URL de validation
    const verificationUrl = `${config.appBaseUrl}/users/verify-email?token=${validationToken}`

    // Envoyer l'email de confirmation
    try {
      const emailInfo = await sendRegistrationEmail({
        email: normalizedEmail,
        verificationUrl,
      })

      app.log.info({
        msg: 'Registration email sent',
        email: normalizedEmail,
        messageId: emailInfo.messageId,
      })
    } catch (error) {
      app.log.error({
        err: error,
        email: normalizedEmail,
      }, 'Failed to send registration email')
    }

    return reply.status(201).send({
      message: 'Utilisateur créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.',
      email: user.email,
    })
  })

  app.post('/login', async (request, reply) => {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email et mot de passe requis' })
    }

    // TODO: Implémenter la logique de login
    // - Vérifier l'existence de l'utilisateur
    // - Vérifier le password
    // - Générer un JWT token

    return reply.send({ message: 'Authentification réussie', token: 'TODO' })
  })
}

export default authRoutes
