import { z } from 'zod';
import bcrypt from 'bcrypt';
import { router, publicProcedure } from '../trpc';
import { authService } from '@ddc/db';

/**
 * Auth router
 * Handles user authentication and management
 */
export const authRouter = router({
  /**
   * Register a new user
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await authService.findUserByEmail(input.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await authService.createUser({
        email: input.email,
        passwordHash,
        name: input.name,
      });

      // Return user without password
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };
    }),

  /**
   * Login user
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Find user
      const user = await authService.findUserByEmail(input.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await authService.updateLastLogin(user.id);

      // Return user without password
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        lastLoginAt: new Date(),
      };
    }),

  /**
   * Get user by ID
   */
  getUser: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const user = await authService.findUserById(input.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Return user without password
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      };
    }),

  /**
   * List all active users
   */
  listUsers: publicProcedure.query(async () => {
    const users = await authService.listActiveUsers();

    // Return users without passwords
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));
  }),

  /**
   * Update user
   */
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        email: z.string().email().optional(),
        password: z.string().min(8).optional(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, password, ...updateData } = input;

      // Hash password if provided
      let passwordHash: string | undefined;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      const user = await authService.updateUser(id, {
        ...updateData,
        ...(passwordHash && { passwordHash }),
      });

      // Return user without password
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        updatedAt: user.updatedAt,
      };
    }),

  /**
   * Deactivate user
   */
  deactivateUser: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const user = await authService.deactivateUser(input.id);

      return {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      };
    }),

  /**
   * Activate user
   */
  activateUser: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const user = await authService.activateUser(input.id);

      return {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      };
    }),
});
