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
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 tRPC Server running`);
  console.log('='.repeat(60));
  console.log(`  Environment: ${config.environment}`);
  console.log(`  Port: ${PORT}`);
  console.log(`  tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
