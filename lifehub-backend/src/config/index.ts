import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
    // Server
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),

    // Database - MongoDB
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lifehub',
        testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lifehub_test',
    },

    // Database - PostgreSQL
    postgres: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        database: process.env.POSTGRES_DB || 'lifehub_finance',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        dialect: 'postgres' as const,
        logging: process.env.NODE_ENV === 'development',
    },

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },

    // OAuth
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
        },
        facebook: {
            appId: process.env.FACEBOOK_APP_ID || '',
            appSecret: process.env.FACEBOOK_APP_SECRET || '',
            callbackURL: process.env.FACEBOOK_CALLBACK_URL || '',
        },
        apple: {
            clientId: process.env.APPLE_CLIENT_ID || '',
            teamId: process.env.APPLE_TEAM_ID || '',
            keyId: process.env.APPLE_KEY_ID || '',
            privateKey: process.env.APPLE_PRIVATE_KEY || '',
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            callbackURL: process.env.GITHUB_CALLBACK_URL || '',
        },
    },

    // Firebase
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    },

    // AI APIs
    ai: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        },
        huggingface: {
            apiKey: process.env.HUGGINGFACE_API_KEY || '',
        },
    },

    // External APIs
    apis: {
        coinGecko: {
            apiKey: process.env.COINGECKO_API_KEY || '',
        },
        openExchangeRates: {
            apiKey: process.env.OPEN_EXCHANGE_RATES_API_KEY || '',
        },
        googleCalendar: {
            apiKey: process.env.GOOGLE_CALENDAR_API_KEY || '',
        },
        notion: {
            apiKey: process.env.NOTION_API_KEY || '',
        },
        edamam: {
            appId: process.env.EDAMAM_APP_ID || '',
            appKey: process.env.EDAMAM_APP_KEY || '',
        },
        foursquare: {
            apiKey: process.env.FOURSQUARE_API_KEY || '',
        },
        mapbox: {
            accessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
        },
        openWeatherMap: {
            apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
        },
    },

    // Stripe
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8081'],
    },

    // Email
    email: {
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
        },
        from: process.env.EMAIL_FROM || 'noreply@lifehub.app',
    },

    // App URLs
    urls: {
        frontend: process.env.FRONTEND_URL || 'http://localhost:8081',
        backend: process.env.BACKEND_URL || 'http://localhost:5000',
    },

    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
        uploadDir: process.env.UPLOAD_DIR || 'uploads',
    },

    // Security
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
        mfaSecretLength: parseInt(process.env.MFA_SECRET_LENGTH || '32', 10),
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'debug',
        file: process.env.LOG_FILE || 'logs/app.log',
    },
};

export default config;
