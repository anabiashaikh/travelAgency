-- Migration 001: Core Entities (Properties, Room Types, Amenities, Images)

CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(100) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    property_type VARCHAR(50) DEFAULT 'hotel',
    location_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    star_rating INT DEFAULT 4,
    starting_price NUMERIC(12,2) DEFAULT 0,
    description TEXT,
    hero_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_types (
    id VARCHAR(50) PRIMARY KEY,
    property_id VARCHAR(50) REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL,
    capacity_adults INT DEFAULT 2,
    capacity_children INT DEFAULT 1,
    total_rooms INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id VARCHAR(50) REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS property_amenities (
    id SERIAL PRIMARY KEY,
    property_id VARCHAR(50) REFERENCES properties(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    icon_class VARCHAR(50) DEFAULT 'fa-solid fa-check'
);
