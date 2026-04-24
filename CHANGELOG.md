# Changelog

All notable changes to ParkEasy are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-04-24 — Initial Production Release

### 🎉 Added (Backend)
- Express 5 REST API with full authentication system
- JWT dual-token auth: 15-min access tokens + 7-day rotating refresh tokens
- SHA-256 hashed refresh token storage with server-side revocation
- Role-based access control: CUSTOMER, PROVIDER, ADMIN roles
- Zod request validation middleware on all mutating endpoints
- Razorpay payment integration with HMAC-SHA256 signature verification
- Socket.io real-time slot status broadcasting per facility room
- Prisma 5 ORM with PostgreSQL 17 on Supabase (Mumbai region)
- Optimistic locking for concurrent slot reservation (race condition safe)
- node-cron job: expired RESERVED slot cleanup every 1 minute
- QR code generation (qrcode library) per parking ticket
- PDF ticket generation (PDFKit)
- Expo Push Notification dispatch
- Winston structured logger with environment-aware log levels
- Swagger/OpenAPI UI at /api-docs
- Helmet.js security headers
- Rate limiting: 100 requests / 15 minutes per IP
- CORS whitelist for mobile, web, and Render origins
- Docker containerization (node:20-slim + OpenSSL 3.x for Prisma)
- Render.com deployment via render.yaml
- UptimeRobot keep-alive configuration for free tier
- Comprehensive seed data: 3 Mumbai parking facilities, 55 slots

### 🎉 Added (Mobile — ParkEasyMobile)
- Expo SDK 54 + React Native 0.81.5
- Expo Router 6 file-based navigation
- Dual-role UI: Customer and Provider separate navigation stacks
- Customer flows: Home/Map, Search, Facility Details, Booking (3-step), 
  Tickets, Monthly Passes, Payment History, Vehicle Management, Profile
- Provider flows: Dashboard, Bookings Management, Facilities Management, 
  QR Code Scanner, Add/Edit Facility, Analytics, Earnings
- Zustand global state management (auth + booking flow)
- TanStack Query v5 for server-state caching and mutation
- Razorpay React Native SDK integration
- Socket.io live slot updates via custom useLiveSlots hook
- Expo Notifications for push notification handling
- Expo Updates for OTA (over-the-air) JS updates
- GitHub Actions workflow for automated OTA on push to main
- EAS Build profiles: development, preview, production (APK)
- Skeleton loading states for all data-fetching screens
- Global ErrorBoundary component for crash recovery

### 🎉 Added (Web Frontend)
- React 18 + Vite 6 + TypeScript
- TanStack Query v5 for server-state management
- Zustand for client-state (auth, booking flow, search, tickets)
- Tailwind CSS + custom theme system
- Customer and Provider pages with full parity to mobile app
- Axios HTTP client with JWT interceptors and refresh token logic
- Socket.io client for real-time slot grid updates

### 🎉 Added (Database)
- 13 PostgreSQL tables: users, refresh_tokens, parking_facilities, 
  floors, parking_slots, pricing_rules, tickets, monthly_passes, 
  vehicles, favorites, withdrawals, settlements, platform_transactions
- Slot status state machine: FREE → RESERVED → OCCUPIED → FREE
- Unique constraints, indexes, and cascade deletes throughout
- pgBouncer-compatible connection pooling via Supabase Transaction Pooler
