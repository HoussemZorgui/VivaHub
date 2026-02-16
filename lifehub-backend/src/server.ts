import 'dotenv/config';
import { App } from './app.js';
import logger from './config/logger.js';

async function bootstrap() {
    try {
        // Create app instance
        const app = new App();

        // Connect to databases
        await app.connectDatabases();

        // Start server
        app.listen();

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down gracefully...');
            app.getServer().close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received, shutting down gracefully...');
            app.getServer().close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error: Error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Bootstrap the application
bootstrap();
