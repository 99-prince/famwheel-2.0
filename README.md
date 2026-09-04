# 🚜 FAM WHEEL 2.0 — Full-Stack Agricultural Marketplace

> India's smartest platform connecting Farmers, Buyers, and Transport Providers

---

## 📁 Project Structure

```
FAM_WHEEL_2.0/
│
├── 📂 client/              ← React Frontend (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/     ← Sidebar, Header, Layout
│   │   ├── pages/          ← All 11 pages (Dashboard, Marketplace, etc.)
│   │   ├── lib/            ← API client, Socket.IO, utilities
│   │   ├── store/          ← Zustand auth & UI state
│   │   └── types/          ← TypeScript type definitions
│   └── package.json
│
├── 📂 server/              ← Node.js Backend (Express + Prisma + Socket.IO)
│   ├── prisma/
│   │   └── schema.prisma   ← Database schema (all models)
│   ├── src/
│   │   ├── index.js        ← Express + Socket.IO server entry
│   │   ├── routes/         ← auth, crops, orders, offers, messages, transport...
│   │   ├── middleware/      ← JWT authentication middleware
│   │   └── prisma/
│   │       └── seed.js     ← Demo data seed script
│   └── package.json
│
├── 📂 (Original HTML version – still works!)
│   ├── index.html          ← Landing page
│   ├── login.html, register.html, dashboard.html, marketplace.html
│   ├── orders.html, offers.html, messages.html, transport.html
│   ├── market-prices.html, notifications.html, profile.html, my-listings.html
│
├── SETUP.bat               ← 🚀 One-click full setup (Windows)
├── START.bat               ← ▶️  One-click start both servers
└── README.md
```

---

## 🚀 Quick Start (Full-Stack Version)

### Prerequisites
- [Node.js](https://nodejs.org) v18+ installed
- Git (optional)

### Step 1 — Setup (Run Once)
```batch
# Double-click SETUP.bat, OR run in terminal:
cd C:\Users\hp\OneDrive\Desktop\Project\FAM_WHEEL_2.0
.\SETUP.bat
```

This will:
1. Install all npm packages (server + client)
2. Generate Prisma client
3. Initialize the configured PostgreSQL database
4. Seed demo data

### Step 2 — Start Development Servers
```batch
# Double-click START.bat, OR run in two terminals:

# Terminal 1 — Backend (after configuring PostgreSQL and SMTP)
cd server
npm run dev        # → http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev        # → http://localhost:5173
```

### Step 3 — Open Browser
```
http://localhost:5173
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👨‍🌾 Farmer | farmer@demo.com | demo123 |
| 🛒 Buyer | buyer@demo.com | demo123 |
| 🚚 Transport | transport@demo.com | demo123 |
| 👨‍💼 Admin | admin@demo.com | admin123 |

---

## 🛠️ Tech Stack

### Frontend (client/)
| Technology | Purpose |
|-----------|---------|
| ⚡ Vite | Build tool & dev server |
| ⚛️ React 18 | UI framework |
| 🟦 TypeScript | Type safety |
| 🎨 Tailwind CSS | Utility-first styling |
| 🔄 React Query | Server state management |
| 🐻 Zustand | Client state (auth, UI) |
| 🌐 React Router v6 | Client-side routing |
| 📡 Socket.IO Client | Real-time chat |
| 🔥 React Hot Toast | Notifications |
| 📦 Axios | HTTP client |

### Backend (server/)
| Technology | Purpose |
|-----------|---------|
| 🟢 Node.js | Runtime |
| 🚂 Express.js | Web framework |
| 🗄️ Prisma ORM | Database access |
| 🗃️ SQLite | Local database (swap to PostgreSQL for prod) |
| 🔐 JWT | Authentication |
| 🔒 bcryptjs | Password hashing |
| 📡 Socket.IO | Real-time WebSocket server |
| 🌐 CORS | Cross-origin requests |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/crops` | ❌ | List crops (searchable) |
| POST | `/api/crops` | ✅ FARMER | Create listing |
| PUT | `/api/crops/:id` | ✅ FARMER | Update listing |
| DELETE | `/api/crops/:id` | ✅ FARMER | Delete listing |
| GET | `/api/orders` | ✅ | Get my orders |
| POST | `/api/orders` | ✅ BUYER | Create order |
| PATCH | `/api/orders/:id/status` | ✅ | Update status |
| GET | `/api/offers` | ✅ | Get my offers |
| POST | `/api/offers` | ✅ BUYER | Make offer |
| PATCH | `/api/offers/:id/respond` | ✅ FARMER | Accept/reject/counter |
| GET | `/api/messages/conversations` | ✅ | All conversations |
| GET | `/api/messages/:partnerId` | ✅ | Message thread |
| POST | `/api/messages` | ✅ | Send message |
| GET | `/api/transport` | ✅ | Transport requests |
| POST | `/api/transport` | ✅ | Create request |
| PATCH | `/api/transport/:id/bid` | ✅ TRANSPORT | Place bid |
| GET | `/api/notifications` | ✅ | Get notifications |
| GET | `/api/market-prices` | ❌ | Live mandi prices |
| GET | `/api/users/profile` | ✅ | My profile |
| PUT | `/api/users/profile` | ✅ | Update profile |

---

## 🗄️ Database Schema

Models: **User**, **Crop**, **Order**, **Offer**, **Message**, **Review**, **Notification**, **TransportRequest**, **TransportProvider**, **MarketPrice**

To view the database visually:
```bash
cd server
npx prisma studio     # Opens at http://localhost:5555
```

---

## 🚀 Upgrading to Production

### Switch to PostgreSQL
1. Create a PostgreSQL database
2. Update `server/.env` with your self-hosted connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/famwheel_db"
   ```
3. The schema is already configured for PostgreSQL.
4. Run: `cd server && npx prisma migrate deploy` (or `npx prisma db push` for first-time setup).

### Payments and email verification
- `POST /api/payments/intent` creates a provider-neutral payment intent for a buyer order.
- A real gateway should call `POST /api/payments/webhook` with `x-payment-signature`.
- Configure `PAYMENT_WEBHOOK_SECRET` before accepting webhooks.
- `POST /api/verification/request` sends a six-digit email OTP through SMTP.
- `POST /api/verification/confirm` verifies the OTP; configure SMTP variables in `server/.env`.

### Deploy
| Service | What |
|---------|------|
| [Vercel](https://vercel.com) | Deploy `client/` (React frontend) |
| [Railway](https://railway.app) | Deploy `server/` + PostgreSQL |
| [Render](https://render.com) | Alternative to Railway |
| [Supabase](https://supabase.com) | Managed PostgreSQL + Auth |

### Render deployment
The repository includes [`render.yaml`](./render.yaml) for a Render Blueprint. In Render, choose **New > Blueprint** and select this repository. Before deploying, add SMTP and Cloudinary environment variables to `famwheel-api`; Render generates the database URL and JWT/payment secrets from the blueprint.

### Production configuration checklist
1. Set `NODE_ENV=production` and configure every variable in `server/.env.example`.
2. Set `VITE_API_URL` in `client/.env` to the public HTTPS API URL when the API is hosted separately.
3. Run `npm run build:client` and serve `client/dist` over HTTPS.
4. Run `npm run --prefix server db:push` against the production database before starting the server.
5. Start the API with `npm run start:server`; verify `/api/health`.
6. Configure HTTPS termination, PostgreSQL backups, log collection, and payment/SMTP webhooks.

---

## 📚 Learning Roadmap (What to Learn Next)

To become a full-stack developer, learn these in order:

1. **HTML + CSS + JavaScript** ✅ (Done!)
2. **React.js** — Components, hooks, state
3. **TypeScript** — Type safety for JS
4. **Node.js + Express** — Backend APIs
5. **Databases** — PostgreSQL + Prisma ORM
6. **Authentication** — JWT, sessions, OAuth
7. **Real-time** — Socket.IO, WebSockets
8. **Deployment** — Vercel, Railway, Docker
9. **Testing** — Jest, React Testing Library
10. **Git + GitHub** — Version control

---

## 🙌 Credits

Built with ❤️ for Indian farmers using pure modern web technologies.

**"From Farm to Market, Without the Hassle."** 🌾
