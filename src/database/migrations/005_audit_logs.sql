-- Migration 005: Admin Audit Trail

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR(50) REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- 'LOGIN', 'LOGOUT', 'BOOKING_STATUS_CHANGE', 'BOOKING_CANCELLED', 'RESEND_CONFIRMATION', 'SOFT_DELETE_BOOKING', 'ADD_HOTEL', 'ADD_LOCATION'
    entity_type VARCHAR(100) NOT NULL, -- 'booking', 'property', 'room', 'auth'
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
