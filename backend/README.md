# WorkVault — Backend & Database Phase

REST API for the WorkVault freelance marketplace with escrow-style deal workflow, powered by **Node.js, Express, MongoDB, and Mongoose**.

---

## Architecture

```
backend/
  src/
    config/         → Environment configuration & MongoDB Atlas connection
    models/         → Mongoose models (User, Service, Deal, Transaction, Dispute, Review)
    controllers/    → Request handlers (async/await)
    middleware/     → Auth (JWT), role, validation, Mongoose error handling
    routes/         → Express route definitions
    services/       → Database query & business logic layer
    scripts/        → Seed script with realistic Indian users and verified service images
    validators/     → express-validator rules
    utils/          → JWT, password hashing, standard JSON response helpers
    app.js          → Express app setup & route registration
    server.js       → Server entry point with pre-flight database connection
  tests/
    apiTest.js      → End-to-end API test suite
```

---

## 1. MongoDB Atlas Setup

To connect WorkVault to MongoDB Atlas in the cloud:

1. **Sign Up / Log In**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. **Build a Cluster**: Select the free **M0 Sandbox** cluster (shared).
3. **Database Access**:
   - Go to **Security → Database Access**.
   - Click **Add New Database User**.
   - Create a username and strong password (e.g. `workvault_user`).
   - Grant role: `Read and write to any database`.
4. **Network Access**:
   - Go to **Security → Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. **Get Connection String**:
   - Click **Connect** on your Database Deployment page.
   - Choose **Drivers (Node.js)**.
   - Copy your connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/workvault?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database credentials.
   - Add this URL to your `.env` file under `MONGODB_URI`.

---

## 2. Environment Variables

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable      | Example / Default Value                                      | Description                                                                          |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `PORT`        | `5000`                                                       | Express API server port                                                              |
| `MONGODB_URI` | `mongodb+srv://...` or `mongodb://127.0.0.1:27017/workvault` | MongoDB connection URI                                                               |
| `MONGO_URI`   | `mongodb://127.0.0.1:27017/workvault`                        | Alternate fallback URI                                                               |
| `JWT_SECRET`  | required in production                                       | Secret key for signing auth tokens; never use the development fallback in production |
| `CLIENT_URL`  | `http://localhost:5173`                                      | Allowed CORS origin for frontend                                                     |
| `NODE_ENV`    | `development`                                                | Environment mode (`development`/`production`/`test`)                                 |

---

## 3. Installation Commands

```bash
# Navigate to backend directory
cd backend

# Install dependencies (Express, Mongoose, bcryptjs, jsonwebtoken, etc.)
npm install
```

---

## 4. Database Seed Command

The seed script creates realistic Indian talent profiles, 18+ services with valid Unsplash images, deals, escrow transactions, disputes, and reviews:

```bash
npm run seed
```

### Seed Accounts Created:

All accounts use password: `password123`

| Role           | Name          | Email                         | Notes                   |
| -------------- | ------------- | ----------------------------- | ----------------------- |
| **Admin**      | Rajesh Sharma | `admin@example.com`           | Platform superuser      |
| **Client**     | Aditya Sharma | `client@example.com`          | SaaS founder client     |
| **Client**     | Priya Patel   | `priya.patel@client.com`      | D2C eCommerce client    |
| **Client**     | Rohit Verma   | `rohit.verma@client.com`      | Digital Health client   |
| **Freelancer** | Vikram Singh  | `freelancer@example.com`      | Full-Stack / MERN dev   |
| **Freelancer** | Ananya Reddy  | `ananya.reddy@freelancer.com` | UI/UX specialist        |
| **Freelancer** | Karthik Nair  | `karthik.nair@freelancer.com` | Mobile dev (Flutter/RN) |
| **Freelancer** | Sneha Gupta   | `sneha.gupta@freelancer.com`  | SEO & Performance Mktg  |
| **Freelancer** | Arjun Mehta   | `arjun.mehta@freelancer.com`  | Brand & Video Creator   |

---

## 5. Running the Backend

```bash
# Development mode with automatic reload on changes
npm run dev

# Production start
npm start
```

The server verifies the MongoDB connection before starting and logs:

```
✅ MongoDB Connected: cluster0... / Database: workvault
```

---

## 6. Available API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` — Register new client or freelancer
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET  /api/auth/me` — Get authenticated user profile (`Bearer <token>`)

### Users (`/api/users`)

- `GET  /api/users/:id` — Get public profile by user ID
- `PUT  /api/users/:id` — Update own profile (`Bearer <token>`)
- `GET  /api/users/:id/services` — Get all services created by freelancer
- `GET  /api/users/:id/reviews` — Get all reviews received by freelancer

### Services (`/api/services`)

- `GET    /api/services` — Search & list services (supports `search`, `category`, `minPrice`, `maxPrice`, `rating`, `sort`, `page`, `limit`)
- `GET    /api/services/:id` — Get single service with freelancer details
- `POST   /api/services` — Create a new service (Freelancer only)
- `PUT    /api/services/:id` — Update existing service (Owner only)
- `DELETE /api/services/:id` — Delete service (Owner or Admin)

### Deals (`/api/deals`)

- `GET    /api/deals` — List user's deals
- `GET    /api/deals/:id` — Get deal details
- `POST   /api/deals` — Create deal (Client only)
- `PUT    /api/deals/:id/status` — Transition deal state (`CREATED → FUNDED → IN_PROGRESS → SUBMITTED → APPROVED → RELEASED`)
- `POST   /api/deals/:id/submit` — Submit deliverable (Freelancer only)
- `POST   /api/deals/:id/approve` — Approve deliverable (Client only)
- `POST   /api/deals/:id/cancel` — Cancel deal

### Transactions (`/api/transactions`)

- `GET    /api/transactions` — Get user's transactions
- `GET    /api/transactions/:id` — Get transaction by ID
- `POST   /api/transactions` — Initialize escrow transaction (Client only)
- `POST   /api/transactions/:id/fund` — Fund escrow transaction (`PENDING → HELD`)
- `POST   /api/transactions/:id/release` — Release funds to freelancer (`HELD → RELEASED`)
- `POST   /api/transactions/:id/refund` — Refund escrow funds to client (Admin only)

### Disputes (`/api/disputes`)

- `GET    /api/disputes` — List disputes for user
- `GET    /api/disputes/:id` — Get dispute details
- `POST   /api/disputes` — Open a dispute on a deal
- `PUT    /api/disputes/:id/status` — Admin update dispute status (`OPEN → UNDER_REVIEW → RESOLVED`)

### Reviews (`/api/reviews`)

- `GET    /api/reviews/service/:serviceId` — Get all reviews for a specific service
- `GET    /api/reviews/:userId` — Get reviews for a freelancer
- `POST   /api/reviews` — Client submits review on completed deal

### Admin (`/api/admin`)

- `GET    /api/admin/users` — List all registered users
- `GET    /api/admin/services` — List all platform services
- `GET    /api/admin/deals` — List all deals
- `GET    /api/admin/transactions` — List all platform transactions
- `GET    /api/admin/disputes` — List all platform disputes
- `PUT    /api/admin/disputes/:id/resolve` — Admin dispute resolution & deal action
