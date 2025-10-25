import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifyToken } from './utils/jwt';

/**
 * Create context for tRPC
 */
export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  return {
    req,
    res,
    token,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create();

/**
 * Middleware to verify JWT token
 */
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No token provided',
    });
  }

  try {
    const decoded = verifyToken(ctx.token);

    // Add user info to context
    return next({
      ctx: {
        ...ctx,
        user: {
          userId: decoded.userId,
          email: decoded.email,
        },
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
