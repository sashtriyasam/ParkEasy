# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in ParkEasy, please report it 
responsibly by emailing: **[shelatkarshivam4@gmail.com]**

Please include the following in your report:
- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested mitigation or fix

We will acknowledge receipt within 48 hours and aim to provide a fix 
within 7 days for critical vulnerabilities.

## Security Measures in ParkEasy

### Authentication
- JWT Access Tokens expire in 15 minutes
- Refresh Tokens are rotated on every use (one-time use)
- Refresh Token hashes stored via SHA-256; raw tokens never persisted
- Logout invalidates refresh token at the database level

### API Security
- Helmet.js security headers on all responses
- Rate limiting: 100 requests per 15 minutes per IP
- CORS whitelist enforced (only approved origins accepted)
- All inputs validated via Zod schemas before processing
- Passwords hashed with bcrypt

### Payment Security
- Razorpay payment signatures verified server-side via HMAC-SHA256
- Payment amounts validated independently on the server (never trust client)
- All payment IDs and amounts cross-checked before booking confirmation

### Database
- No raw SQL queries; all DB access via Prisma ORM
- Database credentials never exposed to client layer
- Sensitive fields (passwords, token hashes) never returned in API responses

### Infrastructure
- Non-root Docker user (uid 1001)
- Environment variables managed via Render.com secrets (never in codebase)
- .env files are gitignored at all levels
