const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all frontend static files from /public directory
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// Mount Backend REST API Routes at /api
app.use('/api', bookingRoutes);

// Root route redirects / serves homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Fallback route for client-side routing / unknown pages
app.get('*', (req, res) => {
    const requestedPath = path.join(PUBLIC_DIR, req.path);
    if (requestedPath.endsWith('.html') && require('fs').existsSync(requestedPath)) {
        return res.sendFile(requestedPath);
    }
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log(`🚀 Explore Galiyat Server & Database running on http://localhost:${PORT}`);
    console.log(`📊 Admin Reservations Dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`🏨 Maria Villa Page: http://localhost:${PORT}/maria-villa.html`);
    console.log(`👑 Crown Inn Page: http://localhost:${PORT}/crown-inn.html`);
    console.log('======================================================\n');
});

module.exports = app;
