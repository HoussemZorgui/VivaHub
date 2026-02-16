import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../config/logger.js';

export type ValidationSource = 'body' | 'query' | 'params';

export const validate = (
    schema: Joi.ObjectSchema,
    source: ValidationSource = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            logger.warn('Validation error:', { errors, source });

            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }

        // Replace request data with validated data
        req[source] = value;
        next();
    };
};

// Common validation schemas
export const schemas = {
    // Auth schemas
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required(),
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required(),
    }),

    resetPassword: Joi.object({
        password: Joi.string().min(8).required(),
    }),

    updateProfile: Joi.object({
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(2).max(50),
        username: Joi.string().alphanum().min(3).max(30),
        avatar: Joi.string().uri(),
        phoneNumber: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/),
        dateOfBirth: Joi.date().max('now'),
        bio: Joi.string().max(500),
        location: Joi.string().max(100),
        timezone: Joi.string(),
        language: Joi.string().length(2),
        preferences: Joi.object({
            notifications: Joi.object({
                push: Joi.boolean(),
                email: Joi.boolean(),
                sms: Joi.boolean(),
            }),
            privacy: Joi.object({
                profileVisibility: Joi.string().valid('public', 'private', 'friends'),
                activityVisibility: Joi.string().valid('public', 'private', 'friends'),
            }),
            theme: Joi.string().valid('light', 'dark', 'auto'),
        }),
    }),

    // Pagination
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        sort: Joi.string(),
        order: Joi.string().valid('asc', 'desc').default('desc'),
    }),

    // ID parameter
    id: Joi.object({
        id: Joi.string().required(),
    }),
};

export default validate;
