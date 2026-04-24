<div align="center">

<img src="ParkEasyMobile/assets/icon.png" alt="ParkEasy Logo" width="120" height="120" style="border-radius: 24px;" />

# ParkEasy

### A Production-Grade, Real-Time Smart Parking Management Platform

<p align="center">
  <strong>Dual-Role Mobile Application · Web Dashboard · RESTful API · Live Slot Tracking</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Web-orange?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo_SDK_54-0EA5E9?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL_17-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/ORM-Prisma_5-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Realtime-Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-0C2451?style=flat-square&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-node:20--slim-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed_on-Render.com-46E3B7?style=flat-square" />
</p>

---

**[📖 API Docs](https://parkeasy-backend-uy3x.onrender.com/api-docs)** · 
**[🏗 Architecture](./ARCHITECTURE.md)** · 
**[🗄 Database Schema](./DATABASE.md)** · 
**[📡 API Reference](./API.md)** · 
**[📱 Mobile Guide](./MOBILE.md)** · 
**[🚀 Deployment](./DEPLOYMENT.md)**

</div>

---

## 📋 Table of Contents

1. [Abstract](#1-abstract)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Core Features](#6-core-features)
7. [Repository Structure](#7-repository-structure)
8. [Database Design](#8-database-design)
9. [Security Architecture](#9-security-architecture)
10. [Real-Time Communication](#10-real-time-communication)
11. [Payment Processing](#11-payment-processing)
12. [API Overview](#12-api-overview)
13. [Mobile Application](#13-mobile-application)
14. [Web Dashboard](#14-web-dashboard)
15. [Deployment Infrastructure](#15-deployment-infrastructure)
16. [Getting Started](#16-getting-started)
17. [Environment Configuration](#17-environment-configuration)
18. [Background Jobs & Automation](#18-background-jobs--automation)
19. [Performance & Scalability Considerations](#19-performance--scalability-considerations)
20. [Known Limitations & Future Scope](#20-known-limitations--future-scope)
21. [Authors & Acknowledgements](#21-authors--acknowledgements)
22. [License](#22-license)

---

## 1. Abstract

ParkEasy is a full-stack, production-deployed smart parking management platform 
designed to address the critical problem of urban parking inefficiency in dense 
metropolitan environments. The system provides a dual-role mobile application 
(serving both parking customers and facility operators), a web-based management 
dashboard, and a RESTful HTTP API with WebSocket support for real-time data 
propagation.

The platform implements a multi-tier architecture: an Expo React Native mobile 
client (Android/iOS), a React + Vite web frontend, and a Node.js/Express 5 backend 
API server connected to a PostgreSQL 17 database via Prisma ORM on Supabase cloud 
infrastructure. Real-time parking slot state changes are pushed to all connected 
clients using Socket.io rooms. Payment processing is handled via Razorpay with 
server-side cryptographic signature verification. Authentication is implemented 
using a dual-token JWT system with SHA-256 hashed, rotating refresh tokens and 
database-level revocation.

The system is containerized using Docker and deployed on Render.com's cloud 
platform, with the database hosted on Supabase in the `ap-south-1` (Mumbai) region 
to minimize latency for Indian users. The mobile application uses Expo Application 
Services (EAS) for native Android APK builds and supports Over-The-Air (OTA) 
JavaScript updates via a GitHub Actions CI/CD pipeline.

---

## 2. Problem Statement

Urban parking in Indian cities — particularly Mumbai, Pune, Bengaluru, and Delhi — 
represents a significant logistical challenge. Key pain points identified include:

**2.1 Lack of Visibility**  
Drivers have no way to know whether a parking facility has available slots before 
arriving, leading to wasted time circling or queuing.

**2.2 Manual, Cash-Only Operations**  
Most parking facilities in India still operate via manual ticket issuance and 
cash collection, making the process slow, error-prone, and untrackable.

**2.3 No Digital Trail for Operators**  
Parking facility operators (providers) lack data on occupancy patterns, peak 
hours, revenue trends, and vehicle type distribution — data that could significantly 
improve facility management and pricing decisions.

**2.4 No Seat Reservation Mechanism**  
Users cannot reserve a slot in advance, meaning by the time they arrive, 
the slot they were counting on may already be occupied.

**2.5 Fragmented Ecosystem**  
There is no unified platform where a parking provider can onboard their facility 
digitally, manage it in real-time, and accept payments — all in one place.

ParkEasy directly addresses each of these pain points.

---

## 3. Proposed Solution

ParkEasy provides an end-to-end digital parking management ecosystem with the 
following key solution pillars:

**3.1 Real-Time Slot Awareness**  
Every connected client (mobile app or web) receives live slot status updates 
via WebSocket connections. When a slot is reserved, occupied, or freed, 
all viewers of that facility's page are notified within milliseconds.

**3.2 Digital Booking & Payments**  
Customers can discover, browse, reserve, and pay for parking slots entirely 
from their phone. Razorpay integration supports UPI, cards, wallets, and 
net banking — covering the broadest possible Indian payment method landscape.

**3.3 Dual-Role Platform**  
A single application serves two distinct user types. Customers discover and 
book parking. Providers onboard their facilities, manage slots, scan QR codes 
for vehicle verification, view analytics, and track earnings — all within 
the same mobile app via separate navigation stacks.

**3.4 QR Code Verification**  
Each confirmed booking generates a unique QR code ticket. Facility providers 
use the in-app QR scanner to verify vehicles on entry and exit without 
manual lookups.

**3.5 Monthly Passes**  
For regular parkers, the platform supports monthly pass purchases with 
per-vehicle-type pricing configured by each facility.

**3.6 Provider Analytics & Earnings**  
Providers have access to occupancy charts, revenue reports, booking history, 
and an earnings ledger with withdrawal request functionality.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│  ┌──────────────────────────┐    ┌──────────────────────────────┐   │
│  │    ParkEasyMobile        │    │     Web Frontend             │   │
│  │    Expo SDK 54 / RN 0.81 │    │     React 18 + Vite 6        │   │
│  │    Expo Router 6         │    │     TanStack Query v5        │   │
│  │    Zustand + TQ v5       │    │     Zustand + Tailwind CSS   │   │
│  │    Razorpay RN SDK       │    │     Axios + Socket.io Client │   │
│  │    Socket.io Client      │    │                              │   │
│  │    Expo Push Notifs      │    └──────────────────────────────┘   │
│  │    EAS Build + OTA       │                                       │
│  └────────────┬─────────────┘                                       │
│               │ HTTPS + WebSocket (wss://)                          │
└───────────────┼─────────────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────────────┐
│                    RENDER.COM (Free Tier)                           │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                Node.js / Express 5 API Server                 │  │
│  │                                                               │  │
│  │  Security Layer:                                              │  │
│  │    Helmet.js → Rate Limiter → CORS Whitelist → Cookie Parser  │  │
│  │                                                               │  │
│  │  API Routes (/api/v1/):                                       │  │
│  │    /auth       /booking     /customer     /provider           │  │
│  │    /parking    /payments    /passes       /verification       │  │
│  │                                                               │  │
│  │  Services:                                                    │  │
│  │    BookingService    (optimistic locking, slot reservation)   │  │
│  │    PaymentService    (Razorpay orders + HMAC verification)    │  │
│  │    SocketService     (Socket.io rooms per facility)           │  │
│  │    DiscoveryService  (facility search + geolocation)          │  │
│  │    PricingService    (hourly + daily max calculation)         │  │
│  │    AnalyticsService  (occupancy + revenue aggregation)        │  │
│  │    PassService       (monthly pass lifecycle)                 │  │
│  │                                                               │  │
│  │  Infrastructure:                                              │  │
│  │    Socket.io Server  (real-time slot events)                  │  │
│  │    node-cron         (slot cleanup every 1 min)               │  │
│  │    Winston Logger    (structured logging)                     │  │
│  │    Swagger UI        (OpenAPI docs at /api-docs)              │  │
│  │    PDFKit            (parking ticket PDF generation)          │  │
│  │    QRCode            (QR code generation per ticket)          │  │
│  │    Expo Push API     (push notifications)                     │  │
│  └──────────────────────┬────────────────────────────────────────┘  │
│                         │ Prisma ORM (pgbouncer=true)               │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────┐
│                SUPABASE CLOUD (ap-south-1, Mumbai)                  │
│                                                                     │
│  PostgreSQL 17 — Project: parkeasy-prod                            │
│                                                                     │
│  Connection Modes:                                                  │
│    Transaction Pooler (port 6543) — App queries via PgBouncer       │
│    Session Pooler    (port 5432) — Prisma migrations                │
│                                                                     │
│  13 Tables across 4 logical domains:                                │
│    Identity:     users, refresh_tokens                              │
│    Facility:     parking_facilities, floors, parking_slots          │
│    Commerce:     pricing_rules, tickets, monthly_passes             │
│    Finance:      withdrawals, settlements, platform_transactions    │
│    User Data:    vehicles, favorites                                │
└─────────────────────────────────────────────────────────────────────┘
```

**External Services:**
- **Razorpay**    → Payment order creation + webhook verification
- **Expo Push**   → Mobile push notification delivery
- **UptimeRobot** → Health check ping every 5 min (prevents Render sleep)
- **EAS Build**   → Native Android/iOS APK/IPA compilation
- **EAS Update**  → OTA JavaScript bundle delivery
- **GitHub Actions** → Automated OTA push on commits to main

---

## 5. Technology Stack

### 5.1 Backend API
| Component | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | 20.x LTS | JavaScript server runtime |
| Framework | Express.js | 5.x | HTTP server and routing |
| ORM | Prisma | 5.10.0 | Type-safe database client |
| Database | PostgreSQL | 17 | Primary relational data store |
| DB Host | Supabase | — | Managed Postgres + PgBouncer |
| Auth | jsonwebtoken | — | JWT access & refresh token signing |
| Auth | bcryptjs | — | Password hashing |
| Payments | Razorpay Node SDK | — | Payment order creation & verification |
| Realtime | Socket.io | 4.x | WebSocket server for slot events |
| Scheduler | node-cron | — | Cron-based reservation cleanup |
| Validation | Zod | 3.x | Request body schema validation |
| Docs | Swagger UI Express | — | Interactive OpenAPI documentation |
| Logging | Winston | — | Structured production logging |
| QR Code | qrcode | — | Per-ticket QR code image generation |
| PDF | PDFKit | — | Downloadable parking ticket PDFs |
| Push | Expo Server SDK | — | Push notification dispatch |
| Security | Helmet.js | — | HTTP security headers |
| Security | express-rate-limit | — | IP-based request rate limiting |
| Container | Docker | node:20-slim | Security hardened backend image |
| Deployment | Render.com | — | Cloud web service hosting |

### 5.2 Mobile Application (ParkEasyMobile)
| Component | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Expo | SDK 54 | Managed React Native toolkit |
| Language | TypeScript | 5.x | Type safety throughout |
| RN Version | React Native | 0.81.5 | Cross-platform UI primitives |
| Navigation | Expo Router | 6.x | File-based navigation system |
| State | Zustand | 5.x | Lightweight global state |
| Server State | TanStack Query | 5.x | Data fetching + caching |
| HTTP | Axios | — | HTTP client with interceptors |
| Realtime | Socket.io Client | — | WebSocket slot updates |
| Payments | React Native Razorpay | — | Native payment sheet |
| Notifications | Expo Notifications | — | Push notification handling |
| OTA | Expo Updates | — | Over-the-air JS bundle updates |
| Builds | EAS Build | — | Native APK/IPA compilation |
| CI/CD | GitHub Actions | — | Automated OTA deployment |

### 5.3 Web Frontend
| Component | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 18.x | UI component library |
| Build Tool | Vite | 6.x | Lightning-fast bundler |
| Language | TypeScript | 5.x | Type safety throughout |
| Styling | Tailwind CSS | 3.x | Utility-first styling |
| State | Zustand | 5.x | Auth, booking, search, ticket stores |
| Server State | TanStack Query | 5.x | Data fetching + cache management |
| HTTP | Axios | — | HTTP client with JWT interceptors |
| Realtime | Socket.io Client | — | Real-time slot grid updates |

---

## 6. Core Features

### 6.1 Customer Features
| Feature | Description |
|---|---|
| 🗺️ Facility Discovery | Browse parking facilities with distance, availability, and pricing info |
| 🔍 Search & Filter | Search by city, vehicle type, operating hours, and price range |
| 📍 Geolocation | Auto-detect user location to show nearest facilities first |
| 🅿️ Live Slot Grid | Real-time visual slot availability grid with color-coded status |
| 📅 Slot Reservation | 10-minute held reservation during payment flow (race-condition safe) |
| 💳 Payment | Razorpay integration: UPI, cards, wallets, net banking |
| 📄 QR Ticket | Auto-generated QR code ticket for each confirmed booking |
| 📋 Booking History | Full ticket history with status filters and PDF download |
| 🎫 Monthly Passes | Purchase facility-specific monthly passes per vehicle type |
| 🚗 Vehicle Management | Save multiple vehicles with type (Car/Bike/Truck) and nickname |
| ⭐ Favourites | Save frequently visited facilities for quick access |
| 💰 Payment History | Ledger view of all transactions and payment statuses |
| 🆘 Support | In-app FAQ and contact form |

### 6.2 Provider (Facility Operator) Features
| Feature | Description |
|---|---|
| 🏗️ Facility Onboarding | Add parking facilities with address, coordinates, images, operating hours |
| 🗺️ Multi-Floor Layout | Configure multiple floors per facility with named levels |
| 🅿️ Slot Configuration | Define individual slots with type (Car/Bike/Truck) and numbering |
| 💰 Pricing Management | Set hourly rate, daily maximum, and monthly pass price per vehicle type |
| 📊 Dashboard | Real-time occupancy stats, revenue summary, booking counts |
| 📋 Booking Management | View all bookings with status, vehicle info, and timing |
| 📷 QR Scanner | Native camera scanner to verify customer tickets on entry/exit |
| 🔧 Manual Entry | Manually log walk-in vehicles without an app booking |
| 📈 Analytics | Historical charts: occupancy trends, revenue patterns, vehicle mix |
| 💵 Earnings Ledger | Detailed earning records per booking + withdrawal request submission |
| ✏️ Facility Editing | Update facility details, pricing, and slot configuration at any time |

### 6.3 System-Level Features
| Feature | Description |
|---|---|
| 🔄 JWT Token Rotation | Rotating refresh tokens with database-level revocation |
| ⚡ Optimistic Locking | Concurrent slot reservation with race-condition prevention |
| 🔔 Push Notifications | Expo push notifications for booking confirmations and updates |
| 🤖 Automated Cleanup | Cron job frees expired RESERVED slots every 60 seconds |
| 🌐 OTA Updates | JavaScript bundle updates without app store re-submission |
| 📜 Swagger Docs | Live, interactive API documentation at /api-docs |
| 🐳 Docker | Fully containerized backend with non-root user security |
| 📡 Health Check | `/health` endpoint for monitoring and uptime services |

---

## 7. Repository Structure

```
ParkEasy/                              # Monorepo root
│
├── 📁 backend/                        # Node.js + Express 5 API Server
│   ├── index.js                       # Server entry point
│   ├── Dockerfile                     # Docker image definition (node:20-slim)
│   ├── render.yaml                    # Render.com deployment config
│   ├── package.json
│   ├── .env.example                   # Environment variable template
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema (source of truth)
│   │   └── seed.js                    # Test data seeder (3 Mumbai facilities)
│   └── src/
│       ├── app.js                     # Express app: middleware + routes
│       ├── config/
│       │   ├── db.js                  # Prisma client singleton
│       │   └── swagger.js             # OpenAPI/Swagger setup
│       ├── controllers/               # HTTP request handlers (thin layer)
│       ├── services/                  # Business logic layer
│       ├── middleware/                # Express middleware
│       ├── routes/                    # Express route definitions
│       ├── validators/                # Zod schemas for request validation
│       ├── jobs/                      # Background cron jobs
│       └── utils/                     # Utilities (auth, pdf, qrcode, push)
│
├── 📁 ParkEasyMobile/                 # Expo React Native Mobile App
│   ├── app.json                       # Expo config (SDK, package, EAS IDs)
│   ├── eas.json                       # EAS Build profiles
│   ├── babel.config.js
│   ├── .env.example
│   ├── .github/workflows/
│   │   └── ota-update.yml             # Auto OTA push on commit to main
│   ├── app/                           # Expo Router file-based routes
│   │   ├── _layout.tsx                # Root layout (providers)
│   │   ├── (auth)/                    # Login + Signup screens
│   │   ├── (customer)/                # All customer screens + booking flow
│   │   ├── (provider)/                # All provider screens + management
│   │   └── settings/                  # Profile settings
│   ├── components/                    # Reusable UI components
│   ├── hooks/                         # Custom React hooks
│   ├── store/                         # Zustand global state
│   ├── services/                      # API client logic
│   ├── constants/                     # Constants and theme definitions
│   └── assets/                        # App icons + splash screen
│
├── 📁 frontend/                       # React + Vite Web Dashboard
│   ├── src/
│   │   ├── pages/                     # Customer + Provider page views
│   │   ├── components/                # UI components (customer + provider)
│   │   ├── store/                     # Zustand stores
│   │   ├── services/                  # API + Socket.io services
│   │   ├── hooks/                     # Custom hooks
│   │   └── types/                     # Shared TypeScript types
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── 📄 ARCHITECTURE.md                 # System architecture deep-dive
├── 📄 API.md                          # Complete REST API reference
├── 📄 DATABASE.md                     # Full schema documentation
├── 📄 DEPLOYMENT.md                   # Production deployment guide
├── 📄 MOBILE.md                       # Mobile app setup guide
├── 📄 CHANGELOG.md                    # Version history
├── 📄 CONTRIBUTING.md                 # Contributor guidelines
├── 📄 SECURITY.md                     # Security policy + vulnerability reporting
├── 🐳 Dockerfile                      # Backend Docker image
├── ⚙️ render.yaml                     # Render.com service definition
└── 📄 .gitignore                      # Comprehensive gitignore
```

---

## 8. Database Design

ParkEasy uses PostgreSQL 17 with 13 tables across 4 logical domains.
The schema is managed by Prisma ORM. Full documentation: `DATABASE.md`

### 8.1 Entity Relationship Overview
```text
users ──────────────────────────────────────────────────────────────┐
  │                                                                  │
  ├─► parking_facilities (as provider_id)                           │
  │     ├─► floors                                                   │
  │     │     └─► parking_slots  ◄── tickets.slot_id               │
  │     ├─► pricing_rules (per vehicle type)                         │
  │     ├─► tickets.facility_id                                      │
  │     ├─► monthly_passes.facility_id                              │
  │     └─► favorites.facility_id                                   │
  │                                                                  │
  ├─► tickets (as customer_id)                                       │
  │     └─► platform_transactions.ticket_id                         │
  │                                                                  │
  ├─► monthly_passes (as customer_id)                               │
  ├─► vehicles (as user_id)                                          │
  ├─► favorites (as user_id)                                         │
  ├─► refresh_tokens (as user_id)                                    │
  ├─► withdrawals (as user_id / provider)                           │
  └─► settlements (as user_id)                                      │
                                                                     │
users ◄──────────────────────────────────────────────────────────────┘
```

### 8.2 Slot Status State Machine
```text
          ┌──────────────────────────────┐
          │                              │
          ▼                              │
        FREE  ──────────────────► RESERVED (10 min TTL)
          ▲                              │
          │                              ├─► Payment completed ──► OCCUPIED
          │                              │
          └──────── Cron cleanup ◄───────┘ (every 1 minute)
                    (expiry passed)

OCCUPIED ──────────────────────────────────────────────► FREE
              (provider QR scan / manual checkout)
```

### 8.3 Key Design Decisions
- **UUIDs as Primary Keys**: All tables use UUID TEXT primary keys for distributed-safe ID generation without a sequence bottleneck.
- **Soft Deletes on Slots**: Slots use `is_active: Boolean` rather than physical deletion to preserve booking history integrity.
- **PgBouncer Compatibility**: `DATABASE_URL` uses the Transaction Pooler (port 6543) with `?pgbouncer=true` for connection multiplexing. Prisma migrations use `DIRECT_URL` (port 5432) which bypasses the pooler.
- **Decimal Precision**: All monetary columns use `DECIMAL(12, 2)` to avoid floating-point rounding errors in financial calculations.

---

## 9. Security Architecture

### 9.1 JWT Authentication System
ParkEasy implements a dual-token authentication pattern:
```text
┌─────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                          │
│                                                             │
│  POST /auth/login                                           │
│    → generateTokens(userId, role)                           │
│    → accessToken  (JWT, 15 min, signed: JWT_SECRET)         │
│    → refreshToken (JWT, 7 days, signed: JWT_REFRESH_SECRET) │
│    → SHA-256(refreshToken) stored in refresh_tokens table   │
│    → Both tokens returned to client                         │
│                                                             │
│  Client attaches accessToken to every request:              │
│    Authorization: Bearer <accessToken>                      │
│                                                             │
│  On 401 (accessToken expired):                              │
│    → POST /auth/refresh { refreshToken }                    │
│    → JWT signature verified                                 │
│    → SHA-256(refreshToken) looked up in DB                  │
│    → If found: DELETE old, INSERT new (token rotation)      │
│    → If not found: 401 — token already used or revoked      │
│                                                             │
│  POST /auth/logout:                                         │
│    → DELETE from refresh_tokens WHERE token_hash = hash     │
│    → Even if accessToken is still valid, refresh is dead    │
└─────────────────────────────────────────────────────────────┘
```
**Why SHA-256 hashing?** If the `refresh_tokens` table were ever exfiltrated (e.g., a database breach), raw token values cannot be extracted and replayed. Only the server, which has the original token string from the client, can produce the matching hash.

### 9.2 Race Condition Prevention in Slot Reservation
The slot reservation system uses PostgreSQL's inherent row-level locking via Prisma's `updateMany` with a conditional WHERE clause:
```javascript
// Step 1: Find top 5 FREE candidate slots for the vehicle type
const candidates = await prisma.parkingSlot.findMany({
  where: { floor: { facility_id }, vehicle_type, status: 'FREE' },
  take: 5,
  orderBy: { slot_number: 'asc' }
});

// Step 2: Attempt to atomically reserve one
for (const candidate of candidates) {
  const result = await prisma.parkingSlot.updateMany({
    where: { 
      id: candidate.id, 
      status: 'FREE'       // ← This re-checks status atomically
    },
    data: { 
      status: 'RESERVED', 
      reservation_expiry: new Date(Date.now() + TIMEOUT_MS)
    }
  });
  if (result.count > 0) {
    reservedSlot = candidate;
    break;
  }
  // count === 0 means another request grabbed it first; try next candidate
}
```
This pattern ensures that even under high concurrency, at most one request can successfully update a given slot from FREE to RESERVED.

### 9.3 Payment Verification
Razorpay payments are verified server-side using HMAC-SHA256:
```javascript
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (expectedSignature !== razorpay_signature) {
  throw new AppError('Payment verification failed', 400);
}
```
This prevents payment replay attacks and tampered payment data — a client cannot fake a successful payment without knowing the Razorpay secret.

### 9.4 Additional Security Layers
| Measure | Implementation |
|---|---|
| Security Headers | Helmet.js (X-Content-Type-Options, HSTS, CSP, etc.) |
| Rate Limiting | 100 requests / 15 min per IP via `express-rate-limit` |
| CORS Whitelist | Only approved origin domains accepted |
| Input Validation | Zod schemas on all mutating endpoints |
| Password Hashing | bcrypt with default salt rounds |
| Non-Root Docker | Container runs as `uid:1001`, not root |
| Secret Management| All secrets via environment variables; never in codebase |
| `.env` Gitignore | `.env` files excluded at root, backend, and mobile levels |

---

## 10. Real-Time Communication

ParkEasy uses Socket.io for bidirectional real-time communication between the server and connected clients. The implementation uses facility-scoped rooms:

### 10.1 Server-Side (`socket.service.js`)
```javascript
io.on('connection', (socket) => {
  // Client joins a facility-specific room
  socket.on('join_facility', (facilityId) => {
    socket.join(`facility_${facilityId}`);
  });
  
  // Client leaves the room (navigate away)
  socket.on('leave_facility', (facilityId) => {
    socket.leave(`facility_${facilityId}`);
  });
});

// Called from booking/payment/checkout services
export function emitSlotUpdate(facilityId, slotData) {
  io.to(`facility_${facilityId}`).emit('slot_updated', slotData);
}
```

### 10.2 Client-Side Hooks
```typescript
// useSocket.ts — singleton socket manager
// Single connection per app session, reused across screens

// useLiveSlots.ts — subscribes to slot_updated events
// Automatically updates TanStack Query cache on slot status change

// Auto-reconnect: 5 attempts, 2-second delay between retries
// Authentication: socket connects with JWT access token
```

### 10.3 Event Flow
```text
User A books slot C-01 at Facility X
  ↓
Server confirms booking → slot status: RESERVED → OCCUPIED
  ↓
emitSlotUpdate('facility-x-uuid', { slot_id, status: 'OCCUPIED' })
  ↓
Socket.io broadcasts to all sockets in room 'facility_facility-x-uuid'
  ↓
User B (viewing Facility X) sees slot C-01 instantly turn red
  ↓
TanStack Query cache updated client-side — no HTTP refetch needed
```

---

## 11. Payment Processing

### 11.1 Razorpay Integration Flow
```text
Step 1: Client requests payment
  POST /api/v1/payments/create-order
  Body: { amount, currency: 'INR', facility_id, slot_id }
  
  Server:
    → Validates slot is still RESERVED for this user
    → razorpay.orders.create({ amount: amount * 100, currency: 'INR' })
      (amount in paise: ₹60 = 6000 paise)
    → Returns: { orderId, amount, currency, key }

Step 2: Client presents payment UI
  → RazorpayCheckout.open(options) — native Android/iOS payment sheet
  → User completes payment via UPI / Card / Wallet / Net Banking
  → Razorpay returns: { razorpay_order_id, razorpay_payment_id, razorpay_signature }

Step 3: Client submits verification
  POST /api/v1/payments/verify
  Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
          slot_id, facility_id, vehicle_number, vehicle_type, booking_hours }
  
  Server:
    → HMAC-SHA256 verify: hash(orderId|paymentId) === signature
    → bookingService.confirmBooking()
      → slot.status: RESERVED → OCCUPIED
      → ticket.payment_status: PENDING → PAID
      → QR code generated and attached to ticket
      → Push notification sent to customer
      → emitSlotUpdate() — all facility viewers notified instantly
    → Returns: { ticket, qr_code }

Step 4: Client navigates to success screen
  → Displays ticket with QR code
  → QR scannable by provider at facility entry
```

---

## 12. API Overview

- **Base URL**: `https://parkeasy-backend-uy3x.onrender.com/api/v1`
- **Interactive Docs**: `https://parkeasy-backend-uy3x.onrender.com/api-docs`
- **Health Check**: `GET /health`
- **Full API documentation**: `API.md`

### 12.1 Endpoint Summary
| Domain | Prefix | Endpoints | Auth Required |
|---|---|---|---|
| Authentication | `/auth` | register, login, refresh, logout, me, update-push-token | Partial |
| Parking Discovery | `/parking` | search, facility details, slot availability | Public |
| Booking | `/booking` | reserve, cancel, my bookings | Customer |
| Payments | `/payments` | create-order, verify, history | Customer |
| Passes | `/passes` | purchase, list, cancel | Customer |
| Customer | `/customer` | vehicles, favorites, profile, tickets | Customer |
| Provider | `/provider` | dashboard, facilities, bookings, analytics, earnings | Provider |
| Verification | `/verification`| scan QR, manual entry, checkout | Provider |

### 12.2 Standard Response Envelope
All API responses follow a consistent structure:
```json
{
  "status": "success" | "fail" | "error",
  "data": { ... },
  "message": "Human-readable message (on errors)"
}
```
HTTP status codes follow REST conventions:
- **200** — Successful GET / POST
- **201** — Resource created
- **400** — Validation error / bad request
- **401** — Unauthenticated
- **403** — Unauthorized (wrong role)
- **404** — Resource not found
- **409** — Conflict (e.g., slot already reserved)
- **429** — Rate limit exceeded
- **500** — Internal server error

---

## 13. Mobile Application

Full documentation: `MOBILE.md`

### 13.1 Navigation Architecture
ParkEasy Mobile uses Expo Router 6's file-based routing. The app has three distinct navigation stacks based on authentication state and role:
```text
app/
├── index.tsx              → Entry: redirects based on auth state
│
├── (auth)/                → Stack for unauthenticated users
│   ├── login.tsx
│   └── signup.tsx
│
├── (customer)/            → Tab-based stack for CUSTOMER role
│   ├── index.tsx          → Home (map + nearby facilities)
│   ├── search.tsx         → Search results
│   ├── facility/[id].tsx  → Facility detail + live slot grid
│   ├── booking/
│   │   ├── vehicle.tsx    → Step 1: Select/enter vehicle
│   │   ├── payment.tsx    → Step 2: Review + pay
│   │   └── success.tsx    → Step 3: Booking confirmation + QR
│   ├── tickets.tsx        → Booking history
│   ├── passes.tsx         → Monthly pass management
│   ├── payments.tsx       → Payment history
│   ├── vehicles.tsx       → Saved vehicles
│   └── profile.tsx        → User profile
│
└── (provider)/            → Tab-based stack for PROVIDER role
    ├── (tabs)/
    │   ├── index.tsx      → Dashboard (stats + charts)
    │   ├── bookings.tsx   → All bookings management
    │   ├── facilities.tsx → My facilities list
    │   ├── scan.tsx       → QR code scanner
    │   └── profile.tsx    → Provider profile
    ├── add-facility.tsx   → Onboard new facility
    ├── analytics.tsx      → Detailed analytics
    ├── earnings.tsx       → Earnings ledger + withdrawals
    └── facility/[id]/
        ├── index.tsx      → Facility management hub
        └── edit.tsx       → Edit facility details
```

### 13.2 State Management
| Store | Technology | State Managed |
|---|---|---|
| Auth | Zustand | User info, access token, refresh token, role |
| Booking Flow | Zustand | Multi-step booking: slot → vehicle → payment |
| Server State | TanStack Query | All API-fetched data with caching + mutations |

### 13.3 Build & OTA Infrastructure
| Build Profile | Distribution | Output | Use Case |
|---|---|---|---|
| `development` | Internal | Dev Client | Local development with native modules |
| `preview` | Internal | APK | QA testing, direct install |
| `production` | Internal/Store | APK | End-user release |

Over-the-Air (OTA) updates allow JavaScript bundle changes to be pushed to installed apps without requiring a new APK build or app store review. This is triggered automatically via GitHub Actions on every push to `main`.

---

## 14. Web Dashboard

The web frontend (`/frontend`) is a React + Vite application providing desktop/browser access to the same functionality as the mobile app. It implements:
- **Customer side**: Search, facility browsing, booking flow, ticket history, pass management, vehicle management
- **Provider side**: Dashboard with occupancy/revenue charts, booking table, facility CRUD, slot manager, pricing manager, analytics

The Axios HTTP client includes interceptors that automatically attach the JWT access token to every request and handle 401 responses by triggering the token refresh flow before retrying the original request.

---

## 15. Deployment Infrastructure

Full documentation: `DEPLOYMENT.md`

### 15.1 Production Topology
| Component | Service | Details |
|---|---|---|
| API Server | Render.com (Free Web Service) | Auto-deploy from GitHub, Docker |
| Database | Supabase Free Tier | PostgreSQL 17, `ap-south-1` (Mumbai) |
| Keep-Alive | UptimeRobot | Pings `/health` every 5 min |
| Mobile Builds | EAS Build | Cloud APK compilation |
| OTA Updates | EAS Update | JS bundle delivery |
| CI/CD | GitHub Actions | Auto OTA on push to `main` |

### 15.2 Docker Configuration
The backend uses a security-hardened Docker image:
```dockerfile
FROM node:20-slim
# Non-root user for security
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/sh appuser
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
# OpenSSL 3.x required by Prisma binary target (debian-openssl-3.0.x)
RUN apt-get update -y && apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*
COPY . .
RUN npx prisma generate
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
CMD ["node", "index.js"]
```
**Why `node:20-slim` over Alpine?** Prisma's binary targets require OpenSSL 1.1.x or 3.x. Alpine Linux ships with LibreSSL, which is incompatible with Prisma's precompiled engine binaries for `debian-openssl-3.0.x`. The slim Debian base resolves this.

---

## 16. Getting Started

### 16.1 Prerequisites
| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Backend runtime |
| npm | 10.x | Package management |
| Expo CLI | Latest | Mobile development |
| EAS CLI | Latest | Native builds and OTA |
| Docker | Latest | Backend containerization |
| Git | Latest | Version control |
| Supabase account | — | Managed database |
| Razorpay account (test) | — | Payment testing |
| Expo account | — | EAS builds + OTA |

### 16.2 Clone the Repository
```bash
git clone https://github.com/sashtriyasam/parking.git
cd parking
```

### 16.3 Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env — see Section 17 for all variables

# Push database schema to Supabase
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed test data (3 Mumbai facilities, 55 slots)
node prisma/seed.js

# Start development server
npm run dev
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/api-docs
```

### 16.4 Mobile App Setup
```bash
cd ParkEasyMobile

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api/v1

# Install EAS CLI globally (first time only)
npm install -g eas-cli

# Login to Expo account
eas login

# Start Expo development server
npx expo start
# Scan QR code with Expo Go app OR run on emulator
```

### 16.5 Web Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Web dashboard at http://localhost:5173
```

### 16.6 Build Android APK (Optional)
```bash
cd ParkEasyMobile

# Preview APK (internal testing)
eas build --platform android --profile preview

# Download the APK from the EAS build link and install directly on device
```

---

## 17. Environment Configuration

### 17.1 Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase Transaction Pooler URL (port 6543) with `?pgbouncer=true` |
| `DIRECT_URL` | ✅ | Supabase Direct URL (port 5432) for Prisma migrations |
| `JWT_SECRET` | ✅ | Min 32 characters. Signs access tokens (15 min TTL) |
| `JWT_REFRESH_SECRET` | ✅ | Min 32 chars, different from `JWT_SECRET`. Signs refresh tokens (7 day TTL) |
| `PORT` | — | Server port. Default: 5000 |
| `NODE_ENV` | — | `production` disables morgan HTTP logging |
| `RAZORPAY_KEY_ID` | ⚠️ | Razorpay API key. Payments disabled if absent |
| `RAZORPAY_KEY_SECRET` | ⚠️ | Razorpay secret. Payments disabled if absent |
| `EXPO_ACCESS_TOKEN` | ⚠️ | Expo token. Push notifications disabled if absent |
| `FRONTEND_URL` | — | Added to CORS whitelist |
| `MOBILE_APP_URL` | — | Added to CORS whitelist |
| `RENDER_APP_URL` | — | Added to CORS whitelist |
| `RESERVATION_TIMEOUT_MINUTES`| — | Slot hold duration. Default: 10 |

⚠️ **Server exits immediately (code 1) if `DATABASE_URL`, `JWT_SECRET`, or `JWT_REFRESH_SECRET` are missing.**

### 17.2 Mobile App (`ParkEasyMobile/.env`)
| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | Backend API base URL (e.g., `https://parkeasy-backend-uy3x.onrender.com/api/v1`) |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay public key ID for payment sheet |

---

## 18. Background Jobs & Automation

### 18.1 Reservation Cleanup Cron
- **File**: `backend/src/jobs/cleanupReservations.js`
- **Schedule**: Every minute (`* * * * *`)
- **Purpose**: Release held slots where the 10-minute reservation window has expired.
```javascript
cron.schedule('* * * * *', async () => {
  const released = await prisma.parkingSlot.updateMany({
    where: {
      status: 'RESERVED',
      reservation_expiry: { lt: new Date() }
    },
    data: {
      status: 'FREE',
      reservation_expiry: null
    }
  });
  if (released.count > 0) {
    logger.info(`Cleanup: Released ${released.count} expired reservations`);
    // Emit slot updates for affected facilities
  }
});
```

### 18.2 OTA Update CI/CD (GitHub Actions)
- **File**: `ParkEasyMobile/.github/workflows/ota-update.yml`
- **Trigger**: Push to `main` branch
- **Action**: Publishes a new Expo Update to the `production` channel
- **Result**: Installed app users receive the new JS bundle on next launch
- **Prerequisite**: `EXPO_TOKEN` secret set in GitHub repository settings

### 18.3 UptimeRobot Keep-Alive
Render.com's free tier spins down after 15 minutes of inactivity. UptimeRobot pings `GET /health` every 5 minutes, keeping the server warm and ensuring the `/health` response always confirms database connectivity.

---

## 19. Performance & Scalability Considerations

### 19.1 Database Connection Pooling
Supabase's PgBouncer (Transaction Pooler) multiplexes hundreds of application requests across a small pool of real PostgreSQL connections, enabling efficient resource use even on the free tier.

### 19.2 Indexed Queries
The `parking_slots` table has a composite index on `(floor_id, status)` enabling O(log n) slot availability lookups even for large facilities.

### 19.3 Socket.io Rooms (Scoped Broadcasting)
Slot update events are emitted only to clients viewing the specific affected facility — not all connected clients. This ensures message volume scales with per-facility viewers, not total platform users.

### 19.4 TanStack Query Caching
Both the mobile app and web frontend cache API responses via TanStack Query. Socket.io events update the local cache directly, eliminating most refetch requests for live slot data.

### 19.5 Optimistic UI
The booking flow uses local state to immediately reflect the reserved slot while the server request is in flight, providing an instant, responsive feel even on slower mobile connections.

### 19.6 OTA Updates
JavaScript-only changes (bug fixes, UI tweaks) are deployable as OTA bundles within minutes, without the 24–72 hour wait time of a full app store submission cycle.

---

## 20. Known Limitations & Future Scope

### 20.1 Current Limitations
| Limitation | Detail |
|---|---|
| Free Tier Cold Starts | Render.com free tier has ~30-50s cold start; UptimeRobot mitigates but doesn't eliminate it |
| No iOS Build | EAS Build configured for Android APK; iOS requires Apple Developer account ($99/yr) |
| No Map Integration | Facility coordinates stored but no live map view in current release |
| Single Region | Database in `ap-south-1` (Mumbai); global latency will be higher for non-Indian users |
| No Admin Panel | `ADMIN` role defined in schema but admin-specific routes not yet implemented |

### 20.2 Planned Enhancements
| Feature | Description |
|---|---|
| 🗺️ Live Map View | Interactive map with facility markers and real-time slot counts |
| 📱 iOS Support | Apple Developer account + TestFlight distribution |
| 🔔 Advanced Notifications | Booking reminders, expiry alerts, pass renewal reminders |
| 💰 Automated Payouts | Razorpay Fund Accounts API for provider payout automation |
| 🔢 Slot Pre-booking | Advance booking for future time slots |
| 📊 Admin Panel | Platform-wide analytics and user management dashboard |
| 🌍 Multi-City Expansion | City-wise filtering and regional pricing |
| ♿ Accessibility | Screen reader support and accessibility improvements |
| 🌙 Dark Mode | System-adaptive dark theme for mobile app |
| ⭐ Reviews & Ratings | User-submitted facility ratings and reviews |

---

## 21. Authors & Acknowledgements

**Primary Author**
- Shivam Shelatkar
- Computer Engineering, SE Semester IV
- University of Mumbai

**Acknowledgements**
- **Supabase** — Managed PostgreSQL hosting (free tier, Mumbai region)
- **Render.com** — Backend cloud hosting (free tier)
- **Expo / EAS** — React Native toolchain and build infrastructure
- **Razorpay** — Payment gateway (Indian payment methods)
- **Prisma** — Type-safe ORM that made complex queries readable
- **Socket.io** — Reliable WebSocket abstraction for real-time features
- **University of Mumbai** — Academic framework that initiated this project

---

## 22. License

This project is licensed under the MIT License.

```text
MIT License

Copyright (c) 2026 Shivam Shelatkar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

<div align="center">
Built with ❤️ in Mumbai, India 🇮🇳<br/>
<em>ParkEasy — Because finding parking shouldn't be the hardest part of your day.</em>
</div>
