import mongoose from 'mongoose';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

export class MongoDatabase {
    private static instance: MongoDatabase;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): MongoDatabase {
        if (!MongoDatabase.instance) {
            MongoDatabase.instance = new MongoDatabase();
        }
        return MongoDatabase.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info('MongoDB: Already connected');
            return;
        }

        try {
            const uri = config.env === 'test' ? config.mongodb.testUri : config.mongodb.uri;

            await mongoose.connect(uri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.isConnected = true;
            logger.info(`MongoDB: Connected successfully to ${uri}`);

            // Handle connection errors after initial connection
            mongoose.connection.on('error', (error) => {
                logger.error('MongoDB: Connection error:', error);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB: Disconnected');
                this.isConnected = false;
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        } catch (error) {
            logger.error('MongoDB: Connection failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info('MongoDB: Disconnected successfully');
        } catch (error) {
            logger.error('MongoDB: Error during disconnection:', error);
            throw error;
        }
    }

    public getConnection() {
        return mongoose.connection;
    }

    public isConnectionReady(): boolean {
        return this.isConnected && mongoose.connection.readyState === 1;
    }
}

export default MongoDatabase.getInstance();
