import { randomBytes } from 'node:crypto'

import config from '../config.js'
import { sendRegistrationEmail } from '../services/mailer.js'
import User from '../users/user-schema.js'
import { hashPassword, verifyPassword } from '../utils/crypto.js'

const emailRegex = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-0-9]+\.)+[a-z]{2,})$/i

function buildVerificationUrl(validationToken) {
  return `${config.appBaseUrl}/users/verify-email?token=${validationToken}`
}

function withVerificationDebugData(payload, validationToken) {
  if (config.env === 'production') {
    return payload
  }
  return {
    ...payload,
    verificationToken: validationToken,
    verificationUrl: buildVerificationUrl(validationToken),
  }
}

async function sendVerificationEmail(app, email, validationToken) {
  const verificationUrl = buildVerificationUrl(validationToken)
  const emailInfo = await sendRegistrationEmail({ email, verificationUrl })
  app.log.info({ msg: 'Registration email sent', email, messageId: emailInfo.messageId })
}

/**
 * @param {import('fastify').FastifyInstance} app
 */
function authRoutes(app) {
  app.post('/register', async (request, reply) => {
    const { email, password, username } = request.body

    if (!email || !password || !username) {
      return reply.status(400).send({ error: 'Email, password et username requis' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!emailRegex.test(normalizedEmail)) {
      return reply.status(400).send({ error: 'Email invalide' })
    }

    // Vérifier si l'email existe déjà
    const existingByEmail = await User.findOne({ email: normalizedEmail })
    if (existingByEmail) {
      return reply.status(409).send({ error: 'Cet email est déjà utilisé' })
    }

    // TODO: faire une vérification sur le username aussi
    const existingByUsername = await User.findOne({ username: username.trim() })
    if (existingByUsername) {
      return reply.status(409).send({ error: 'Ce username est déjà utilisé' })
    }

    const passwordHash = await hashPassword(password)
    const validationToken = randomBytes(32).toString('hex')

    const user = await User.create({
      email: normalizedEmail,
      username: `${username.trim()}-${validationToken.slice(0, 6)}`,
      passwordHash,
      validationToken,
    })

    try {
      await sendVerificationEmail(app, normalizedEmail, validationToken)
    } catch (error) {
      app.log.error({ err: error, email: normalizedEmail }, 'Failed to send registration email')
      return reply.status(503).send(withVerificationDebugData({
        error: 'Compte créé, mais l\'email de validation n\'a pas pu être envoyé. Réessayez plus tard.',
        email: user.email,
      }, validationToken))
    }

    return reply.status(201).send(withVerificationDebugData({
      message: 'Utilisateur créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.',
      email: user.email,
    }, validationToken))
  })

  app.post('/resend-verification-email', async (request, reply) => {
    const { email } = request.body

    if (!email) {
      return reply.status(400).send({ error: 'Email requis' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!emailRegex.test(normalizedEmail)) {
      return reply.status(400).send({ error: 'Email invalide' })
    }

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    if (user.emailVerified) {
      return reply.status(409).send({ error: 'Adresse email déjà validée' })
    }

    if (!user.validationToken) {
      user.validationToken = randomBytes(32).toString('hex')
      await user.save()
    }

    try {
      await sendVerificationEmail(app, user.email, user.validationToken)
    } catch (error) {
      app.log.error({ err: error, email: user.email }, 'Failed to resend registration email')
      return reply.status(503).send(withVerificationDebugData({
        error: 'L\'email de validation n\'a pas pu être envoyé. Réessayez plus tard.',
      }, user.validationToken))
    }

    return reply.send(withVerificationDebugData({
      message: 'Email de validation renvoyé avec succès.',
      email: user.email,
    }, user.validationToken))
  })

  app.post('/login', async (request, reply) => {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email et mot de passe requis' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return reply.status(401).send({ error: 'Identifiants invalides' })
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash)
    if (!passwordMatches) {
      return reply.status(401).send({ error: 'Identifiants invalides' })
    }

    if (!user.emailVerified) {
      return reply.status(403).send({ error: 'Veuillez valider votre adresse email avant de vous connecter' })
    }

    const token = await reply.jwtSign({
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    }, { expiresIn: '2h' })

    reply.setCookie(config.jwt.cookieName, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: config.env === 'production',
    })

    return reply.send({ message: 'Authentification réussie' })
  })

  app.post('/logout', async (request, reply) => {
    reply.clearCookie(config.jwt.cookieName, { path: '/' })
    return reply.send({ message: 'Déconnexion réussie' })
  })
}

export default authRoutes
