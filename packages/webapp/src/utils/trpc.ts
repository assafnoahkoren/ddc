import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@ddc/server';

/**
 * tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();
