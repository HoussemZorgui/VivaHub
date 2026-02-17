import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import { config } from './config/index.js';
import logger from './config/logger.js';
import mongoDatabase from './database/mongodb.js';
import postgresDatabase from './database/postgres.js';
import redisCache from './database/redis.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import weatherRoutes from './modules/weather/weather.routes.js';
import healthRoutes from './modules/health/health.routes.js';

// ...

export class App {
    public app: Application;
    public httpServer: HTTPServer;
    public io: SocketIOServer;

    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: config.cors.origin,
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeWebSocket();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        // Security
        this.app.use(helmet());

        // CORS
        this.app.use(
            cors({
                origin: config.cors.origin,
                credentials: true,
            })
        );

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging
        if (config.env === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined'));
        }

        // Rate limiting
        this.app.use('/api/', apiLimiter);

        logger.info('Middlewares initialized');
    }

    private initializeRoutes(): void {
        // Health check
        this.app.get('/health', (_req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: 'LifeHub API is running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: config.env,
                databases: {
                    mongodb: mongoDatabase.isConnectionReady(),
                    postgres: postgresDatabase.isConnectionReady(),
                    redis: redisCache.isConnectionReady(),
                },
            });
        });

        // API routes
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/ai', aiRoutes);
        this.app.use('/api/finance', financeRoutes);
        this.app.use('/api/weather', weatherRoutes);
        this.app.use('/api/health', healthRoutes);
        // this.app.use('/api/media', mediaRoutes);
        // this.app.use('/api/gamification', gamificationRoutes);

        logger.info('Routes initialized');
    }

    private initializeWebSocket(): void {
        this.io.on('connection', (socket) => {
            logger.info(`WebSocket: Client connected - ${socket.id}`);

            socket.on('disconnect', () => {
                logger.info(`WebSocket: Client disconnected - ${socket.id}`);
            });

            // TODO: Add WebSocket event handlers
            // socket.on('message', handleMessage);
            // socket.on('typing', handleTyping);
            // socket.on('join-room', handleJoinRoom);
        });

        logger.info('WebSocket initialized');
    }

    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use(notFound);

        // Error handler
        this.app.use(errorHandler);

        logger.info('Error handling initialized');
    }

    public async connectDatabases(): Promise<void> {
        try {
            // Connect to MongoDB
            await mongoDatabase.connect();

            // Connect to PostgreSQL (optional - non-blocking for now)
            try {
                await postgresDatabase.connect();
            } catch (postgresError) {
                logger.warn('PostgreSQL connection failed (optional service):', postgresError);
                logger.warn('Continuing without PostgreSQL database...');
            }

            // Connect to Redis (optional - non-blocking)
            try {
                await redisCache.connect();
            } catch (redisError) {
                logger.warn('Redis connection failed (optional service):', redisError);
                logger.warn('Continuing without Redis cache...');
            }

            logger.info('All databases connected successfully');
        } catch (error) {
            logger.error('Database connection failed (CRITICAL):', error);
            throw error;
        }
    }

    public listen(): void {
        this.httpServer.listen(config.port, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 LifeHub API Server                                   ║
║                                                           ║
║   Environment: ${config.env.padEnd(42)}║
║   Port:        ${String(config.port).padEnd(42)}║
║   URL:         ${`http://localhost:${config.port}`.padEnd(42)}║
║                                                           ║
║   Databases:                                              ║
║   - MongoDB:    ${(mongoDatabase.isConnectionReady() ? '✅ Connected' : '❌ Disconnected').padEnd(40)}║
║   - PostgreSQL: ${(postgresDatabase.isConnectionReady() ? '✅ Connected' : '❌ Disconnected').padEnd(40)}║
║   - Redis:      ${(redisCache.isConnectionReady() ? '✅ Connected' : '❌ Disconnected').padEnd(40)}║
║                                                           ║
║   Ready to accept connections! 🎉                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });
    }

    public getServer(): HTTPServer {
        return this.httpServer;
    }

    public getIO(): SocketIOServer {
        return this.io;
    }
}

export default App;
