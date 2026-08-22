const { pool } = require('../config/database');
const EmailService = require('../modules/emails/email.service');
const EmailTemplates = require('../modules/emails/email.templates');
const env = require('../config/env');
const logger = require('../config/logger');

let isRunning = false;
let workerInterval = null;

async function processPendingJobs() {
    if (isRunning) return;
    isRunning = true;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Select pending or retry jobs using row locking to prevent race conditions
        const query = `
            SELECT * FROM email_jobs 
            WHERE status IN ('PENDING', 'RETRY') AND next_retry_at <= NOW()
            ORDER BY id ASC 
            LIMIT 5
            FOR UPDATE SKIP LOCKED;
        `;
        const res = await client.query(query);

        if (res.rows.length === 0) {
            await client.query('COMMIT');
            return;
        }

        const transporter = await EmailService.getTransporter();

        for (const job of res.rows) {
            try {
                let html = '';
                const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;

                switch (job.type) {
                    case 'STAGE1_CUSTOMER_ACKNOWLEDGMENT':
                        html = EmailTemplates.getStage1CustomerEmail(payload);
                        break;
                    case 'STAGE1_ADMIN_ALERT':
                        html = EmailTemplates.getStage1AdminAlert(payload);
                        break;
                    case 'STAGE2_CONFIRMATION_VOUCHER':
                        html = EmailTemplates.getStage2ConfirmationVoucher(payload);
                        break;
                    case 'CANCELLATION_NOTICE':
                        html = EmailTemplates.getCancellationNotice(payload, payload.reason);
                        break;
                    default:
                        html = `<p>${EmailTemplates.escapeHtml(job.subject)}</p>`;
                }

                const mailOptions = {
                    from: env.EMAIL_FROM,
                    to: job.recipient_email,
                    subject: job.subject,
                    html
                };

                const info = await transporter.sendMail(mailOptions);
                const messageId = info.messageId || 'sent-ok';

                // Mark job as SENT
                await client.query(`
                    UPDATE email_jobs 
                    SET status = 'SENT', sent_at = NOW(), message_id = $1, error_message = NULL
                    WHERE id = $2;
                `, [messageId, job.id]);

                // Insert into email_logs
                await client.query(`
                    INSERT INTO email_logs (job_id, booking_id, type, to_email, subject, status, message_id, sent_at)
                    VALUES ($1, $2, $3, $4, $5, 'Sent', $6, NOW());
                `, [job.id, job.booking_id, job.type, job.recipient_email, job.subject, messageId]);

                logger.info(`✔ Dispatched email job #${job.id} (${job.type}) to ${job.recipient_email}`);
            } catch (jobErr) {
                const newAttempt = (job.attempt_count || 0) + 1;
                const maxAttempts = job.max_attempts || 3;
                const isFinalFail = newAttempt >= maxAttempts;
                const newStatus = isFinalFail ? 'FAILED' : 'RETRY';
                const backoffSeconds = Math.pow(2, newAttempt) * 15; // 30s, 60s

                logger.error(`❌ Failed email job #${job.id} (Attempt ${newAttempt}/${maxAttempts}): ${jobErr.message}`);

                await client.query(`
                    UPDATE email_jobs 
                    SET status = $1, attempt_count = $2, error_message = $3, next_retry_at = NOW() + ($4 || ' seconds')::INTERVAL
                    WHERE id = $5;
                `, [newStatus, newAttempt, jobErr.message, backoffSeconds, job.id]);

                if (isFinalFail) {
                    await client.query(`
                        INSERT INTO email_logs (job_id, booking_id, type, to_email, subject, status, error, sent_at)
                        VALUES ($1, $2, $3, $4, $5, 'Failed', $6, NOW());
                    `, [job.id, job.booking_id, job.type, job.recipient_email, job.subject, jobErr.message]);
                }
            }
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error('Error during email worker batch:', { error: err.message });
    } finally {
        client.release();
        isRunning = false;
    }
}

function startEmailWorker(intervalMs = 4000) {
    if (workerInterval) return;
    logger.info(`🚀 Background Email Worker started (polling every ${intervalMs}ms)...`);
    workerInterval = setInterval(processPendingJobs, intervalMs);
    if (workerInterval.unref) workerInterval.unref();
}

function stopEmailWorker() {
    if (workerInterval) {
        clearInterval(workerInterval);
        workerInterval = null;
        logger.info('Background Email Worker stopped.');
    }
}

module.exports = {
    startEmailWorker,
    stopEmailWorker,
    processPendingJobs
};
