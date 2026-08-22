-- Migration 003: Bookings, Idempotency & Room Inventory

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    uuid_id VARCHAR(50) UNIQUE,
    guest_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    street TEXT,
    street2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Pakistan',
    property_id VARCHAR(50) REFERENCES properties(id) ON DELETE SET NULL,
    property VARCHAR(255) NOT NULL,
    room_type_id VARCHAR(50) REFERENCES room_types(id) ON DELETE SET NULL,
    room_type VARCHAR(255) DEFAULT 'Standard Room',
    rooms_count INT DEFAULT 1,
    guests_count VARCHAR(100) DEFAULT '2 adults · 0 children',
    check_in_date DATE,
    check_out_date DATE,
    datetime VARCHAR(100),
    booking_type VARCHAR(100) DEFAULT 'Reservation',
    confirmation_channel VARCHAR(50) DEFAULT 'Email',
    special_requests TEXT,
    comments TEXT,
    currency CHAR(3) DEFAULT 'PKR',
    subtotal NUMERIC(12,2) DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total_price NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending',
    confirmed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(50) REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure older bookings table schema has all new columns if upgrading
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'uuid_id') THEN
        ALTER TABLE bookings ADD COLUMN uuid_id VARCHAR(50) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'deleted_at') THEN
        ALTER TABLE bookings ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'deleted_by') THEN
        ALTER TABLE bookings ADD COLUMN deleted_by VARCHAR(50) REFERENCES admin_users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'property_id') THEN
        ALTER TABLE bookings ADD COLUMN property_id VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'room_type_id') THEN
        ALTER TABLE bookings ADD COLUMN room_type_id VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'currency') THEN
        ALTER TABLE bookings ADD COLUMN currency CHAR(3) DEFAULT 'PKR';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'subtotal') THEN
        ALTER TABLE bookings ADD COLUMN subtotal NUMERIC(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tax') THEN
        ALTER TABLE bookings ADD COLUMN tax NUMERIC(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount') THEN
        ALTER TABLE bookings ADD COLUMN discount NUMERIC(12,2) DEFAULT 0;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    response_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_inventory (
    id SERIAL PRIMARY KEY,
    room_type_id VARCHAR(50) REFERENCES room_types(id) ON DELETE CASCADE,
    inventory_date DATE NOT NULL,
    total_rooms INT NOT NULL DEFAULT 5,
    reserved_rooms INT NOT NULL DEFAULT 0,
    available_rooms INT NOT NULL DEFAULT 5,
    UNIQUE(room_type_id, inventory_date)
);
