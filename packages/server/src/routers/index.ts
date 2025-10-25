import { router } from '../trpc';
import { authRouter } from './auth';

/**
 * Main app router
 */
export const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
