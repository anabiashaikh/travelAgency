# 08. Production Deployment Guide
## Explore Galiyat — Vercel & Production Server Setup

---

## 1. Vercel Deployment
1. Connect GitHub repository to Vercel.
2. In **Vercel Dashboard ➔ Project Settings ➔ Environment Variables**, add:
   - `DATABASE_URL` = `postgresql://<user>:<pass>@<host>/<dbname>?sslmode=require`
   - `JWT_SECRET` = `<min-32-char-random-secret>`
   - `SMTP_SERVICE` = `gmail`
   - `SMTP_USER` = `anabiaxhaikh190@gmail.com`
   - `SMTP_PASS` = `<app-password>`
   - `ADMIN_NOTIFICATION_EMAIL` = `anabiaxhaikh190@gmail.com`
   - `NODE_ENV` = `production`
3. Trigger a redeploy. Vercel routes `/api/*` requests to `api/index.js` (Serverless Function).

---

## 2. Dedicated Server / VPS Deployment
```bash
git clone https://github.com/anabiashaikh/travelAgency.git
cd travelAgency
npm install --production
cp .env.example .env
# Fill in production values in .env
npm start
```
Use PM2 or Docker for process management:
```bash
pm2 start server.js --name "explore-galiyat"
```
