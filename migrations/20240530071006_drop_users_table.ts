import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.text('username').notNullable().unique()
    table.text('email').notNullable().unique()
    table.text('password').notNullable().unique()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}
