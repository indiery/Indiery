import { Server } from 'socket.io';
import admin from '../config/firebase.js';
import env from '../config/env.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Order from '../models/Order.js';
import logger from '../utils/logger.js';

let io = null;

/**
 * Rooms:
 *   user:<userId>     - personal room
 *   driver:<driverId> - driver's room
 *   order:<orderId>   - per-order room (live tracking)
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: env.CORS_ORIGIN, methods: ['GET', 'POST'] },
    pingTimeout: 60000,
  });

  // Auth handshake — Firebase ID token in handshake.auth.token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid });
      if (!user) return next(new Error('User not registered'));

      socket.userId = user._id.toString();
      socket.userRole = user.role;

      if (user.role === 'driver') {
        const driver = await Driver.findOne({ user: user._id });
        if (driver) socket.driverId = driver._id.toString();
      }

      next();
    } catch (err) {
      logger.error(`Socket auth error: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user=${socket.userId}, role=${socket.userRole})`);

    socket.join(`user:${socket.userId}`);
    if (socket.driverId) socket.join(`driver:${socket.driverId}`);

    socket.on('join_order', async ({ orderId }) => {
      try {
        const order = await Order.findOne({ orderId });
        if (!order) return socket.emit('error', { message: 'Order not found' });

        const isCustomer = order.customer.toString() === socket.userId;
        const isDriver =
          socket.driverId && order.driver?.toString() === socket.driverId;
        if (!isCustomer && !isDriver) {
          return socket.emit('error', { message: 'Not authorized for this order' });
        }

        socket.join(`order:${orderId}`);
        socket.emit('joined_order', { orderId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Driver pushes live location during a trip
    socket.on('driver_location', async ({ orderId, lng, lat }) => {
      if (socket.userRole !== 'driver') return;
      if (typeof lng !== 'number' || typeof lat !== 'number') return;
      try {
        await Driver.findByIdAndUpdate(socket.driverId, {
          currentLocation: { type: 'Point', coordinates: [lng, lat] },
          lastLocationUpdate: new Date(),
        });
        if (orderId) {
          io.to(`order:${orderId}`).emit('driver_location', {
            orderId,
            lng,
            lat,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        logger.error(`driver_location error: ${err.message}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Emit helpers used by controllers
export const emitToOrder = (orderId, event, payload) => {
  if (io) io.to(`order:${orderId}`).emit(event, payload);
};

export const emitToDriver = (driverId, event, payload) => {
  if (io) io.to(`driver:${driverId}`).emit(event, payload);
};

export const emitToCustomer = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};