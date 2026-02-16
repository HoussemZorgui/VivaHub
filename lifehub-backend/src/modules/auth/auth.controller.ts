import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User, IUser } from './user.model.js';
import { config } from '../../config/index.js';
import logger from '../../config/logger.js';

export interface AuthRequest extends Request {
    user?: IUser;
    userId?: string;
}

export class AuthController {
    // Register new user
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, username } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }],
            });

            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'User with this email or username already exists',
                });
                return;
            }

            // Create new user
            const user = new User({
                email,
                password,
                firstName,
                lastName,
                username,
            });

            // Generate email verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save();

            // TODO: Send verification email
            logger.info(`Verification token for ${email}: ${verificationToken}`);

            // Generate JWT token
            const token = this.generateToken(user._id.toString());
            const refreshToken = this.generateRefreshToken(user._id.toString());

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please verify your email.',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        isEmailVerified: user.isEmailVerified,
                    },
                    token,
                    refreshToken,
                },
            });
        } catch (error: any) {
            logger.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message,
            });
        }
    }

    // Login user
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Find user and include password
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
                return;
            }

            // Check if user is banned
            if (user.isBanned) {
                res.status(403).json({
                    success: false,
                    message: `Account banned. Reason: ${user.banReason || 'Not specified'}`,
                });
                return;
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
                return;
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate tokens
            const token = this.generateToken(user._id.toString());
            const refreshToken = this.generateRefreshToken(user._id.toString());

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        avatar: user.avatar,
                        isEmailVerified: user.isEmailVerified,
                        mfaEnabled: user.mfaEnabled,
                    },
                    token,
                    refreshToken,
                },
            });
        } catch (error: any) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message,
            });
        }
    }

    // Verify email
    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.params;

            const user = await User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: new Date() },
            });

            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token',
                });
                return;
            }

            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
            });
        } catch (error: any) {
            logger.error('Email verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Email verification failed',
                error: error.message,
            });
        }
    }

    // Refresh token
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
                return;
            }

            // Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                config.jwt.refreshSecret
            ) as { userId: string };

            // Generate new tokens
            const newToken = this.generateToken(decoded.userId);
            const newRefreshToken = this.generateRefreshToken(decoded.userId);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token: newToken,
                    refreshToken: newRefreshToken,
                },
            });
        } catch (error: any) {
            logger.error('Refresh token error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
                error: error.message,
            });
        }
    }

    // Get current user profile
    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const user = await User.findById(req.userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { user },
            });
        } catch (error: any) {
            logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile',
                error: error.message,
            });
        }
    }

    // Update profile
    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const updates = req.body;
            const allowedUpdates = [
                'firstName',
                'lastName',
                'username',
                'avatar',
                'phoneNumber',
                'dateOfBirth',
                'bio',
                'location',
                'timezone',
                'language',
                'preferences',
            ];

            // Filter updates
            const filteredUpdates: any = {};
            Object.keys(updates).forEach((key) => {
                if (allowedUpdates.includes(key)) {
                    filteredUpdates[key] = updates[key];
                }
            });

            const user = await User.findByIdAndUpdate(
                req.userId,
                filteredUpdates,
                { new: true, runValidators: true }
            );

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: { user },
            });
        } catch (error: any) {
            logger.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: error.message,
            });
        }
    }

    // Forgot password
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            const resetToken = user.generatePasswordResetToken();
            await user.save();

            // TODO: Send password reset email
            logger.info(`Password reset token for ${email}: ${resetToken}`);

            res.status(200).json({
                success: true,
                message: 'Password reset email sent',
            });
        } catch (error: any) {
            logger.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process forgot password',
                error: error.message,
            });
        }
    }

    // Reset password
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() },
            });

            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token',
                });
                return;
            }

            user.password = password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password reset successfully',
            });
        } catch (error: any) {
            logger.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reset password',
                error: error.message,
            });
        }
    }

    // Helper: Generate JWT token
    private generateToken(userId: string): string {
        return jwt.sign({ userId }, config.jwt.secret as Secret, {
            expiresIn: config.jwt.expiresIn as any,
        });
    }

    // Helper: Generate refresh token
    private generateRefreshToken(userId: string): string {
        return jwt.sign({ userId }, config.jwt.refreshSecret as Secret, {
            expiresIn: config.jwt.refreshExpiresIn as any,
        });
    }
}

export default new AuthController();
