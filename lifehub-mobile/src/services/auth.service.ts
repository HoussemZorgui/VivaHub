import api from './api.service';

export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phoneNumber?: string;
    bio?: string;
    isEmailVerified: boolean;
    mfaEnabled?: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
        refreshToken: string;
    };
}

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
    phoneNumber?: string;
    bio?: string;
    location?: string;
    preferences?: any;
}

export class AuthService {
    // Register new user
    async register(data: RegisterData): Promise<AuthResponse> {
        return api.post<AuthResponse>('/auth/register', data);
    }

    // Login user
    async login(data: LoginData): Promise<AuthResponse> {
        return api.post<AuthResponse>('/auth/login', data);
    }

    // Get current user profile
    async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
        return api.get('/auth/profile');
    }

    // Update profile
    async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data: { user: User } }> {
        return api.patch('/auth/profile', data);
    }

    // Forgot password
    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
        return api.post('/auth/forgot-password', { email });
    }

    // Reset password
    async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
        return api.post(`/auth/reset-password/${token}`, { password });
    }

    // Verify email with OTP
    async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
        return api.post('/auth/verify-otp', { email, otp });
    }

    // Resend OTP
    async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
        return api.post('/auth/resend-otp', { email });
    }

    // Google Login
    async googleLogin(idToken: string): Promise<AuthResponse> {
        return api.post<AuthResponse>('/auth/google', { idToken });
    }

    // GitHub Login
    async githubLogin(accessToken: string): Promise<AuthResponse> {
        return api.post<AuthResponse>('/auth/github', { accessToken });
    }

    // Refresh token
    async refreshToken(refreshToken: string): Promise<{
        success: boolean;
        data: { token: string; refreshToken: string };
    }> {
        return api.post('/auth/refresh-token', { refreshToken });
    }
}

export const authService = new AuthService();
export default authService;
