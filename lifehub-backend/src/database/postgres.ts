import { Sequelize } from 'sequelize';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

export class PostgresDatabase {
    private static instance: PostgresDatabase;
    private sequelize: Sequelize;
    private isConnected: boolean = false;

    private constructor() {
        this.sequelize = new Sequelize(
            config.postgres.database,
            config.postgres.username,
            config.postgres.password,
            {
                host: config.postgres.host,
                port: config.postgres.port,
                dialect: config.postgres.dialect,
                logging: config.postgres.logging ? (msg) => logger.debug(msg) : false,
                pool: {
                    max: 10,
                    min: 0,
                    acquire: 30000,
                    idle: 10000,
                },
            }
        );
    }

    public static getInstance(): PostgresDatabase {
        if (!PostgresDatabase.instance) {
            PostgresDatabase.instance = new PostgresDatabase();
        }
        return PostgresDatabase.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info('PostgreSQL: Already connected');
            return;
        }

        try {
            await this.sequelize.authenticate();
            this.isConnected = true;
            logger.info('PostgreSQL: Connected successfully');

            // Sync models in development (use migrations in production)
            if (config.env === 'development') {
                await this.sequelize.sync({ alter: true });
                logger.info('PostgreSQL: Models synchronized');
            }

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        } catch (error) {
            logger.error('PostgreSQL: Connection failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.sequelize.close();
            this.isConnected = false;
            logger.info('PostgreSQL: Disconnected successfully');
        } catch (error) {
            logger.error('PostgreSQL: Error during disconnection:', error);
            throw error;
        }
    }

    public getSequelize(): Sequelize {
        return this.sequelize;
    }

    public isConnectionReady(): boolean {
        return this.isConnected;
    }
}

export default PostgresDatabase.getInstance();
