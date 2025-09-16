import { Knex } from 'knex';
import { readFileSync } from 'fs';
import { join } from 'path';
import { hashPassword } from '../../utils/auth';

interface ProductionUser {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export async function seed(knex: Knex): Promise<void> {
  try {
    // Read production users from file
    const usersFilePath = join(__dirname, '../../../config/prod-users.json');
    const usersData = readFileSync(usersFilePath, 'utf8');
    const prodUsers: ProductionUser[] = JSON.parse(usersData);

    // Check if users already exist, if not - create them
    for (const userData of prodUsers) {
      const existingUser = await knex('users')
        .select('id')
        .where('email', userData.email)
        .first();

      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password);
        
        await knex('users').insert({
          email: userData.email,
          password_hash: hashedPassword,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
        });

        console.log(`Created production user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }
  } catch (error) {
    console.log('No production users file found or error reading it. Skipping user creation.');
    console.log('Create config/prod-users.json file with user data if needed.');
  }
}
