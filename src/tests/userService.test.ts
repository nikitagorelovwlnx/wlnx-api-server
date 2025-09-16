import { UserService } from '../services/userService';
import { db } from '../database/knex';

describe('UserService', () => {
  let userService: UserService;

  beforeAll(() => {
    userService = new UserService(db);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = await userService.createUser(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.user.first_name).toBe(userData.first_name);
      expect(result.user.last_name).toBe(userData.last_name);
      expect(result.token).toBeDefined();
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await userService.createUser(userData);

      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      await userService.createUser({
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login user with correct credentials', async () => {
      const result = await userService.loginUser('login@example.com', 'password123');

      expect(result.user.email).toBe('login@example.com');
      expect(result.token).toBeDefined();
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw error for invalid email', async () => {
      await expect(
        userService.loginUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        userService.loginUser('login@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const createResult = await userService.createUser({
        email: 'getuser@example.com',
        password: 'password123',
        first_name: 'Jane',
      });

      const user = await userService.getUserById(createResult.user.id);

      expect(user).toBeDefined();
      expect(user!.email).toBe('getuser@example.com');
      expect(user!.first_name).toBe('Jane');
      expect(user).not.toHaveProperty('password_hash');
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const createResult = await userService.createUser({
        email: 'update@example.com',
        password: 'password123',
      });

      const updatedUser = await userService.updateUser(createResult.user.id, {
        first_name: 'Updated',
        last_name: 'Name',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.first_name).toBe('Updated');
      expect(updatedUser!.last_name).toBe('Name');
    });

    it('should return null for non-existent user', async () => {
      const result = await userService.updateUser('non-existent-id', {
        first_name: 'Test',
      });
      expect(result).toBeNull();
    });
  });
});
