# 04. REST API Specification
## Explore Galiyat — Endpoints & Contracts

---

## 1. Public Endpoints

### `POST /api/bookings` & `POST /api/v1/bookings`
- **Rate Limit:** 15 req / 15 min.
- **Headers:** `Idempotency-Key` (Optional UUID).
- **Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "ahmed@example.com",
  "phone": "+923001234567",
  "property": "Maria Villa Retreat",
  "roomType": "Deluxe Pine-View Apartment",
  "roomsCount": 1,
  "totalPrice": 18000,
  "datetime": "Sat, Aug 15, 2026",
  "specialRequests": "Late check-in requested."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking request received successfully! An acknowledgment email has been scheduled.",
  "data": {
    "id": "GB-8F4K29",
    "guestName": "Ahmed Khan",
    "status": "Pending",
    "totalPrice": 18000
  }
}
```

---

## 2. Admin Authentication Endpoints

### `POST /api/admin/auth/login`
- **Rate Limit:** 6 req / 15 min.
- **Request Body:** `{ "email": "admin@exploregaliyat.com", "password": "..." }`
- **Response (200 OK):** Sets HTTP-only `agy_admin_session` cookie + returns user object.

### `POST /api/admin/auth/logout`
- **Headers:** Requires authenticated session cookie.
- **Response (200 OK):** Clears session cookie.

### `GET /api/admin/auth/me`
- **Response (200 OK):** `{ "success": true, "data": { "user": { "id": "...", "email": "...", "role": "admin" } } }`

---

## 3. Protected Admin Endpoints

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | `admin`, `manager` | Get aggregate KPI metrics |
| `GET` | `/api/admin/bookings` | `admin`, `manager` | Server-side paginated search |
| `GET` | `/api/admin/bookings/:id` | `admin`, `manager` | Get full booking details |
| `PATCH`| `/api/admin/bookings/:id/status` | `admin`, `manager` | Update status (`Confirmed`/`Cancelled`) |
| `POST` | `/api/admin/bookings/:id/resend-confirmation` | `admin`, `manager` | Resend Stage 2 Voucher |
| `DELETE`| `/api/admin/bookings/:id` | `admin` | Soft delete booking |
| `POST` | `/api/admin/properties` | `admin` | Add new hotel property |
| `GET` | `/api/admin/email-logs` | `admin`, `manager` | View email logs |
| `GET` | `/api/admin/audit-logs` | `admin` | View system audit trail |
