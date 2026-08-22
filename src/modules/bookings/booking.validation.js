/**
 * Server-side input validation and sanitization for bookings
 */

function sanitizeString(str, maxLen = 255) {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, maxLen);
}

function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    return emailRegex.test(email.trim()) && email.length <= 255;
}

function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
}

function validateBookingPayload(body) {
    const errors = [];

    // 1. Name validation
    const firstName = sanitizeString(body.firstName || '', 100);
    const lastName = sanitizeString(body.lastName || '', 100);
    const guestName = sanitizeString(body.guestName || `${firstName} ${lastName}`.trim() || '', 255);

    if (!firstName && !guestName) {
        errors.push('First name or guest name is required.');
    }

    // 2. Email validation
    const email = (body.email || '').trim();
    if (!email) {
        errors.push('Email address is required.');
    } else if (!isValidEmail(email)) {
        errors.push('Invalid email address format.');
    }

    // 3. Phone validation
    const phone = sanitizeString(body.phone || '', 50);
    if (!phone) {
        errors.push('Phone number is required.');
    } else if (!isValidPhone(phone)) {
        errors.push('Phone number must contain at least 7 digits.');
    }

    // 4. Room & Guest Counts
    let roomsCount = parseInt(body.roomsCount, 10);
    if (isNaN(roomsCount) || roomsCount < 1) {
        roomsCount = 1;
    } else if (roomsCount > 20) {
        errors.push('Maximum 20 rooms can be booked in a single request.');
    }

    // 5. Date validation (if structured check-in and check-out dates are provided)
    let checkInDate = body.checkInDate ? sanitizeString(body.checkInDate, 50) : null;
    let checkOutDate = body.checkOutDate ? sanitizeString(body.checkOutDate, 50) : null;

    if (checkInDate && checkOutDate) {
        const inDate = new Date(checkInDate);
        const outDate = new Date(checkOutDate);
        if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
            errors.push('Invalid date format provided for check-in or check-out.');
        } else if (outDate <= inDate) {
            errors.push('Check-out date must be strictly after check-in date.');
        }
    }

    // 6. Sanitized Strings
    const sanitizedData = {
        firstName,
        lastName,
        guestName: guestName || `${firstName} ${lastName}`.trim() || 'Valued Guest',
        email,
        phone,
        street: sanitizeString(body.street || '', 255),
        street2: sanitizeString(body.street2 || '', 255),
        city: sanitizeString(body.city || '', 100),
        state: sanitizeString(body.state || '', 100),
        postal: sanitizeString(body.postal || '', 50),
        country: sanitizeString(body.country || 'Pakistan', 100),
        propertyId: sanitizeString(body.propertyId || '', 50) || null,
        property: sanitizeString(body.property || body.propertyName || 'Explore Galiyat Stay & Tour', 255),
        roomTypeId: sanitizeString(body.roomTypeId || '', 50) || null,
        roomType: sanitizeString(body.roomType || body.roomTypeName || 'Standard Room', 255),
        roomsCount,
        guestsCount: sanitizeString(body.guestsCount || '2 adults · 0 children', 100),
        datetime: sanitizeString(body.datetime || body.datetimeText || new Date().toLocaleString(), 100),
        checkInDate,
        checkOutDate,
        bookingType: sanitizeString(body.bookingType || 'Reservation', 100),
        confirmationChannel: sanitizeString(body.confirmationChannel || 'Email', 50),
        specialRequests: sanitizeString(body.specialRequests || '', 1000),
        comments: sanitizeString(body.comments || '', 1000),
        totalPrice: Math.max(0, Number(body.totalPrice) || 0)
    };

    return {
        isValid: errors.length === 0,
        errors,
        data: sanitizedData
    };
}

module.exports = {
    validateBookingPayload,
    isValidEmail,
    isValidPhone,
    sanitizeString
};
