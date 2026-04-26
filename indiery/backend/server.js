import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/sockets/trackingSocket.js';
import logger from './src/utils/logger.js';
import env from './src/config/env.js';

connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  logger.info(`🚀 Indiery API running on port ${env.PORT} [${env.NODE_ENV}]`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});