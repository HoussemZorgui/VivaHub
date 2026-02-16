import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthRequest } from '../modules/auth/auth.controller.js';
import { User } from '../modules/auth/user.model.js';
import logger from '../config/logger.js';

export interface JwtPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

            // Check if user exists
            const user = await User.findById(decoded.userId);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            if (!user.isActive || user.isBanned) {
                res.status(403).json({
                    success: false,
                    message: 'Account is inactive or banned',
                });
                return;
            }

            // Attach user to request
            req.user = user;
            req.userId = decoded.userId;

            // Update last activity
            user.lastActivity = new Date();
            await user.save();

            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    message: 'Token expired',
                });
                return;
            }

            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                });
                return;
            }

            throw error;
        }
    } catch (error: any) {
        logger.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message,
        });
    }
};

export const optionalAuthenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
            const user = await User.findById(decoded.userId);

            if (user && user.isActive && !user.isBanned) {
                req.user = user;
                req.userId = decoded.userId;
            }
        } catch (error) {
            // Continue without authentication
        }

        next();
    } catch (error: any) {
        logger.error('Optional authentication middleware error:', error);
        next();
    }
};

export const requireEmailVerified = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.user?.isEmailVerified) {
        res.status(403).json({
            success: false,
            message: 'Email verification required',
        });
        return;
    }

    next();
};

export const requireMFA = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.user?.mfaEnabled) {
        next();
        return;
    }

    const mfaToken = req.headers['x-mfa-token'] as string;

    if (!mfaToken) {
        res.status(403).json({
            success: false,
            message: 'MFA token required',
        });
        return;
    }

    // TODO: Verify MFA token (TOTP, SMS, etc.)

    next();
};

export default {
    authenticate,
    optionalAuthenticate,
    requireEmailVerified,
    requireMFA,
};
