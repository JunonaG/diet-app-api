import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.integer('user_id').notNullable().unsigned()
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.text('title').notNullable()
    table.text('description').notNullable()
    table.timestamp('date_time_consumed').defaultTo(knex.fn.now())
    table.boolean('diet_compliance').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('meals')
}
