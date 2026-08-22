-- Migration 007: Patch Missing Columns on email_logs

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'job_id') THEN
        ALTER TABLE email_logs ADD COLUMN job_id INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'message_id') THEN
        ALTER TABLE email_logs ADD COLUMN message_id VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'preview_url') THEN
        ALTER TABLE email_logs ADD COLUMN preview_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'booking_id') THEN
        ALTER TABLE email_logs ADD COLUMN booking_id VARCHAR(50);
    END IF;
END $$;
