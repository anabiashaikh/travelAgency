# Product Requirement Document (PRD)
## Explore Galiyat — Travel, Tourism & Hotel Reservation Platform

---

## 1. Executive Summary & Product Vision

### 1.1 Project Overview
**Explore Galiyat** is a full-stack travel and tourism web application designed to promote tourism across the scenic Galiyat region in Khyber Pakhtunkhwa (KPK), Pakistan (including Nathia Gali, Ayubia, Dunga Gali, Changla Gali, Khaira Gali, Thandiani, and Mushkpuri Peak). 

The platform offers a unified digital ecosystem where tourists can explore destinations, view interactive photo galleries, book hotels and luxury apartments (e.g., Maria Villa Retreat, Crown Inn Hotel Apartments), reserve tailored tour packages, book flights, and receive instant automated email confirmations.

### 1.2 Business Goals & Key Objectives
- **Centralized Travel Hub:** Provide a modern, intuitive, and responsive portal for Galiyat tourism.
- **Direct Reservations:** Enable instant room and package booking with zero booking commission.
- **Automated Communication:** Eliminate manual follow-ups through a 2-stage automated transactional email workflow (Customer Acknowledgment, Admin Alerts, Official PDF-style Confirmation Vouchers, and Cancellation Notices).
- **Enterprise-Grade Admin Panel:** Equip agency staff with a centralized dashboard to track real-time bookings from PostgreSQL, update statuses, manage properties, and export reports.

---

## 2. Stakeholders & Target Personas

| Persona | Description | Key Needs & Pain Points |
| :--- | :--- | :--- |
| **Tourists & Travelers** | Domestic and international tourists planning leisure, family, or honeymoon trips to Galiyat. | Needs quick availability checks, clear room pricing, high-res photos, and instant email confirmation. |
| **Hotel / Property Owners** | Owners of luxury villas, apartments, and guest houses (e.g., Maria Villa, Crown Inn). | Wants qualified booking inquiries with complete customer contact details, check-in dates, and special requests. |
| **Travel Agency Admin** | Back-office management team managing bookings, approvals, and itineraries. | Needs a real-time dashboard to approve/cancel bookings, trigger confirmation vouchers, and export CSVs. |
| **Client / Stakeholder** | The business owner delivering the product to stakeholders. | Requires a scalable, production-ready architecture with PostgreSQL database persistence and clean codebase. |

---

## 3. Technology Stack & Architecture

### 3.1 Tech Stack Summary

```mermaid
graph TD
    User([End User / Tourist]) <-->|HTTPS| VercelFrontend[Vercel Frontend & UI]
    Admin([Agency Admin]) <-->|HTTPS| AdminDashboard[Admin Dashboard /admin.html]
    VercelFrontend <-->|REST API JSON| ExpressBackend[Node.js & Express.js REST API]
    AdminDashboard <-->|REST API JSON| ExpressBackend
    ExpressBackend <-->|pg Pool / SSL| NeonPostgres[(Neon Cloud PostgreSQL 18.6)]
    ExpressBackend <-->|Gmail SMTP| EmailService[Nodemailer Email Transporter]
    EmailService -->|Stage 1 & 2 Emails| CustomerInbox([Customer Inbox])
    EmailService -->|Real-time Alerts| AdminInbox([Agency Admin Inbox])
```

- **Frontend:**
  - Semantic HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism, Responsive CSS Grid & Flexbox).
  - Modern JavaScript (ES6+ Modular Architecture).
  - Font Awesome 6.4.0 Icons, Google Fonts (Inter, Outfit, Plus Jakarta Sans).
- **Backend:**
  - Node.js runtime environment.
  - Express.js web application framework.
  - CORS middleware, JSON body parser.
- **Database:**
  - **Neon Serverless PostgreSQL (PostgreSQL 18.6)** hosted on AWS `us-east-2`.
  - Connection pooling via `pg` (`node-postgres`) with SSL encryption (`sslmode=require`).
- **Email Dispatch Service:**
  - Nodemailer transporter authenticated via Google App Passwords (Gmail SMTP).
- **Deployment & Hosting:**
  - Frontend & Serverless Functions: **Vercel** (`travel-agency-ten-chi.vercel.app`).
  - Source Control: **GitHub** (`main` branch CI/CD).
  - Database: **Neon Cloud Serverless Postgres**.

---

## 4. System Architecture & Directory Structure

```
d:/client project/
├── .env                        # Protected environment configuration (DB & SMTP credentials)
├── .env.example                # Example environment template
├── .gitignore                  # Git protection rules (.env, data/, node_modules/)
├── package.json                # Project dependencies and startup scripts
├── server.js                   # Main Express application & static file server
├── vercel.json                 # Vercel serverless routing configuration
├── api/
│   └── index.js                # Vercel serverless entry point exporting Express app
├── public/                     # Frontend Client-Side Root
│   ├── index.html              # Homepage with hero search, destination showcases & reviews
│   ├── galiyat-hotels.html     # Booking.com style hotel directory with live search filters
│   ├── crown-inn.html          # Crown Inn Hotel Apartments detail page & photo lightbox
│   ├── maria-villa.html        # Maria Villa Luxury Retreat detail page & reservation form
│   ├── packages.html           # Tour packages catalog with duration/budget filters
│   ├── package-beauteous-galiyat.html # Detailed 3-Day tour itinerary & booking modal
│   ├── destinations.html       # Top Galiyat destinations directory & detailed modal guide
│   ├── activities.html         # Activities catalog (Chairlift, Hiking, Camping, Viewpoints)
│   ├── gallery.html            # High-resolution tourism visual photo gallery
│   ├── flights.html            # Flight reservation and ticket issuance portal
│   ├── about.html              # Company history, vision, and team credentials
│   ├── contact.html            # Direct inquiry form, office location & WhatsApp integration
│   ├── admin.html              # Real-time Administrative Reservations & Email Dashboard
│   ├── booking-form.html       # Standalone template booking form
│   ├── script.js               # Universal frontend logic, modals, API hooks & debouncing
│   ├── style.css               # Unified global CSS stylesheet and responsive styling
│   └── assets/                 # Verified images, hero banners, and media assets
└── src/                        # Backend Application Source Code
    ├── config/
    │   └── database.js         # Neon PostgreSQL connection pool, schema setup & queries
    ├── controllers/
    │   └── bookingController.js# Express controllers for Bookings and Email logs
    ├── routes/
    │   └── bookingRoutes.js    # Express REST API route definitions
    └── services/
        └── emailService.js     # Two-stage HTML email templates and Nodemailer dispatcher
```

---

## 5. Core Modules & Functional Specifications

### 5.1 Universal Booking Form Modal (All Pages)
A standardized, modern booking form modal integrated across all 12 public website pages:
- **Input Fields:**
  - First Name & Last Name (Required)
  - Street Address & Street Address Line 2
  - City, State / Province, Postal Code, Country (Default: Pakistan)
  - Phone Number & Email Address (Required)
  - Date & Time Selector
  - Service / Booking Type (Radio: Appointment / Reservation / Event)
  - Special Requests & Comments Textarea
  - Confirmation Channel (Radio: Email / Phone / Text)
  - Terms & Conditions Agreement Checkbox
- **Technical Features:**
  - Strict submission debounce guard (`_isSubmitting` flag) to prevent duplicate database rows.
  - Interactive visual button feedback (`Submitting Booking...` -> `✔ Booking Submitted!`).
  - Seamless auto-close and form reset without native blocking `alert()` popups.

### 5.2 Hotel Reservations & Search Engine
- **`galiyat-hotels.html`:** Booking.com styled property listings with price filters, star ratings, amenities, and room availability.
- **`crown-inn.html` & `maria-villa.html`:** Dedicated hotel landing pages featuring:
  - High-resolution interactive 12-image lightbox carousel.
  - Verified property badge, GPS coordinates, check-in policies, and amenity lists.
  - Dynamic room calculator calculating total PKR based on quantity and nights.
  - Direct PostgreSQL booking integration.

### 5.3 Tour Packages & Itineraries
- **`packages.html` & `package-beauteous-galiyat.html`:** 
  - Filter by duration (1-day, 3-day, 5-day), group type (Family, Honeymoon, Adventure), and budget.
  - Day-by-day interactive itinerary breakdown (Day 1: Islamabad to Nathia Gali, Day 2: Mushkpuri Peak Trek, Day 3: Ayubia Chairlift & Departure).
  - Price per person calculation and booking modal launch.

### 5.4 Destinations & Activities Portals
- **`destinations.html`:** Comprehensive travel guides for Nathia Gali, Ayubia, Dunga Gali, Changla Gali, Thandiani, and Mushkpuri Peak.
- **`activities.html`:** Mountain treks, Ayubia chairlift ride, Pipeline Track walk, camping, and wildlife photography.

### 5.5 Flight Booking Portal (`flights.html`)
- Flight search engine with One-Way / Round-Trip selection, departure & arrival airports, travel class, passenger count, live flight filters (PIA, Airblue, SereneAir, Fly Jinnah), and instant ticket generation synced to PostgreSQL.

### 5.6 Admin Management Dashboard (`admin.html`)
- **Key Metrics Overview:** Total Bookings, Pending Requests, Confirmed Reservations, Total Revenue (PKR), Active Destinations, and Registered Hotels.
- **Real-Time Booking Management Table:**
  - Status updates (`Pending` -> `Confirmed` / `Cancelled`) with instant automated email triggers.
  - Search & filter by Guest Name, Booking ID, Property, Status, or Date.
  - Resend Official Confirmation Email Voucher button.
  - Delete reservation modal.
  - Export all booking data to CSV.
- **Hotel & Location Manager:** Dynamically add new hotels and locations to the platform search lists.

---

## 6. Two-Stage Automated Email Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Tourist / Customer
    participant Web as Web Frontend (Unified Form)
    participant API as Express API (/api/bookings)
    participant DB as Neon PostgreSQL (bookings table)
    participant Mail as Nodemailer (Gmail SMTP)
    actor Admin as Agency Admin (/admin.html)

    Customer->>Web: Fills booking form & clicks Submit
    Web->>API: POST /api/bookings (JSON Payload)
    API->>DB: INSERT INTO bookings (Status: Pending)
    API->>Mail: Trigger Stage 1 Initial Acknowledgment Email
    Mail-->>Customer: 📩 Stage 1: "Booking Request Received (#GB-XXXX)"
    API->>Mail: Trigger Stage 1 Admin Notification Alert
    Mail-->>Admin: 🔔 "New Booking Alert: #GB-XXXX at [Property]"
    Web-->>Customer: Visual Confirmation "✔ Booking Submitted!"

    Note over Admin,DB: Agency verifies room availability with hotel
    Admin->>API: PATCH /api/bookings/GB-XXXX/status (Status: Confirmed)
    API->>DB: UPDATE bookings SET status='Confirmed', confirmed_at=NOW()
    API->>Mail: Trigger Stage 2 Official Confirmation Voucher
    Mail-->>Customer: 🎉 Stage 2: "Official Booking Voucher (#GB-XXXX) - Confirmed"
```

### Stage 1: Initial Booking Acknowledgment
- **Subject:** `Booking Request Received: [Property Name] (#[Booking ID]) - Explore Galiyat`
- **Recipient:** Customer Email + Admin Alert
- **Content:** Brand banner, Booking Reference ID, Guest Details, Property & Room details, Total Estimated Price, Notice that room availability is being verified.

### Stage 2: Official Confirmation Voucher
- **Subject:** `Official Booking Confirmation Voucher: [Property Name] (#[Booking ID]) - Explore Galiyat`
- **Recipient:** Customer Email
- **Content:** Official green confirmed badge, Printable voucher layout, Check-in / Check-out instructions, Hotel front desk contact numbers, Directions & Galiyat emergency contacts.

---

## 7. Database Schema & Data Models

### 7.1 Table: `bookings`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique booking identifier (e.g. `GB-4435`) |
| `guest_name` | `VARCHAR(255)` | `NOT NULL` | Full guest name |
| `first_name` | `VARCHAR(100)` | `NULL` | First name |
| `last_name` | `VARCHAR(100)` | `NULL` | Last name |
| `phone` | `VARCHAR(50)` | `NULL` | Contact phone number |
| `email` | `VARCHAR(255)` | `NULL` | Guest email address |
| `street` | `TEXT` | `NULL` | Street address |
| `street2` | `TEXT` | `NULL` | Address line 2 |
| `city` | `VARCHAR(100)` | `NULL` | City |
| `state` | `VARCHAR(100)` | `NULL` | State / Province |
| `postal` | `VARCHAR(50)` | `NULL` | Postal / Zip code |
| `country` | `VARCHAR(100)` | `DEFAULT 'Pakistan'` | Country |
| `property` | `VARCHAR(255)` | `NULL` | Hotel / Villa / Package name |
| `booking_type`| `VARCHAR(100)` | `DEFAULT 'Reservation'`| Reservation / Appointment / Event |
| `room_type` | `VARCHAR(255)` | `DEFAULT 'Standard Room'`| Room category or apartment type |
| `rooms_count` | `INT` | `DEFAULT 1` | Number of rooms |
| `guests_count`| `VARCHAR(100)` | `DEFAULT '2 adults · 0 children'` | Number of guests |
| `datetime` | `VARCHAR(100)` | `NULL` | Check-in date / time string |
| `check_in_date`| `VARCHAR(100)`| `NULL` | ISO check-in date |
| `check_out_date`|`VARCHAR(100)`| `NULL` | ISO check-out date |
| `total_price` | `NUMERIC` | `DEFAULT 0` | Total cost in PKR |
| `special_requests`|`TEXT` | `NULL` | Guest preferences and notes |
| `confirmation_channel`|`VARCHAR(50)`|`DEFAULT 'Email'`| Preferred channel (Email / Phone / Text) |
| `comments` | `TEXT` | `NULL` | Additional remarks |
| `status` | `VARCHAR(50)` | `DEFAULT 'Pending'` | `Pending`, `Confirmed`, `Cancelled` |
| `confirmed_at`| `TIMESTAMPTZ` | `NULL` | Timestamp when booking was confirmed |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record update timestamp |

### 7.2 Table: `email_logs`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-increment ID |
| `log_id` | `VARCHAR(50)` | `NULL` | Generated log identifier |
| `type` | `VARCHAR(100)` | `NULL` | `Stage1_Acknowledgment`, `Stage2_Confirmation`, `Admin_Alert`, `Cancellation` |
| `to_email` | `VARCHAR(255)` | `NULL` | Recipient email address |
| `subject` | `VARCHAR(255)` | `NULL` | Email subject line |
| `preview_url` | `TEXT` | `NULL` | Ethereal preview URL (if in testing) |
| `status` | `VARCHAR(50)` | `DEFAULT 'Sent'` | `Sent` or `Failed` |
| `error` | `TEXT` | `NULL` | Error message (if dispatch failed) |
| `sent_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Dispatch timestamp |

---

## 8. Backend REST API Specifications

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings` | Retrieve all bookings from PostgreSQL | None | `{ success: true, count: N, data: [...] }` |
| `GET` | `/api/bookings/:id` | Get details of a single booking | None | `{ success: true, data: { ... } }` |
| `POST` | `/api/bookings` | Create new booking & trigger Stage 1 email | Booking JSON object | `{ success: true, message: '...', data: { ... } }` |
| `PATCH`| `/api/bookings/:id/status`| Update status (`Confirmed`/`Cancelled`) & trigger Stage 2 voucher | `{ status: 'Confirmed' }` | `{ success: true, message: '...', data: { ... } }` |
| `POST` | `/api/bookings/:id/resend-confirmation` | Resend Stage 2 Voucher | None | `{ success: true, message: '...' }` |
| `DELETE`| `/api/bookings/:id` | Delete booking from PostgreSQL | None | `{ success: true, message: '...' }` |
| `GET` | `/api/email-logs` | Retrieve last 100 email logs | None | `{ success: true, count: N, data: [...] }` |

---

## 9. Security, Reliability & Performance Standards

1. **Credential Security:** All sensitive secrets (PostgreSQL connection strings, Gmail SMTP passwords) are stored exclusively in `.env` and excluded from Git commits via `.gitignore`.
2. **Parameterized SQL Queries:** All database queries utilize parameterized inputs (`$1, $2, ...`) via `node-postgres` to safeguard against SQL Injection.
3. **Double Submission Prevention (Debounce):** All form submissions enforce UI button disablement and an in-memory `_isSubmitting` flag to eliminate duplicate transactions.
4. **SSL/TLS Encryption:** Database connections enforce SSL encryption (`sslmode=require`).
5. **Cross-Origin Resource Sharing (CORS):** Express middleware is configured to accept legitimate cross-origin requests securely.

---

## 10. Deployment & Hosting Configuration

### 10.1 Environment Variables Required

```env
PORT=8080
DATABASE_URL=postgresql://neondb_owner:npg_gjMHuh9X5Wal@ep-snowy-meadow-ay862b8h.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require
SMTP_SERVICE=gmail
SMTP_USER=anabiaxhaikh190@gmail.com
SMTP_PASS=yyho dghn nteo bfdx
EMAIL_FROM="Explore Galiyat Reservations" <anabiaxhaikh190@gmail.com>
ADMIN_NOTIFICATION_EMAIL=anabiaxhaikh190@gmail.com
```

### 10.2 Steps to Deploy on Vercel
1. Push repository code to GitHub (`main` branch).
2. Connect repository to Vercel.
3. In **Vercel Project Settings ➔ Environment Variables**, add:
   - `DATABASE_URL`
   - `SMTP_SERVICE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `ADMIN_NOTIFICATION_EMAIL`
4. Redeploy project. Vercel automatically deploys static frontend files and routes `/api/*` requests to the Serverless Express handler.
