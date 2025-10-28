import { publicProcedure, router } from '../trpc';
import { authRouter } from './auth';
import { integrationsRouter } from './integrations.router';
import { logicalSchemasRouter } from './logical-schemas.router';

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
  logicalSchemas: logicalSchemasRouter,
});

export type AppRouter = typeof appRouter;
