import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';
import { config } from '../config/index.js';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || 'Internal server error';

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(config.env === 'development' && {
            stack: err.stack,
            details: err,
        }),
    });
};

export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};

export default {
    AppError,
    errorHandler,
    notFound,
};
