import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense'
}

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: TransactionType;
    amount: number;
    category: string;
    description?: string;
    date: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
