/**
 * Server package exports
 * Export types and utilities for use in other packages (like webapp)
 */

// Export the AppRouter type for tRPC client setup
export type { AppRouter } from './routers';

// Export context type if needed by clients
export type { Context } from './trpc';
