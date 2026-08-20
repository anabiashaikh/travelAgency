const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf8');
}

function readBookings() {
    try {
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading bookings file:', err);
        return [];
    }
}

function writeBookings(bookings) {
    try {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing bookings file:', err);
        return false;
    }
}

// Generate unique readable booking ID like GB-1048
function generateBookingId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `GB-${randomNum}`;
}

const Database = {
    getAllBookings() {
        return readBookings().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },

    getBookingById(id) {
        const bookings = readBookings();
        return bookings.find(b => b.id === id || b.id === `#${id}`) || null;
    },

    createBooking(data) {
        const bookings = readBookings();
        const newBooking = {
            id: data.id || generateBookingId(),
            guestName: data.guestName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Valued Guest',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            email: data.email || '',
            street: data.street || '',
            street2: data.street2 || '',
            city: data.city || '',
            state: data.state || '',
            postal: data.postal || '',
            country: data.country || 'Pakistan',
            property: data.property || data.bookingType || 'Galiyat Stay',
            bookingType: data.bookingType || 'Reservation',
            roomType: data.roomType || 'Standard Room',
            roomsCount: data.roomsCount || 1,
            guestsCount: data.guestsCount || '2 adults · 0 children',
            datetime: data.datetime || new Date().toLocaleString(),
            checkInDate: data.checkInDate || '',
            checkOutDate: data.checkOutDate || '',
            totalPrice: Number(data.totalPrice) || 0,
            specialRequests: data.specialRequests || '',
            confirmationChannel: data.confirmationChannel || 'Email',
            comments: data.comments || '',
            status: data.status || 'Pending', // Pending | Confirmed | Cancelled
            createdAt: new Date().toISOString()
        };

        bookings.unshift(newBooking);
        writeBookings(bookings);
        return newBooking;
    },

    updateBookingStatus(id, newStatus) {
        const bookings = readBookings();
        const index = bookings.findIndex(b => b.id === id || b.id === `#${id}`);
        if (index === -1) return null;

        bookings[index].status = newStatus;
        if (newStatus === 'Confirmed') {
            bookings[index].confirmedAt = new Date().toISOString();
        }
        bookings[index].updatedAt = new Date().toISOString();

        writeBookings(bookings);
        return bookings[index];
    },

    deleteBooking(id) {
        let bookings = readBookings();
        const initialLength = bookings.length;
        bookings = bookings.filter(b => b.id !== id && b.id !== `#${id}`);
        if (bookings.length !== initialLength) {
            writeBookings(bookings);
            return true;
        }
        return false;
    }
};

module.exports = Database;
