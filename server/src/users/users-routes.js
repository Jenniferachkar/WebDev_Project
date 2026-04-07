import User from './user-schema.js'

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
function usersRoutes(app) {
  app.get('/verify-email', async (request, reply) => {
    const { token } = request.query

    // TODO: Valider la présence du token
    if (!token) {
      return reply.status(400).send({ error: 'Token de validation requis' })
    }

    // TODO: Rechercher l'utilisateur correspondant au token de validation
    const user = await User.findOne({ validationToken: token })

    // TODO: gérer le cas où le token est invalide ou expiré
    if (!user) {
      return reply.status(400).send({ error: 'Token invalide ou expiré' })
    }

    // TODO: vérifier si l'utilisateur a déjà validé son email
    if (user.emailVerified) {
      return reply.status(409).send({ error: 'Email déjà vérifié' })
    }

    // TODO: marquer l'email de l'utilisateur comme vérifié et supprimer le token de validation
    user.emailVerified = true
    user.validationToken = null

    // TODO: sauvegarder les modifications de l'utilisateur dans la base de données
    await user.save()

    return reply.send({ message: 'Email vérifié avec succès' })
  })

  app.get('/me', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    return reply.send({ user: request.user })
  })

  // TODO: protéger aussi les routes suivantes pour qu'elles soient accessibles uniquement aux utilisateurs authentifiés
  app.get('', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    // TODO: Implémenter la logique pour récupérer les utilisateurs depuis la base de données
    // TODO: Implémenter la pagination, les filtres, etc.
    const { page = 1, limit = 10, sort = 'createdAt' } = request.query
    const skip = (Number(page) - 1) * Number(limit)

    const users = await User.find({}, '-passwordHash -validationToken')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    const total = await User.countDocuments()

    return reply.send({ users, total, page: Number(page), limit: Number(limit) })
  })

  app.get('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    // TODO: Implémenter la logique pour récupérer un utilisateur par ID depuis la base de données
    const user = await User.findById(id, '-passwordHash -validationToken')

    // TODO: gérer le cas où l'utilisateur n'existe pas
    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    return reply.send({ user })
  })

  app.delete('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    // TODO: Implémenter la logique pour supprimer un utilisateur par ID depuis la base de données
    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    return reply.status(204).send()
  })
}

export default usersRoutes
