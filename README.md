# FixItNow 🔧

> **Your Trusted Home Service Platform**

A production-ready REST API for a home services marketplace. Customers can browse services, book qualified technicians, and pay securely. Technicians manage their profiles and bookings. Admins oversee the entire platform.

---

## 🌐 Live URLs

| Resource               | URL                                             |
| ---------------------- | ----------------------------------------------- |
| **API Base**           | https://fixit-now-backend.vercel.app            |
| **API Docs (Swagger)** | https://fixit-now-backend.vercel.app/api-docs   |
| **Health Check**       | https://fixit-now-backend.vercel.app/api/health |

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Runtime    | Node.js                             |
| Framework  | Express.js (v5)                     |
| Language   | TypeScript                          |
| ORM        | Prisma (v7)                         |
| Database   | PostgreSQL (Prisma Postgres / Neon) |
| Auth       | JWT (HTTP-only cookies)             |
| Payment    | Stripe Checkout                     |
| Validation | Zod                                 |
| Bundler    | esbuild                             |
| Deployment | Vercel                              |

---

## 📁 Project Structure

```
FixItNow_Backend/
├── prisma/
│   ├── schema/          # Prisma schema files (split by model)
│   ├── migrations/      # Database migrations
│   └── seed.ts          # Database seeder
├── src/
│   ├── config/          # App config, Swagger spec
│   ├── lib/             # Prisma client, Stripe client
│   ├── middlewares/     # Auth, validation, error handler
│   ├── modules/
│   │   ├── auth/        # Register, login, profile
│   │   ├── admin/       # Admin operations
│   │   ├── booking/     # Booking CRUD
│   │   ├── category/    # Service categories
│   │   ├── payment/     # Stripe payments
│   │   ├── review/      # Customer reviews
│   │   ├── service/     # Service listings
│   │   └── technician/  # Technician management
│   ├── utils/           # Helpers (AppError, pagination, etc.)
│   ├── app.ts           # Express app
│   └── server.ts        # Entry point
├── dist/
│   └── server.mjs       # Production bundle
├── prisma.config.ts
├── vercel.json
└── .env.example
```

---

## 👥 Roles & Permissions

| Role           | Description          | Key Permissions                                 |
| -------------- | -------------------- | ----------------------------------------------- |
| **Customer**   | Books home services  | Browse services, create bookings, pay, review   |
| **Technician** | Service professional | Create services, manage bookings, complete jobs |
| **Admin**      | Platform moderator   | Manage users, bookings, categories              |

> Users select their role during registration. Admin is created via seed.

---

## 🚀 Local Setup

### Prerequisites

- Node.js v18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (or [Prisma Postgres](https://www.prisma.io/postgres) / [Neon](https://neon.tech))
- Stripe account (for payments)

### 1. Clone the repository

```bash
git clone https://github.com/hakimcolor/FixitNow_Backend.git
cd FixitNow_Backend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5001
NODE_ENV=development
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://user:password@host:5432/fixitnow?sslmode=require

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Generate Prisma client

```bash
npx prisma generate --config prisma.config.ts
```

### 5. Run database migrations

```bash
npx prisma migrate deploy --config prisma.config.ts
```

### 6. Seed the database

```bash
pnpm seed
```

This creates default users:

| Role       | Email                | Password    |
| ---------- | -------------------- | ----------- |
| Admin      | admin@gmail.com      | password123 |
| Customer   | customer@gmail.com   | password123 |
| Technician | technician@gmail.com | password123 |

### 7. Start development server

```bash
pnpm dev
```

API will be running at `http://localhost:5001`

---

## 📦 Build for Production

```bash
pnpm build
```

Output: `dist/server.mjs`

---

## 💳 Stripe Webhook (Local Testing)

To test payments locally, run the Stripe CLI in a separate terminal:

```bash
stripe listen --forward-to localhost:5001/api/payments/webhook
```

Copy the webhook signing secret and add it to `.env` as `STRIPE_WEBHOOK_SECRET`.

> **Without Stripe CLI:** After completing Stripe checkout, use the manual confirm endpoint:
>
> ```
> POST /api/payments/confirm
> Body: { "sessionId": "cs_test_..." }
> ```

---

## 📌 API Endpoints

### Authentication

| Method | Endpoint                   | Description                      | Auth     |
| ------ | -------------------------- | -------------------------------- | -------- |
| POST   | `/api/auth/register`       | Register (CUSTOMER / TECHNICIAN) | Public   |
| POST   | `/api/auth/login`          | Login, sets HTTP-only cookies    | Public   |
| GET    | `/api/auth/me`             | Get current user profile         | Any role |
| POST   | `/api/auth/logout`         | Logout, clears cookies           | Any role |
| POST   | `/api/auth/refresh-token`  | Refresh access token             | Public   |
| PATCH  | `/api/auth/update-profile` | Update profile                   | Any role |
| DELETE | `/api/auth/delete-account` | Delete account                   | Any role |

### Services & Technicians (Public)

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/api/services`        | All services (filterable)    |
| GET    | `/api/services/:id`    | Service details              |
| GET    | `/api/technicians`     | All technicians              |
| GET    | `/api/technicians/:id` | Technician profile + reviews |
| GET    | `/api/categories`      | All categories               |

### Bookings (Customer)

| Method | Endpoint                   | Description     |
| ------ | -------------------------- | --------------- |
| POST   | `/api/bookings`            | Create booking  |
| GET    | `/api/bookings`            | My bookings     |
| GET    | `/api/bookings/:id`        | Booking details |
| PATCH  | `/api/bookings/:id/cancel` | Cancel booking  |

### Payments (Customer)

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| POST   | `/api/payments/create`  | Create Stripe checkout session |
| POST   | `/api/payments/confirm` | Manually confirm payment       |
| GET    | `/api/payments`         | Payment history                |
| GET    | `/api/payments/:id`     | Payment details                |

### Technician Management

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| PUT    | `/api/technician/profile`      | Update profile        |
| PUT    | `/api/technician/availability` | Set availability      |
| GET    | `/api/technician/services`     | My services           |
| GET    | `/api/technician/bookings`     | My bookings           |
| PATCH  | `/api/technician/bookings/:id` | Update booking status |

### Admin

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| GET    | `/api/admin/users`          | All users        |
| PATCH  | `/api/admin/users/:id`      | Ban / Unban user |
| GET    | `/api/admin/bookings`       | All bookings     |
| GET    | `/api/admin/bookings/:id`   | Booking details  |
| GET    | `/api/admin/categories`     | All categories   |
| POST   | `/api/admin/categories`     | Create category  |
| PATCH  | `/api/admin/categories/:id` | Update category  |
| DELETE | `/api/admin/categories/:id` | Delete category  |
| GET    | `/api/admin/payments`       | All payments     |
| GET    | `/api/admin/payments/:id`   | Payment details  |

---

## 📊 Booking Status Flow

```
REQUESTED
   ├── ACCEPTED  ──→  PAID  ──→  IN_PROGRESS  ──→  COMPLETED
   │      └──→  DECLINED
   │      └──→  CANCELLED (by customer)
   └── CANCELLED (by customer)
```

> Customers can cancel at any point before `IN_PROGRESS`.

---

## 🗄️ Database Schema

| Table               | Description                                    |
| ------------------- | ---------------------------------------------- |
| `user`              | Users with roles (CUSTOMER, TECHNICIAN, ADMIN) |
| `TechnicianProfile` | Technician info linked to User                 |
| `Category`          | Service categories                             |
| `Service`           | Services offered by technicians                |
| `Booking`           | Job bookings                                   |
| `Payment`           | Stripe payment records                         |
| `Review`            | Customer reviews for completed jobs            |

---

## 🌍 Deployment (Vercel)

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

For Stripe webhooks on production, add this endpoint in [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

```
https://fixit-now-backend.vercel.app/api/payments/webhook
```

Events to listen:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`

---

## 👤 Default Credentials (After Seed)

```
Admin     → admin@gmail.com      / password123
Customer  → customer@gmail.com   / password123
Technician→ technician@gmail.com / password123
```

---

## 📄 License

ISC
