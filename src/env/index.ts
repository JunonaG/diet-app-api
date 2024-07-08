import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.string().default('3333'),
  DATABASE_CLIENT: z.enum(['pg', 'sqlite3']),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error(_env.error)
  throw new Error('Environment variables have not been set correctly.')
}

export const env = _env.data
