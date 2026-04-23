require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const { initDB } = require('./db/pool');
const { initRedis } = require('./config/redis');
const { initWebSocket } = require('./services/websocket');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const pricingRoutes = require('./routes/pricing');
const driverRoutes = require('./routes/drivers');
const trackingRoutes = require('./routes/tracking');
const paymentRoutes = require('./routes/payments');
const podRoutes = require('./routes/pod');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pod', podRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await initDB();
  await initRedis();
  initWebSocket(server);
  server.listen(PORT, () => {
    console.log(`🚀 Indiery API running on port ${PORT}`);
  });
}

start().catch(console.error);
