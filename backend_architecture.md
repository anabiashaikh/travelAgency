# 🏛️ Complete Backend Architecture Blueprint
## Galiyat Travel & Tourism Web Platform

This document outlines the end-to-end backend architecture, database schemas, API REST endpoints, security, and project folder structure for your Galiyat Travel Agency website.

---

## 🛠️ 1. Recommended Technology Stack

| Layer | Recommended Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime & Framework** | **Node.js + Express.js** | Lightweight, highly scalable, non-blocking I/O, perfect for JSON REST APIs. |
| **Database** | **MongoDB** (with Mongoose ORM) | Flexible document DB ideally suited for complex itineraries, packages, and booking queries. |
| **Authentication** | **JWT (JSON Web Token) + bcryptjs** | Secure token-based auth for Admin Dashboard management. |
| **Email Service** | **Nodemailer + SMTP** (SendGrid / Mailgun) | Sends instant email notifications to customers & agency admins upon booking/inquiry. |
| **Cloud File Storage** | **Cloudinary** or **AWS S3** | Optimized image storage and fast CDN delivery for gallery photos and package thumbnails. |
| **Security & Middleware** | **Cors, Helmet, Express-Rate-Limit** | Protects against DDoS attacks, XSS, CORS issues, and brute-force requests. |

---

## 📂 2. Backend Project Folder Structure (Layered MVC Architecture)

```
galiyat-backend/
│
├── config/
│   ├── db.js                 # MongoDB connection using Mongoose
│   ├── mailer.js             # Nodemailer / SendGrid configuration
│   └── cloudinary.js         # Cloudinary SDK image upload config
│
├── controllers/
│   ├── bookingController.js   # Handles package booking requests
│   ├── packageController.js   # CRUD operations for tour packages
│   ├── contactController.js   # Handles contact form submissions
│   ├── galleryController.js   # Image gallery filtering & upload
│   └── authController.js      # Admin login & authentication
│
├── models/
│   ├── Booking.js            # Booking Mongoose schema
│   ├── Package.js            # Tour package Mongoose schema
│   ├── Contact.js            # Contact inquiry Mongoose schema
│   ├── Gallery.js            # Gallery item Mongoose schema
│   └── User.js               # Admin user schema
│
├── routes/
│   ├── bookingRoutes.js      # /api/v1/bookings
│   ├── packageRoutes.js      # /api/v1/packages
│   ├── contactRoutes.js      # /api/v1/contact
│   ├── galleryRoutes.js      # /api/v1/gallery
│   └── authRoutes.js         # /api/v1/auth
│
├── middlewares/
│   ├── authMiddleware.js     # JWT token verification for protected admin endpoints
│   ├── errorHandler.js       # Centralized global error handling middleware
│   ├── validateMiddleware.js # Express-validator request validation
│   └── rateLimiter.js        # IP rate limiting for API protection
│
├── utils/
│   ├── sendEmail.js          # Helper function for automated email dispatch
│   └── generateToken.js      # JWT token generator function
│
├── .env                      # Environment variables (DB_URI, JWT_SECRET, SMTP)
├── .gitignore
├── package.json
└── server.js                 # Entry point file
```

---

## 🗄️ 3. Database Schemas (Mongoose / MongoDB Models)

### A. `Booking.js` (Package Booking Request)
```javascript
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    packageName: { type: String, required: true },
    destination: { type: String, required: true },
    travelDate: { type: Date, required: true },
    groupSize: { type: Number, required: true, default: 1 },
    specialRequests: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
```

### B. `Contact.js` (General Contact Inquiry)
```javascript
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    destination: { type: String, required: true },
    travelDate: { type: Date },
    travelersCount: { type: Number, default: 1 },
    preferredPackage: { type: String, default: 'Custom' },
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'Contacted', 'Closed'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
```

### C. `Package.js` (Tour Package Information)
```javascript
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    duration: { type: String, required: true }, // e.g. "3 Days / 2 Nights"
    destination: { type: String, required: true }, // e.g. "Abbottabad & Galiyat"
    pricePerPerson: { type: Number, required: true }, // e.g. 25000
    badge: { type: String, default: 'BESTSELLER' },
    thumbnail: { type: String, required: true },
    heroImage: { type: String, required: true },
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itinerary: [{
        day: { type: String }, // e.g. "DAY 01"
        title: { type: String }, // e.g. "Abbottabad → Nathia Gali"
        activities: [{ type: String }]
    }],
    placesVisited: [{ type: String }],
    activitiesList: [{ type: String }],
    accommodation: { type: String },
    importantInfo: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
```

---

## 🔗 4. RESTful API Endpoints List

### 📝 Booking API Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/bookings` | Public | Submit a new package booking inquiry |
| `GET` | `/api/v1/bookings` | Admin | Get list of all bookings (with pagination/filters) |
| `GET` | `/api/v1/bookings/:id` | Admin | Get single booking details |
| `PATCH` | `/api/v1/bookings/:id/status` | Admin | Update booking status (`Confirmed`, `Cancelled`) |

### ✉️ Contact API Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/contact` | Public | Submit contact inquiry form |
| `GET` | `/api/v1/contact` | Admin | Get list of all contact inquiries |

### 📦 Tour Packages API Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/packages` | Public | Fetch all packages (supports duration & budget query params) |
| `GET` | `/api/v1/packages/:slug` | Public | Fetch single package detail by slug (e.g. `beauteous-galiyat`) |
| `POST` | `/api/v1/packages` | Admin | Create a new tour package |
| `PUT` | `/api/v1/packages/:id` | Admin | Update an existing tour package |
| `DELETE` | `/api/v1/packages/:id` | Admin | Delete a tour package |

### 🖼️ Gallery API Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/gallery` | Public | Get gallery photos (filter by category: `Mountains`, `Forests`, `Hiking`) |
| `POST` | `/api/v1/gallery` | Admin | Upload new gallery image |

### 🔑 Authentication API Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Admin Login (returns JWT Token) |
| `GET` | `/api/v1/auth/me` | Admin | Get current logged-in admin user info |

---

## ⚡ 5. Step-by-Step Implementation Workflow

1. **Initialize Project**:
   ```bash
   mkdir galiyat-backend
   cd galiyat-backend
   npm init -y
   npm install express mongoose dotenv cors helmet nodemailer bcryptjs jsonwebtoken express-validator
   npm install --save-dev nodemon
   ```

2. **Configure `.env`**:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://admin:<password>@cluster.mongodb.net/galiyat_tours?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_2026
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   CLIENT_URL=http://localhost:3000
   ```

3. **Connect Frontend to Backend**:
   - Update frontend `bookingModal` and `contactForm` JavaScript `fetch()` calls to send data to `http://localhost:5000/api/v1/bookings` or `http://localhost:5000/api/v1/contact`.
