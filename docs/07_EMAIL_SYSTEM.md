# 07. Automated Email Job Queue & Worker
## Explore Galiyat — Email Reliability Architecture

---

## 1. Asynchronous Architecture
Customer booking HTTP requests **do not block** waiting for SMTP network handshakes. Instead:
1. Booking creation transaction atomically enqueues a record into `email_jobs`.
2. The HTTP API returns `201 Created` within ~50ms.
3. A background Node.js worker polling every 4 seconds extracts pending jobs with `SELECT ... FOR UPDATE SKIP LOCKED`.
4. Transports email via Nodemailer (Gmail SMTP).
5. On success: Marks `status = 'SENT'` and logs into `email_logs`.
6. On failure: Increments `attempt_count` and reschedules with exponential backoff:
   - Attempt 1: +30 seconds
   - Attempt 2: +60 seconds
   - Attempt 3: Final failure marked as `'FAILED'` and logged.
