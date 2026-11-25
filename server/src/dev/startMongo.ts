/**
 * Dev-only local database.
 *
 * Downloads and runs a real `mongod` on 127.0.0.1:27017 with a persistent data
 * directory (server/.data/mongo), so the demo behaves like a normal install.
 * Production should use MongoDB Atlas.
 *
 *   npm run dev:db     (keep running, then npm run dev)
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../.data/mongo');
const PORT = Number(process.env.DEV_DB_PORT ?? 27017);

fs.mkdirSync(dbPath, { recursive: true });

async function main(): Promise<void> {
  const server = await MongoMemoryServer.create({
    instance: {
      port: PORT,
      dbName: 'vanilla-smiles',
      storageEngine: 'wiredTiger',
      dbPath,
    },
    binary: {
      version: process.env.DEV_MONGOD_VERSION ?? '7.0.14',
    },
  });

  console.log(`[db:dev] MongoDB running at ${server.getUri()}`);
  console.log(`[db:dev] Data directory: ${dbPath}`);
  console.log('[db:dev] Press Ctrl+C to stop.');

  const shutdown = async () => {
    console.log('\n[db:dev] stopping MongoDB…');
    await server.stop({ doCleanup: false });
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  await new Promise(() => undefined);
}

main().catch((err) => {
  console.error('[db:dev] failed to start local MongoDB:', err);
  process.exit(1);
});
