const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const { initDatabase, pool } = require('./src/config/database');
const { startEmailWorker, stopEmailWorker } = require('./src/jobs/email.worker');

let server = null;

async function bootstrap() {
    try {
        // 1. Initialize Database, Migrations & Seeds
        await initDatabase();

        // 2. Start Background Email Job Worker
        startEmailWorker(4000);

        // 3. Start Express Server
        if (require.main === module || !process.env.VERCEL) {
            server = app.listen(env.PORT, () => {
                logger.info('======================================================');
                logger.info(`🚀 Explore Galiyat Server running on http://localhost:${env.PORT}`);
                logger.info(`📊 Admin Portal: http://localhost:${env.PORT}/admin.html`);
                logger.info(`Environment: ${env.NODE_ENV}`);
                logger.info('======================================================');
            });
        }
    } catch (err) {
        logger.error(`❌ Server bootstrap failed: ${err.message}`, { stack: err.stack });
        if (env.IS_PROD) {
            process.exit(1);
        }
    }
}

// Graceful Shutdown
function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    stopEmailWorker();
    if (server) {
        server.close(async () => {
            logger.info('HTTP server closed.');
            await pool.end();
            logger.info('Database connections closed. Exiting process.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

bootstrap();

module.exports = app;
