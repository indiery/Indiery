# Indiery Phase 1 — MVP Intracity Core

Lucknow launch · 10–14 weeks · 4–6 developers

## Project Structure

```
indiery-phase1/
├── apps/
│   ├── customer/        # React Native (Expo) — Customer App
│   └── driver/          # React Native (Expo) — Driver App
├── backend/             # Node.js (Express) — API Server
├── admin/               # React — Admin Panel
└── shared/              # Shared types & utilities
```

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env       # fill in your credentials
npm install
npm run dev                # http://localhost:4000
```

### 2. Customer App
```bash
cd apps/customer
npm install
npx expo start
```

### 3. Driver App
```bash
cd apps/driver
npm install
npx expo start
```

### 4. Admin Panel
```bash
cd admin
npm install
npm run dev                # http://localhost:3001
```

## Environment Variables (backend/.env)

| Key | Description |
|-----|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `FIREBASE_PROJECT_ID` | Firebase project |
| `FIREBASE_SERVICE_ACCOUNT` | JSON path or base64 |
| `RAZORPAY_KEY_ID` | Razorpay key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `AWS_S3_BUCKET` | S3 bucket for POD photos |
| `GOOGLE_MAPS_API_KEY` | Maps + Places + Distance Matrix |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging |
| `JWT_SECRET` | JWT signing secret |

## Phase 1 Deliverables

- ✅ Customer app: booking, live tracking, payment, order history
- ✅ Driver app: KYC, order feed, POD camera, earnings
- ✅ Backend: order state machine, driver matching, GPS relay
- ✅ Payments: Razorpay (UPI / card / net banking)
- ✅ POD: pickup + drop photos stored in S3
- ✅ Push notifications via FCM
- ✅ Admin panel: KYC approval, order monitoring
- ✅ Coin / late-delivery refund logic
- ✅ On-time bonus logic (5% reserve)
