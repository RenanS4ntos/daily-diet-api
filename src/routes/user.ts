import { FastifyInstance } from 'fastify'
import z from 'zod'
import { Knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const checkUserAlreadyExists = await Knex('users')
      .where('email', email)
      .first()

    if (checkUserAlreadyExists) {
      return reply.status(409).send({ error: 'User already exists' })
    }

    const sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await Knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send({ message: 'User created' })
  })
}
