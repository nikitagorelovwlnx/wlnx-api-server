import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop users table since we only use email-based identification now
  // No more traditional user registration/authentication
  await knex.schema.dropTableIfExists('users');
}

export async function down(knex: Knex): Promise<void> {
  // Recreate users table in case we need to rollback
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.timestamps(true, true);
    
    table.index('email');
  });
}
