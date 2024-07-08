import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
// import { request } from 'https'
// import { checkIfSessionExists } from '../middleware/check-if-session-exists'

export async function userRoutes(app: FastifyInstance) {
  // GET account information for users
  app.get('/', async (request, reply) => {
    try {
      const users = await knex('users').select('*')
      return { users }
    } catch (error) {
      console.error(error)
      return reply.status(404).send({ message: 'Cannot retrieve users list.' })
    }
  })

  // GET account information by user id /:id
  app.get('/:id', async (request, reply) => {
    try {
      const getUserInfoByIdSchema = z.object({ id: z.string() })

      const { id } = getUserInfoByIdSchema.parse(request.params)

      const user = await knex('users').where('id', id).first()

      if (!user) {
        return { error: 'User not found' }
      }
      return user
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot retrieve specified user.' })
    }
  })

  // GET account information by user email /details/:email
  app.get('/details/:email', async (request, reply) => {
    try {
      const getUserInfoByEmailSchema = z.object({ email: z.string() })

      const { email } = getUserInfoByEmailSchema.parse(request.params)

      const user = await knex('users').where('email', email).first()

      if (!user) {
        return { error: 'User not found' }
      }
      return user
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot retrieve specified user by provided email.' })
    }
  })

  // POST create new account /newaccount
  app.post('/newaccount', async (request, reply) => {
    try {
      const createUserBodySchema = z.object({
        username: z.string(),
        email: z.string(),
        password: z.string(),
      })

      const { username, email, password } = createUserBodySchema.parse(
        request.body,
      )

      await knex('users').insert({
        id: randomUUID(),
        username,
        email,
        password,
      })
      return reply.status(201).send({ message: 'User account created.' })
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot create new account at this time.' })
    }
  })

  // DELETE account /account
  app.delete('/account', async (request, reply) => {
    try {
      const deleteUserByUsernameSchema = z.object({
        username: z.string(),
      })

      const { username } = deleteUserByUsernameSchema.parse(request.body)

      const response = await knex('users').where('username', username).del()
      console.log(response)

      return reply.status(202).send({ message: 'User deleted successfully.' })
    } catch (error) {
      console.error(error)
      return reply
        .status(404)
        .send({ message: 'Cannot delete user at this time.' })
    }
  })

  // PATCH edit account details-username using email validation /edit/username
  app.patch('/edit/username', async (request, reply) => {
    try {
      const editUsernameSchema = z.object({
        newUsername: z.string(),
        email: z.string(),
      })

      const { newUsername, email } = editUsernameSchema.parse(request.body)

      const usernameToUpdate = await knex('users').where('email', email).first()

      if (!usernameToUpdate) {
        return reply.status(404).send({ message: 'Username does not exist.' })
      }

      await knex('users')
        .where('id', usernameToUpdate.id)
        .update({ username: newUsername })
      return reply
        .status(202)
        .send({ message: 'Username updated successfully.' })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Failed to update username.' })
    }
  })

  // PATCH edit account details-new username using old username /edit/new-username
  app.patch('/edit/new-username', async (request, reply) => {
    try {
      const editUsernameSchema = z.object({
        currentUsername: z.string(),
        newUsername: z.string(),
      })

      const { currentUsername, newUsername } = editUsernameSchema.parse(
        request.body,
      )

      const user = await knex('users')
        .where('username', currentUsername)
        .first()

      if (!user) {
        return reply.status(404).send({ message: 'Username does not exist.' })
      }

      await knex('users')
        .where('username', user.username)
        .update({ username: newUsername })
      return reply
        .status(202)
        .send({ message: 'Username updated successfully.' })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Failed to update username.' })
    }
  })

  // PATCH edit account details-email using userID /edit/email/:id
  app.patch('/edit/email/:id', async (request, reply) => {
    try {
      const editEmailBodySchema = z.object({
        newEmail: z.string(),
      })

      const editEmailParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = editEmailParamsSchema.parse(request.params)
      const { newEmail } = editEmailBodySchema.parse(request.body)

      const user = await knex('users').where('id', id).first()
      if (!user) {
        return reply.status(404).send({ message: 'User ID does not exist.' })
      }

      await knex('users').where('id', user.id).update({ email: newEmail })
      return reply.status(202).send({ message: 'Email updated successfully.' })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Failed to update email.' })
    }
  })

  // PATCH edit account details-password using userID /edit/password/:id
  app.patch('/edit/password/:id', async (request, reply) => {
    try {
      const editPasswordBodySchema = z.object({
        newPassword: z.string(),
      })

      const editPasswordParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = editPasswordParamsSchema.parse(request.params)
      const { newPassword } = editPasswordBodySchema.parse(request.body)

      const user = await knex('users').where('id', id).first()
      if (!user) {
        return reply.status(404).send({ message: 'User ID does not exist.' })
      }

      await knex('users').where('id', user.id).update({ password: newPassword })
      return reply
        .status(202)
        .send({ message: 'Password updated successfully.' })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Failed to update password.' })
    }
  })
}
