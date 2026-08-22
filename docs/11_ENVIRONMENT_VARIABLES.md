# 11. Environment Variables Reference
## Explore Galiyat — Configuration Reference

---

| Variable | Type | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `development` / `production` | Environment mode |
| `PORT` | Number | `8080` | HTTP port |
| `DATABASE_URL` | String | `postgresql://...` | Neon PostgreSQL connection URI |
| `JWT_SECRET` | String | `<min-32-chars>` | Secret key used to sign session JWTs |
| `JWT_EXPIRES_IN`| String | `24h` | Session lifetime |
| `COOKIE_NAME` | String | `agy_admin_session` | HTTP-only session cookie name |
| `SMTP_SERVICE` | String | `gmail` | Nodemailer service provider |
| `SMTP_USER` | String | `your-email@gmail.com` | SMTP authentication user |
| `SMTP_PASS` | String | `your-app-password` | Gmail 16-character App Password |
| `EMAIL_FROM` | String | `"Explore Galiyat Reservations" <...>` | Outgoing sender header |
| `ADMIN_NOTIFICATION_EMAIL` | String | `admin@exploregaliyat.com` | Agency inbox for booking alerts |
| `ALLOWED_ORIGINS` | String | `http://localhost:8080,...` | Comma-separated CORS allowed domains |
