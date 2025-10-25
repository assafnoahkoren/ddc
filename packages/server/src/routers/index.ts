import { publicProcedure, router } from '../trpc';
import { authRouter } from './auth';
import { integrationsRouter } from './integrations.router';

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
  integrations: integrationsRouter,
});

export type AppRouter = typeof appRouter;
