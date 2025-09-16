import knex from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: isTest ? process.env.TEST_DB_NAME : process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations',
    extension: 'ts',
  },
};

export const db = knex(config);

export default db;
