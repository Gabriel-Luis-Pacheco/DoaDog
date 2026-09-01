import { config } from './config/env';
import { app } from './app';
import { prisma } from './lib/prisma';

const server = app.listen(config.PORT, () => {
  console.log(`DoaDog backend running on http://localhost:${config.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
