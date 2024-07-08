// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { knex } from 'knex'

declare module 'knex/types/tables' {
  interface Users {
    id: string
    username: string
    email: string
    password: string
    created_at: Date
  }

  interface Meals {
    id: string
    user_id: string
    created_at: Date
    title: string
    description: string
    date_time_consumed: Date
    diet_compliance: boolean
    session_id: string
  }

  interface Tables {
    users: Users
    meals: Meals
  }
}
