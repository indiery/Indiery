import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import env from './config/env.js';
import errorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import driverRoutes from './routes/driver.routes.js';
import orderRoutes from './routes/order.routes.js';
import pricingRoutes from './routes/pricing.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use(rateLimiter);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

const API = `/api/${env.API_VERSION}`;
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/drivers`, driverRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/pricing`, pricingRoutes);
app.use(`${API}/payments`, paymentRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

app.use(errorHandler);

export default app;