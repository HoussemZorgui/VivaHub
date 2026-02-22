import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User, IUser } from './user.model.js';
import { config } from '../../config/index.js';
import logger from '../../config/logger.js';
import emailService from '../../services/email.service.js';
import redisCache from '../../database/redis.js';
import axios from 'axios';

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

            // Generate OTP
            const otpCode = user.generateOTP();
            await user.save();

            // Send OTP email
            await emailService.sendOTP(email, otpCode);

            // Generate JWT token
            const token = this.generateToken(user._id.toString());
            const refreshToken = this.generateRefreshToken(user._id.toString());

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please verify your email with the OTP sent.',
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

            // Store session in Redis for ultra-solid security
            await redisCache.set(`session:${user._id}:${token.slice(-10)}`, 'active', 604800); // 7 days

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

    // Verify OTP
    async verifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;

            const user = await User.findOne({
                email,
                otpCode: otp,
                otpExpires: { $gt: new Date() },
            });

            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP',
                });
                return;
            }

            user.isEmailVerified = true;
            user.otpCode = undefined;
            user.otpExpires = undefined;
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

    // Resend OTP
    async resendOTP(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            const otp = user.generateOTP();
            await user.save();
            await emailService.sendOTP(email, otp);

            res.status(200).json({
                success: true,
                message: 'New OTP sent to your email',
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Failed to resend OTP' });
        }
    }

    // Logout
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                await redisCache.delete(`session:${req.userId}:${token.slice(-10)}`);
            }

            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Logout failed' });
        }
    }

    // Google Login
    async googleLogin(req: Request, res: Response): Promise<void> {
        try {
            const { idToken } = req.body;

            // Verify token with Google
            const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: avatar } = response.data;

            let user = await User.findOne({ email });

            if (!user) {
                // Register new user via Google
                user = new User({
                    email,
                    googleId,
                    firstName: firstName || 'Google',
                    lastName: lastName || 'User',
                    username: `user_${Math.random().toString(36).slice(2, 7)}`,
                    avatar,
                    isEmailVerified: true, // Google emails are pre-verified
                });
                await user.save();
            } else {
                // Link Google account if not linked
                if (!user.googleId) {
                    user.googleId = googleId;
                    await user.save();
                }
            }

            const token = this.generateToken(user._id.toString());
            const refreshToken = this.generateRefreshToken(user._id.toString());

            // Track session
            await redisCache.set(`session:${user._id}:${token.slice(-10)}`, 'active', 604800);

            res.status(200).json({
                success: true,
                data: { user, token, refreshToken }
            });
        } catch (error: any) {
            logger.error('Google login error:', error);
            res.status(401).json({ success: false, message: 'Google authentication failed' });
        }
    }

    // GitHub Login
    async githubLogin(req: Request, res: Response): Promise<void> {
        try {
            const { accessToken } = req.body;

            // Get user info from GitHub
            const response = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const { id: githubId, email, name, login: githubUsername, avatar_url: avatar } = response.data;

            // GitHub doesn't always return a public email
            const userEmail = email || `${githubUsername}@github.com`;

            let user = await User.findOne({ $or: [{ githubId: githubId.toString() }, { email: userEmail }] });

            if (!user) {
                user = new User({
                    email: userEmail,
                    githubId: githubId.toString(),
                    firstName: name ? name.split(' ')[0] : githubUsername,
                    lastName: name ? name.split(' ').slice(1).join(' ') : 'User',
                    username: githubUsername,
                    avatar,
                    isEmailVerified: true,
                });
                await user.save();
            } else if (!user.githubId) {
                user.githubId = githubId.toString();
                await user.save();
            }

            const token = this.generateToken(user._id.toString());
            const refreshToken = this.generateRefreshToken(user._id.toString());

            // Track session
            await redisCache.set(`session:${user._id}:${token.slice(-10)}`, 'active', 604800);

            res.status(200).json({
                success: true,
                data: { user, token, refreshToken }
            });
        } catch (error: any) {
            logger.error('GitHub login error:', error);
            res.status(401).json({ success: false, message: 'GitHub authentication failed' });
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

            // Update session in Redis
            await redisCache.set(`session:${decoded.userId}:${newToken.slice(-10)}`, 'active', 604800);

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

            // Send password reset email
            const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

            if (!emailSent) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send password reset email',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Password reset code sent to your email',
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

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, token, password } = req.body;

            const user = await User.findOne({
                email,
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() },
            });

            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid email or expired reset code',
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
