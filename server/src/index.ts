import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { config } from './config/env.js';
import { bootstrap } from './seed/bootstrap.js';

async function main(): Promise<void> {
  await connectDatabase();
  if (config.autoSeed) {
    await bootstrap();
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}/api/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[api] ${signal} — shutting down`);
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[api] failed to start', err);
  process.exit(1);
});
