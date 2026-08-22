# 05. Authentication & Authorization (RBAC)
## Explore Galiyat — Security Protocols

---

## 1. Authentication Mechanism
1. Client submits credentials via `POST /api/admin/auth/login`.
2. Server queries `admin_users` table by email.
3. Compares password hash via `bcrypt.compare(password, user.password_hash)`.
4. Issues a signed JSON Web Token (JWT) with standard payload `{ id, email, fullName, role }`.
5. Attaches the token in a secure `HTTP-only` cookie (`SameSite=Lax`, `Secure` in production).

---

## 2. RBAC Roles & Capabilities

| Capability | Role: `admin` | Role: `manager` |
| :--- | :---: | :---: |
| View Real-time Bookings | ✅ | ✅ |
| Search & Filter Bookings | ✅ | ✅ |
| Update Status (`Pending` -> `Confirmed` / `Cancelled`) | ✅ | ✅ |
| Trigger Official Confirmation Vouchers | ✅ | ✅ |
| View Email Logs | ✅ | ✅ |
| Add New Hotels & Locations | ✅ | ❌ |
| Soft Delete Booking Records | ✅ | ❌ |
| View System Audit Trail (`audit_logs`) | ✅ | ❌ |
