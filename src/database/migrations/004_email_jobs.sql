-- Migration 004: Asynchronous Email Jobs Queue & Audit Logs

CREATE TABLE IF NOT EXISTS email_jobs (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'SENT', 'FAILED'
    error_message TEXT,
    message_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    log_id VARCHAR(50),
    job_id INT,
    booking_id VARCHAR(50),
    type VARCHAR(100),
    to_email VARCHAR(255),
    subject VARCHAR(255),
    preview_url TEXT,
    status VARCHAR(50) DEFAULT 'Sent',
    error TEXT,
    message_id VARCHAR(255),
    sent_at TIMESTAMPTZ DEFAULT NOW()
);
