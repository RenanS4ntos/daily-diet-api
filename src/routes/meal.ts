import { FastifyInstance } from 'fastify'
import z from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { Knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function mealRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await Knex('users').where('session_id', sessionId).first()

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        on_diet: z.boolean(),
        date: z.string().refine((date) => {
          return !isNaN(new Date(date).getTime())
        }, 'Invalid date format'),
      })

      const { name, description, on_diet, date } = createMealBodySchema.parse(
        request.body,
      )

      await Knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        on_diet,
        date: new Date(date).toISOString(),
        user_id: user.id,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await Knex('users').where('session_id', sessionId).first()

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const updateMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        on_diet: z.boolean(),
        date: z.string().refine((date) => {
          return !isNaN(new Date(date).getTime())
        }, 'Invalid date format'),
      })

      const { name, description, on_diet, date } = updateMealBodySchema.parse(
        request.body,
      )

      const meal = await Knex('meals').where({ id, user_id: user.id }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await Knex('meals')
        .where({ id, user_id: user.id })
        .update({
          name,
          description,
          on_diet,
          date: new Date(date).toISOString(),
        })

      return reply.status(200).send()
    },
  )

  app.get('/', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const user = await Knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    const meals = await Knex('meals').where('user_id', user.id).select()

    return { meals }
  })

  app.get(
    '/:id',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await Knex('users').where('session_id', sessionId).first()

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const getMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await Knex('meals').where({ id, user_id: user.id }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return { meal }
    },
  )

  app.delete(
    '/:id',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const user = await Knex('users').where('session_id', sessionId).first()

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const deleteMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)

      const meal = await Knex('meals').where({ id, user_id: user.id }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await Knex('meals').where({ id, user_id: user.id }).delete()

      return reply.status(204).send()
    },
  )
}
