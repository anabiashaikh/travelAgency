const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../config/logger');

let transporter = null;
let etherealAccount = null;

const EmailService = {
    /**
     * Get or initialize Nodemailer transporter
     */
    async getTransporter() {
        if (transporter) return transporter;

        if (env.SMTP_USER && env.SMTP_PASS) {
            if (env.SMTP_SERVICE === 'gmail' || env.SMTP_USER.includes('@gmail.com')) {
                transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: env.SMTP_USER,
                        pass: env.SMTP_PASS
                    }
                });
                logger.info(`📧 Configured Gmail SMTP for ${env.SMTP_USER}`);
            } else {
                transporter = nodemailer.createTransport({
                    host: env.SMTP_HOST,
                    port: env.SMTP_PORT,
                    secure: env.SMTP_SECURE,
                    auth: {
                        user: env.SMTP_USER,
                        pass: env.SMTP_PASS
                    }
                });
                logger.info(`📧 Configured custom SMTP (${env.SMTP_HOST}:${env.SMTP_PORT})`);
            }
        } else {
            // Development test fallback with Ethereal
            try {
                etherealAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: etherealAccount.user,
                        pass: etherealAccount.pass
                    }
                });
                logger.info('📧 Initialized Ethereal test email account for development preview.');
            } catch (err) {
                logger.warn('Could not initialize Ethereal account, using JSON transport fallback.');
                transporter = nodemailer.createTransport({ jsonTransport: true });
            }
        }

        return transporter;
    },

    /**
     * Enqueue email job into the database
     */
    async enqueueEmailJob(dbClient, { bookingId, type, recipientEmail, subject, payload }) {
        const query = `
            INSERT INTO email_jobs (booking_id, type, recipient_email, subject, payload, status, next_retry_at)
            VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW())
            RETURNING id;
        `;
        const res = await dbClient.query(query, [
            bookingId,
            type,
            recipientEmail,
            subject,
            JSON.stringify(payload)
        ]);

        logger.info(`Enqueued email job #${res.rows[0].id} (${type} to ${recipientEmail})`);
        return res.rows[0].id;
    }
};

module.exports = EmailService;
