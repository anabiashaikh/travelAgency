# 09. Testing Strategy & Test Execution
## Explore Galiyat — Automated Test Suites

---

## 1. Running Test Suites
Execute all automated tests locally using Node.js native test runner:
```bash
npm test
```
Or directly:
```bash
node --test tests/**/*.test.js
```

---

## 2. Test Coverage Matrix

| Suite | File | What is Tested |
| :--- | :--- | :--- |
| **Validation Unit Tests** | `tests/unit/price_and_validation.test.js` | Payload bounds, RFC email regex, phone checks, date sequence, XSS template escaping. |
| **Auth & RBAC Tests** | `tests/unit/auth_and_rbac.test.js` | Bcrypt hashing/verification, signed JWT issuance & decoding, token error handling. |
| **Booking Integrations** | `tests/integration/booking_transaction.test.js` | `GB-XXXXXX` reference format, status machine valid/invalid transitions. |
| **Security & IDOR Tests** | `tests/security/auth_and_idor.test.js` | Unauthenticated API rejection (401), unauthorized role rejection (403), permitted role passthrough. |
