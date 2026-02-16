import { createClient, RedisClientType } from 'redis';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

export class RedisCache {
    private static instance: RedisCache;
    private client: RedisClientType;
    private isConnected: boolean = false;

    private constructor() {
        this.client = createClient({
            socket: {
                host: config.redis.host,
                port: config.redis.port,
            },
            password: config.redis.password,
        });

        // Error handler
        this.client.on('error', (error) => {
            logger.error('Redis: Error:', error);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            logger.info('Redis: Connecting...');
        });

        this.client.on('ready', () => {
            this.isConnected = true;
            logger.info('Redis: Connected and ready');
        });

        this.client.on('end', () => {
            this.isConnected = false;
            logger.info('Redis: Connection closed');
        });
    }

    public static getInstance(): RedisCache {
        if (!RedisCache.instance) {
            RedisCache.instance = new RedisCache();
        }
        return RedisCache.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info('Redis: Already connected');
            return;
        }

        try {
            await this.client.connect();
            logger.info('Redis: Connected successfully');

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        } catch (error) {
            logger.error('Redis: Connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.client.quit();
            this.isConnected = false;
            logger.info('Redis: Disconnected successfully');
        } catch (error) {
            logger.error('Redis: Error during disconnection:', error);
            throw error;
        }
    }

    public getClient(): RedisClientType {
        return this.client;
    }

    // Utility methods
    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            logger.error(`Redis: Error getting key ${key}:`, error);
            return null;
        }
    }

    public async set(key: string, value: string, expiresIn?: number): Promise<boolean> {
        try {
            if (expiresIn) {
                await this.client.setEx(key, expiresIn, value);
            } else {
                await this.client.set(key, value);
            }
            return true;
        } catch (error) {
            logger.error(`Redis: Error setting key ${key}:`, error);
            return false;
        }
    }

    public async delete(key: string): Promise<boolean> {
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            logger.error(`Redis: Error deleting key ${key}:`, error);
            return false;
        }
    }

    public async flush(): Promise<boolean> {
        try {
            await this.client.flushAll();
            return true;
        } catch (error) {
            logger.error('Redis: Error flushing database:', error);
            return false;
        }
    }

    public isConnectionReady(): boolean {
        return this.isConnected;
    }
}

export default RedisCache.getInstance();
