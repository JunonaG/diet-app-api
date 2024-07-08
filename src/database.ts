import { knex as setupKnex } from 'knex'
import { env } from './env'

export const config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  migrations: {
    extension: 'ts',
  },
  useNullAsDefault: true,
}

export const knex = setupKnex(config)
