# 02. Security & Threat Modeling Documentation
## Explore Galiyat — Security Hardening Matrix

---

## 1. Secrets Management & Zero-Leak Policy
- **No Hardcoded Secrets:** All secrets (`DATABASE_URL`, `JWT_SECRET`, `SMTP_PASS`) are accessed strictly through `src/config/env.js`.
- **Git Protection:** `.gitignore` excludes `.env` and sensitive credentials.
- **Log Redaction:** `src/config/logger.js` filters out keys containing `password`, `token`, `secret`, `jwt`, and `cookie`.

---

## 2. Admin Authentication & Role-Based Access Control (RBAC)
- **Password Hashing:** Passwords are never stored in plaintext; hashed with `bcryptjs` using 10 salt rounds.
- **Session Protection:** Authenticated sessions use signed JSON Web Tokens (JWT) stored in `HTTP-only`, `SameSite=Lax` cookies.
- **RBAC Matrix:**
  - `admin`: Full access to bookings, properties, rooms, metrics, audit logs, and soft deletes.
  - `manager`: Access to view bookings, update status (Confirm/Cancel), and resend vouchers.

---

## 3. Rate Limiting & Abuse Prevention
- `POST /api/bookings`: Max 15 requests per 15 minutes per IP.
- `POST /api/admin/auth/login`: Max 6 attempts per 15 minutes per IP (blocks brute-force).
- `POST /api/admin/bookings/:id/resend-confirmation`: Max 5 requests per 15 minutes.
- `GET /api/*`: Max 300 requests per 15 minutes.

---

## 4. XSS & Injection Safeguards
- **SQL Injection:** All queries use parameterized statements (`$1, $2, ...`) via PostgreSQL pool.
- **Cross-Site Scripting (XSS):**
  - All dynamic data rendered into emails and DOM is processed via `escapeHtml()`.
  - Admin table rendering utilizes strict string sanitization.
- **Content Security Policy (CSP):** Enforced via Helmet, strictly whitelisting Google Fonts and Font Awesome CDNs while blocking unsafe object/plugin embeds.
