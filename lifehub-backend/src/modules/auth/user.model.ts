import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;

    // Authentication
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;

    // OAuth
    googleId?: string;
    facebookId?: string;
    appleId?: string;
    githubId?: string;

    // OTP
    otpCode?: string;
    otpExpires?: Date;

    // MFA
    mfaEnabled: boolean;
    mfaSecret?: string;

    // Profile
    bio?: string;
    location?: string;
    timezone?: string;
    language: string;

    // Gamification
    points: number;
    level: number;
    badges: string[];

    // Preferences
    preferences: {
        notifications: {
            push: boolean;
            email: boolean;
            sms: boolean;
        };
        privacy: {
            profileVisibility: 'public' | 'private' | 'friends';
            activityVisibility: 'public' | 'private' | 'friends';
        };
        theme: 'light' | 'dark' | 'auto';
    };

    // Metadata
    lastLogin?: Date;
    lastActivity?: Date;
    isActive: boolean;
    isBanned: boolean;
    banReason?: string;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    generatePasswordResetToken(): string;
    generateEmailVerificationToken(): string;
    generateOTP(): string;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            select: false, // Don't return password by default
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        avatar: String,
        phoneNumber: String,
        dateOfBirth: Date,

        // Authentication
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,

        // OAuth
        googleId: {
            type: String,
            sparse: true,
            index: true,
        },
        facebookId: {
            type: String,
            sparse: true,
            index: true,
        },
        appleId: {
            type: String,
            sparse: true,
            index: true,
        },
        githubId: {
            type: String,
            sparse: true,
            index: true,
        },

        // OTP
        otpCode: String,
        otpExpires: Date,

        // MFA
        mfaEnabled: {
            type: Boolean,
            default: false,
        },
        mfaSecret: String,

        // Profile
        bio: String,
        location: String,
        timezone: {
            type: String,
            default: 'UTC',
        },
        language: {
            type: String,
            default: 'en',
        },

        // Gamification
        points: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        badges: {
            type: [String],
            default: [],
        },

        // Preferences
        preferences: {
            notifications: {
                push: {
                    type: Boolean,
                    default: true,
                },
                email: {
                    type: Boolean,
                    default: true,
                },
                sms: {
                    type: Boolean,
                    default: false,
                },
            },
            privacy: {
                profileVisibility: {
                    type: String,
                    enum: ['public', 'private', 'friends'],
                    default: 'public',
                },
                activityVisibility: {
                    type: String,
                    enum: ['public', 'private', 'friends'],
                    default: 'friends',
                },
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'auto',
            },
        },

        // Metadata
        lastLogin: Date,
        lastActivity: Date,
        isActive: {
            type: Boolean,
            default: true,
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
        banReason: String,
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                delete ret.password;
                delete ret.mfaSecret;
                delete ret.passwordResetToken;
                delete ret.emailVerificationToken;
                return ret;
            },
        },
    }
);

// Indexes for performance
UserSchema.index({ email: 1, username: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ points: -1, level: -1 }); // For leaderboard

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token (6-digit OTP for mobile)
UserSchema.methods.generatePasswordResetToken = function (): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.passwordResetToken = otp;
    this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    return otp;
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function (): string {
    const verificationToken = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    this.emailVerificationToken = verificationToken;
    this.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours

    return verificationToken;
};

// Generate 6-digit OTP
UserSchema.methods.generateOTP = function (): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpCode = otp;
    this.otpExpires = new Date(Date.now() + 600000); // 10 minutes
    return otp;
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
