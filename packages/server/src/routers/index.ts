import { publicProcedure, router } from '../trpc';
import { authRouter } from './auth';

/**
 * Main app router
 */
export const appRouter = router({
  helloWorld: publicProcedure.query(() => {
    return {
      message: 'Hello from tRPC!',
      timestamp: new Date().toISOString(),
    };
  }),
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
