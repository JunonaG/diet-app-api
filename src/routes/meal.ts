import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { request } from 'https'
import { checkIfSessionExists } from '../middleware/check-if-session-exists'

export async function mealRoutes(app: FastifyInstance) {
  // POST create new meal for userID provided /new-meal
  app.post('/:userId/new-meal', async (request, reply) => {
    try {
      const createMealBodySchema = z.object({
        title: z.string(),
        description: z.string(),
        dietCompliance: z.boolean(),
      })

      const createMealParamsSchema = z.object({
        userId: z.string(),
      })

      const { title, description, dietCompliance } = createMealBodySchema.parse(
        request.body,
      )

      const { userId } = createMealParamsSchema.parse(request.params)

      let sessionId = request.cookies.sessionId
      console.log(sessionId)

      if (!sessionId) {
        sessionId = randomUUID()
        reply.setCookie('sessionId', sessionId, {
          path: 'meal/:userId/new-meal',
          maxAge: 60 * 60 * 24,
        })
      }

      await knex('meals').insert({
        id: randomUUID(),
        user_id: userId,
        title,
        description,
        diet_compliance: dietCompliance,
        session_id: sessionId,
      })
      return reply.status(201).send({ message: 'Meal created.' })
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot create a new meal at this time.' })
    }
  })

  // GET all meals for all users
  app.get('/', async (request, reply) => {
    try {
      const meals = await knex('meals').select('*')
      if (!meals) {
        return reply
          .status(404)
          .send({ message: 'Cannot retrieve meals at this time.' })
      }
      return { meals }
    } catch (error) {
      console.error(error)
      return reply.status(404).send({
        message: 'Cannot retrieve all meals information at this time.',
      })
    }
  })

  // GET view specific meal all details by mealID /:mealId
  app.get('/:mealId', async (request, reply) => {
    try {
      const viewMealParamsSchema = z.object({
        mealId: z.string(),
      })

      const { mealId } = viewMealParamsSchema.parse(request.params)

      const meal = await knex('meals').select('*').where('id', mealId).first()

      if (!meal) {
        return reply.status(404).send({ message: 'Meal ID does not exist.' })
      }

      return { meal }
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot view meal information at this time.' })
    }
  })

  // PATCH edit existing meal title by mealID /title/:mealId
  app.patch('/title/:mealId', async (request, reply) => {
    try {
      const editMealTitleBodySchema = z.object({
        newTitle: z.string(),
      })

      const editMealTitleParamsSchema = z.object({
        mealId: z.string(),
      })

      const { newTitle } = editMealTitleBodySchema.parse(request.body)
      const { mealId } = editMealTitleParamsSchema.parse(request.params)

      const mealNewTitle = await knex('meals')
        .where('id', mealId)
        .update('title', newTitle)
        .returning([
          'title',
          'description',
          'date_time_consumed',
          'diet_compliance',
        ])

      return { mealNewTitle }
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot edit meal title at this time.' })
    }
  })

  // PATCH edit existing meal description by mealID /description/:mealId
  app.patch('/description/:mealId', async (request, reply) => {
    try {
      const editMealDescBodySchema = z.object({
        newDescription: z.string(),
      })

      const editMealDescParamsSchema = z.object({
        mealId: z.string(),
      })

      const { newDescription } = editMealDescBodySchema.parse(request.body)
      const { mealId } = editMealDescParamsSchema.parse(request.params)

      const mealNewDescription = await knex('meals')
        .where('id', mealId)
        .update('description', newDescription)
        .returning([
          'title',
          'description',
          'date_time_consumed',
          'diet_compliance',
        ])

      return { mealNewDescription }
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot edit meal description at this time.' })
    }
  })

  // PATCH edit existing meal date_time_consumed by mealID /when-consumed/:mealId
  app.patch('/when-consumed/:mealId', async (request, reply) => {
    try {
      const editMealWhenConsumedBodySchema = z.object({
        newWhenConsumed: z.string(),
      })

      const editMealWhenConsumedParamsSchema = z.object({
        mealId: z.string(),
      })

      const { newWhenConsumed } = editMealWhenConsumedBodySchema.parse(
        request.body,
      )
      const { mealId } = editMealWhenConsumedParamsSchema.parse(request.params)

      const mealNewWhenConsumed = await knex('meals')
        .where('id', mealId)
        .update('date_time_consumed', newWhenConsumed)
        .returning([
          'title',
          'description',
          'date_time_consumed',
          'diet_compliance',
        ])

      return { mealNewWhenConsumed }
    } catch (error) {
      console.error(error)
      return reply.status(404).send({
        message: 'Cannot edit meal date & time consumed at this time.',
      })
    }
  })

  // PATCH edit existing meal compliance status by mealID /diet-compliance/:mealId
  app.patch('/diet-compliance/:mealId', async (request, reply) => {
    try {
      const editMealComplianceBodySchema = z.object({
        newComplianceRating: z.number(),
      })

      const editMealComplianceParamsSchema = z.object({
        mealId: z.string(),
      })

      const { newComplianceRating } = editMealComplianceBodySchema.parse(
        request.body,
      )
      const { mealId } = editMealComplianceParamsSchema.parse(request.params)

      const mealNewComplianceRating = await knex('meals')
        .where('id', mealId)
        .update('diet_compliance', newComplianceRating)
        .returning([
          'title',
          'description',
          'date_time_consumed',
          'diet_compliance',
        ])

      return { mealNewComplianceRating }
    } catch (error) {
      console.error(error)
      return reply.status(404).send({
        message: 'Cannot edit meal diet compliance rating at this time.',
      })
    }
  })

  // DELETE meal by mealID /:mealId
  app.delete('/:mealId', async (request, reply) => {
    try {
      const deleteMealParamsSchema = z.object({
        mealId: z.string(),
      })

      const { mealId } = deleteMealParamsSchema.parse(request.params)

      await knex('meals').where('id', mealId).del()
      return reply.status(202).send({
        message: 'Meal deleted successfully.',
      })
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot delete meal at this time.' })
    }
  })

  // !!!! GET all meals recorded in current session /all/now
  app.get('/all/now', { preHandler: [checkIfSessionExists] }, async () => {
    const meals = await knex('meals').select('*')
    console.log(meals)

    if (!meals) {
      return { error: 'Meals not found in current session.' }
    }
    return { meals }
  })

  // !!!! GET all meals recorded by a specific user on a specific date /all/date/:when
  app.get('/all/date/:when', async (request, reply) => {
    try {
      const dateParamsSchema = z.object({
        when: z.string(),
      })

      const userBodySchema = z.object({
        userId: z.string(),
      })

      const { when } = dateParamsSchema.parse(request.params)
      const { userId } = userBodySchema.parse(request.body)

      console.log(when, typeof when)

      const meals = await knex('meals')
        .select('*')
        .where('user_id', userId)
        .whereRaw('date_time_consumed LIKE ?', [`%${when}`])

      if (!meals) {
        return reply.status(404).send({
          message: 'Cannot retrieve meals for this date and user at this time.',
        })
      }

      return meals
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot view meals information at this time.' })
    }
  })

  // GET all existing meals for current user by userID /all/:userId
  app.get('/all/:userId', async (request, reply) => {
    try {
      const userIdParamsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = userIdParamsSchema.parse(request.params)

      const allMeals = await knex('meals').select('*').where('user_id', userId)

      if (!allMeals) {
        return reply.status(404).send({ message: 'User ID does not exist.' })
      }

      return { allMeals }
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot view meals information at this time.' })
    }
  })

  // GET number of recorded meals for current user by userID /all/total/:userId
  app.get('/all/total/:userId', async (request, reply) => {
    try {
      const userIdParamsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = userIdParamsSchema.parse(request.params)

      const totalMeals = await knex('meals')
        .where('user_id', userId)
        .count('* as totalNumber')

      if (!totalMeals) {
        return reply.status(404).send({ message: 'User ID does not exist.' })
      }

      const totalMealsResult = totalMeals[0]

      return totalMealsResult
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot view meals information at this time.' })
    }
  })

  // GET number of compliant meals for current user by userID /all/diet-compliant/:userId
  app.get('/all/diet-compliant/:userId', async (request, reply) => {
    try {
      const userIdParamsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = userIdParamsSchema.parse(request.params)

      const compliantMeals = await knex('meals')
        .where('user_id', userId)
        .where('diet_compliance', 1)

      if (!compliantMeals) {
        return reply.status(404).send({ message: 'User ID does not exist.' })
      }

      return compliantMeals
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot view meals information at this time.' })
    }
  })

  // GET number of non-compliant meals for current user by userID /all/diet-non-compliant/:userId
  app.get('/all/diet-non-compliant/:userId', async (request, reply) => {
    try {
      const userIdParamsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = userIdParamsSchema.parse(request.params)

      const nonCompliantMeals = await knex('meals')
        .where('user_id', userId)
        .where('diet_compliance', 0)

      if (!nonCompliantMeals) {
        return reply.status(404).send({ message: 'User ID does not exist.' })
      }

      return nonCompliantMeals
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot view meals information at this time.' })
    }
  })

  // GET longest streak of consecutive diet-compliant meals by userID /streak/:userId
  app.get('/streak/:userId', async (request, reply) => {
    try {
      const userIdParamsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = userIdParamsSchema.parse(request.params)

      const allMealsComplianceStatuses = await knex('meals')
        .select('diet_compliance')
        .where('user_id', userId)

      if (!allMealsComplianceStatuses) {
        return reply.status(404).send({ message: 'Information not found.' })
      }

      const array = allMealsComplianceStatuses.map((object) => {
        return object.diet_compliance
      })

      function streakGenerator(array) {
        let streak = 0
        let currentStreak = 0

        array.forEach((element) => {
          if (element === 1) {
            currentStreak++
            streak = Math.max(streak, currentStreak)
          } else {
            currentStreak = 0
          }
        })
        return streak
      }

      // console.log(array)

      const longestStreak = streakGenerator(array)

      return longestStreak
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot retrieve longest streak at this time.' })
    }
  })
}
