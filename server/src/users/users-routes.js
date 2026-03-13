// import User from './user-schema.js' // À décommenter lors de l'implémentation des routes

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
function usersRoutes(app) {
  app.get('/verify-email', async (request, _reply) => {
    // Récupérer le token de validation depuis la querystring de la requête
    const { token } = request.query

    // Valider la présence du token

    // TODO: Rechercher l'utilisateur correspondant au token de validation
    // tip: https://mongoosejs.com/docs/queries.html
    // const user =

    // TODO: gérer le cas où le token est invalide ou expiré

    // TODO: vérifier si l'utilisateur a déjà validé son email

    // TODO: marquer l'email de l'utilisateur comme vérifié et supprimer le token de validation
    // TODO: sauvegarder les modifications de l'utilisateur dans la base de données

    // TODO: retourner une réponse indiquant que l'email a été validé avec succès
  })

  app.get('/', async (request, reply) => {
    // TODO: Implémenter la logique pour récupérer les utilisateurs depuis la base de données
    // tip: https://mongoosejs.com/docs/queries.html
    // TODO: Implémenter la pagination, les filtres, etc.
    // tips: https://mongoosejs.com/docs/api/query.html#Query.prototype.sort()
    //       https://mongoosejs.com/docs/api/query.html#Query.prototype.skip()
    //       https://mongoosejs.com/docs/api/query.html#Query.prototype.limit()
    return reply.send({ message: 'List of users' })
  })

  app.get('/:id', async (request, reply) => {
    // Récupérer l'ID de l'utilisateur depuis les paramètres de la route
    const { id } = request.params // Attention: les params sont toujours des strings, même si l'ID est un ObjectId dans MongoDB
    // TODO: Implémenter la logique pour récupérer un utilisateur par ID depuis la base de données
    // tip: https://mongoosejs.com/docs/queries.html
    // TODO: gérer le cas où l'utilisateur n'existe pas
    return reply.send({ message: `User with ID ${user._id}` })
  })

  app.delete('/:id', async (request, reply) => {
    // Récupérer l'ID de l'utilisateur depuis les paramètres de la route
    const { id } = request.params
  })
}

export default usersRoutes
