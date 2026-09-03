# 🚀 FAM WHEEL – How to Run the Backend

## Step 1: Open Terminal in `server` folder

Right-click the `server` folder → "Open in Terminal"  
OR in PowerShell/CMD:
```
cd "C:\Users\hp\OneDrive\Desktop\Project\FAM_WHEEL_2.0\server"
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs: Express, Prisma, bcryptjs, jsonwebtoken, socket.io, cors, dotenv, etc.

---

## Step 3: Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

This creates the SQLite database file at `server/famwheel.db` with all tables.

---

## Step 4: Seed Demo Data

```bash
node src/prisma/seed.js
```

This fills the database with:
- 5 demo users (farmer, buyer, transport, admin, extra farmers)
- 10+ crop listings
- Sample orders, offers, messages, reviews, market prices

---

## Step 5: Start the Server

```bash
npm run dev
```

You'll see:
```
🚜  FAM WHEEL API Server Started!
🌐 Server  : http://localhost:5000
🗄️  Database: SQLite (famwheel.db)
📡 Socket  : Socket.IO enabled
```

---

## Step 6: Test the API

Open browser or Postman:

| URL | What it does |
|-----|-------------|
| http://localhost:5000 | API docs |
| http://localhost:5000/api/health | Health check |
| POST http://localhost:5000/api/auth/login | Login |
| GET http://localhost:5000/api/crops | All crops (public) |
| GET http://localhost:5000/api/market-prices | Market prices |

### Quick Login Test (Postman / Thunder Client):
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{ "email": "farmer@demo.com", "password": "demo123" }
```

---

## All API Endpoints

### 🔐 Auth
| Method | URL | Auth? |
|--------|-----|-------|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| GET | /api/auth/me | ✅ JWT |
| POST | /api/auth/logout | ✅ JWT |
| POST | /api/auth/change-password | ✅ JWT |

### 🌾 Crops
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/crops | No |
| GET | /api/crops/:id | No |
| GET | /api/crops/farmer/my | ✅ FARMER |
| POST | /api/crops | ✅ FARMER |
| PUT | /api/crops/:id | ✅ FARMER |
| DELETE | /api/crops/:id | ✅ FARMER |

### 📦 Orders
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/orders | ✅ JWT |
| GET | /api/orders/:id | ✅ JWT |
| GET | /api/orders/stats/summary | ✅ JWT |
| POST | /api/orders | ✅ BUYER |
| PATCH | /api/orders/:id/status | ✅ JWT |

### 🤝 Offers
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/offers | ✅ JWT |
| POST | /api/offers | ✅ BUYER |
| PATCH | /api/offers/:id/respond | ✅ FARMER |

### 💬 Messages
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/messages/conversations | ✅ JWT |
| GET | /api/messages/unread/count | ✅ JWT |
| GET | /api/messages/:partnerId | ✅ JWT |
| POST | /api/messages | ✅ JWT |

### 🚚 Transport
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/transport | ✅ JWT |
| GET | /api/transport/:id | ✅ JWT |
| POST | /api/transport | ✅ JWT |
| PATCH | /api/transport/:id/bid | ✅ TRANSPORT |
| PATCH | /api/transport/:id/status | ✅ JWT |

### 🚛 Providers
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/providers | ✅ JWT |
| GET | /api/providers/me | ✅ TRANSPORT |
| POST | /api/providers/register | ✅ TRANSPORT |
| PUT | /api/providers/me | ✅ TRANSPORT |

### 🔔 Notifications
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/notifications | ✅ JWT |
| PATCH | /api/notifications/read-all | ✅ JWT |
| PATCH | /api/notifications/:id/read | ✅ JWT |
| DELETE | /api/notifications/:id | ✅ JWT |

### 📊 Market Prices
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/market-prices | No |
| GET | /api/market-prices/:id | No |
| POST | /api/market-prices | ✅ ADMIN |
| PUT | /api/market-prices/:id | ✅ ADMIN |
| DELETE | /api/market-prices/:id | ✅ ADMIN |

### ⭐ Reviews
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/reviews/:userId | No |
| POST | /api/reviews | ✅ JWT |

### 👥 Users
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/users/profile | ✅ JWT |
| PUT | /api/users/profile | ✅ JWT |
| GET | /api/users/:id | No |
| GET | /api/users | ✅ ADMIN |
| PATCH | /api/users/:id/verify | ✅ ADMIN |
| PATCH | /api/users/:id/deactivate | ✅ ADMIN |

### 👨‍💼 Admin
| Method | URL | Auth? |
|--------|-----|-------|
| GET | /api/admin/stats | ✅ ADMIN |
| GET | /api/admin/users | ✅ ADMIN |
| PATCH | /api/admin/users/:id/verify | ✅ ADMIN |
| PATCH | /api/admin/users/:id/toggle-active | ✅ ADMIN |
| GET | /api/admin/orders | ✅ ADMIN |
| GET | /api/admin/crops | ✅ ADMIN |
| DELETE | /api/admin/crops/:id | ✅ ADMIN |

---

## How JWT Works

1. Login → server returns `{ token: "eyJ..." }`
2. Store token
3. Send in every protected request: `Authorization: Bearer eyJ...`

---

## Database

View your data visually:
```bash
npx prisma studio
```
Opens at http://localhost:5555

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👨‍🌾 Farmer | farmer@demo.com | demo123 |
| 🛒 Buyer | buyer@demo.com | demo123 |
| 🚚 Transport | transport@demo.com | demo123 |
| 👨‍💼 Admin | admin@demo.com | admin123 |
