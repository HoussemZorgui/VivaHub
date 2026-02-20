import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.smtp.host,
            port: config.email.smtp.port,
            secure: config.email.smtp.port === 465,
            auth: {
                user: config.email.smtp.user,
                pass: config.email.smtp.pass,
            },
        });
    }

    async sendOTP(email: string, otp: string): Promise<boolean> {
        console.log(`[EmailService] Attempting to send OTP to ${email}...`);
        try {
            const mailOptions = {
                from: `"VivaHub Auth" <${config.email.from}>`,
                to: email,
                subject: 'Your Verification Code - VivaHub',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #6200ee; text-align: center;">Welcome to VivaHub!</h2>
                        <p>To complete your registration, please use the following one-time password (OTP):</p>
                        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 5px;">
                            ${otp}
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">© 2026 VivaHub. All rights reserved.</p>
                    </div>
                `,
            };

            console.log(`[EmailService] Sending mail with options:`, { from: mailOptions.from, to: mailOptions.to });
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] Mail sent successfully! MessageId: ${info.messageId}`);
            if (config.env === 'development') {
                console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);
            }
            return true;
        } catch (error: any) {
            console.error(`[EmailService] CRITICAL ERROR:`, error.message);
            logger.error('Failed to send OTP email:', error);
            // Even if email fails, we log the OTP in dev for easy testing
            if (config.env === 'development') {
                console.log(`[DEV ONLY] The OTP for ${email} is: ${otp}`);
                logger.info(`[DEV] OTP for ${email}: ${otp}`);
            }
            return false;
        }
    }
}

export default new EmailService();
