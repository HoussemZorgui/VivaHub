import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    tags: string[];

    // Dates
    dueDate?: Date;
    startDate?: Date;
    completedAt?: Date;

    // AI Features
    aiPriority?: number; // AI-suggested priority score (0-100)
    aiSuggestions?: string[];

    // Location-based
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
        address?: string;
    };

    // Subtasks
    subtasks: {
        title: string;
        completed: boolean;
    }[];

    // Attachments
    attachments: {
        url: string;
        filename: string;
        mimeType: string;
        size: number;
    }[];

    // Collaboration
    sharedWith: mongoose.Types.ObjectId[];
    isPublic: boolean;

    // Recurrence
    recurrence?: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval: number; // every X days/weeks/months
        endDate?: Date;
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'completed', 'cancelled'],
            default: 'todo',
            index: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
            index: true,
        },
        category: {
            type: String,
            trim: true,
            index: true,
        },
        tags: {
            type: [String],
            default: [],
            index: true,
        },

        // Dates
        dueDate: {
            type: Date,
            index: true,
        },
        startDate: Date,
        completedAt: Date,

        // AI Features
        aiPriority: {
            type: Number,
            min: 0,
            max: 100,
        },
        aiSuggestions: [String],

        // Location
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: undefined,
            },
            address: String,
        },

        // Subtasks
        subtasks: {
            type: [
                {
                    title: { type: String, required: true },
                    completed: { type: Boolean, default: false },
                },
            ],
            default: [],
        },

        // Attachments
        attachments: {
            type: [
                {
                    url: { type: String, required: true },
                    filename: { type: String, required: true },
                    mimeType: String,
                    size: Number,
                },
            ],
            default: [],
        },

        // Collaboration
        sharedWith: {
            type: [Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
        isPublic: {
            type: Boolean,
            default: false,
        },

        // Recurrence
        recurrence: {
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly', 'yearly'],
            },
            interval: {
                type: Number,
                min: 1,
            },
            endDate: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// Indexes for performance
TaskSchema.index({ userId: 1, status: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, category: 1 });
TaskSchema.index({ location: '2dsphere' }); // Geospatial index

// Virtual for overdue
TaskSchema.virtual('isOverdue').get(function (this: ITask) {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
        return false;
    }
    return this.dueDate < new Date();
});

// Middleware to set completedAt
TaskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'completed') {
        this.completedAt = new Date();
    }
    next();
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
