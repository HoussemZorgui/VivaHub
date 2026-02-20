import { Router } from 'express';
import authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate, schemas } from '../../middleware/validate.middleware.js';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(schemas.register), authController.register.bind(authController));

router.post('/login', authLimiter, validate(schemas.login), authController.login.bind(authController));

router.post('/refresh-token', validate(schemas.refreshToken), authController.refreshToken.bind(authController));

router.post('/verify-otp', authLimiter, validate(schemas.verifyOTP), authController.verifyOTP.bind(authController));
router.post('/resend-otp', authLimiter, validate(schemas.resendOTP), authController.resendOTP.bind(authController));

router.post('/google', authLimiter, validate(schemas.googleLogin), authController.googleLogin.bind(authController));
router.post('/github', authLimiter, validate(schemas.githubLogin), authController.githubLogin.bind(authController));

router.post('/forgot-password', passwordResetLimiter, validate(schemas.forgotPassword), authController.forgotPassword.bind(authController));

router.post('/reset-password/:token', validate(schemas.resetPassword), authController.resetPassword.bind(authController));

// Protected routes
router.get('/profile', authenticate, authController.getProfile.bind(authController) as any);

router.patch('/profile', authenticate, validate(schemas.updateProfile), authController.updateProfile.bind(authController) as any);

router.post('/logout', authenticate, authController.logout.bind(authController) as any);

// TODO: OAuth routes
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google'), authController.oauthCallback);

export default router;
