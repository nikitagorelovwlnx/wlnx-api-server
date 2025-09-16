import { Knex } from 'knex';
import { User, CreateUserRequest, AuthResponse } from '../types';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async createUser(userData: CreateUserRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.db('users')
      .select('id')
      .where('email', userData.email)
      .first();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user
    const [user] = await this.db('users')
      .insert({
        id: uuidv4(),
        email: userData.email,
        password_hash,
        first_name: userData.first_name || null,
        last_name: userData.last_name || null,
      })
      .returning('*');

    const { password_hash: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async loginUser(email: string, password: string): Promise<AuthResponse> {
    const user = await this.db('users')
      .select('*')
      .where('email', email)
      .first();

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getUserById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.db('users')
      .select('id', 'email', 'first_name', 'last_name', 'created_at', 'updated_at')
      .where('id', id)
      .first();

    return user || null;
  }

  async updateUser(id: string, updates: Partial<Pick<User, 'first_name' | 'last_name'>>): Promise<Omit<User, 'password_hash'> | null> {
    const [updatedUser] = await this.db('users')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'created_at', 'updated_at']);

    return updatedUser || null;
  }
}
