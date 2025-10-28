import { publicProcedure, router } from '../trpc';
import { authRouter } from './auth';
import { integrationsRouter } from './integrations.router';
import { logicalSchemasRouter } from './logical-schemas.router';
import { schemaMappingsRouter } from './schema-mappings.router';

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
  schemaMappings: schemaMappingsRouter,
});

export type AppRouter = typeof appRouter;
