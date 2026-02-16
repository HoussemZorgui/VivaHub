import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.',
        });
    },
});

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.',
    },
    handler: (req: Request, res: Response) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts, please try again later.',
        });
    },
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
    },
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads
    message: {
        success: false,
        message: 'Too many file uploads, please try again later.',
    },
});

// AI endpoints rate limiter
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 AI requests
    message: {
        success: false,
        message: 'Too many AI requests, please try again later.',
    },
});

export default {
    apiLimiter,
    authLimiter,
    passwordResetLimiter,
    uploadLimiter,
    aiLimiter,
};
