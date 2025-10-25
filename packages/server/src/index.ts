import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { getConfig } from '@ddc/config';
import { appRouter } from './routers';
import { createContext } from './trpc';

// Load configuration
const config = getConfig();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server
app.listen(config.server.port, () => {
  console.log('='.repeat(60));
  console.log(`🚀 tRPC Server running`);
  console.log('='.repeat(60));
  console.log(`  Environment: ${config.environment}`);
  console.log(`  Port: ${config.server.port}`);
  console.log(`  tRPC endpoint: http://localhost:${config.server.port}/trpc`);
  console.log(`  Health check: http://localhost:${config.server.port}/health`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
