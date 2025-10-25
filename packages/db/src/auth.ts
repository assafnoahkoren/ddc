import { prisma } from './index';
import type { User } from './_generated/client';

/**
 * User creation data
 */
export interface CreateUserData {
  email: string;
  passwordHash: string;
  name?: string;
}

/**
 * User update data
 */
export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  name?: string;
  isActive?: boolean;
}

/**
 * Auth Service
 * Handles all user authentication and management operations
 */
export class AuthService {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
      },
    });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * List all active users
   */
  async listActiveUsers(): Promise<User[]> {
    return prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List all users (active and inactive)
   */
  async listAllUsers(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Count total users
   */
  async countUsers(): Promise<number> {
    return prisma.user.count();
  }

  /**
   * Count active users
   */
  async countActiveUsers(): Promise<number> {
    return prisma.user.count({
      where: { isActive: true },
    });
  }

  /**
   * Validate user exists and is active
   * Note: Password verification should be done with bcrypt/argon2 in the calling code
   */
  async validateUserExists(email: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }
}

/**
 * Export singleton instance
 */
export const authService = new AuthService();
