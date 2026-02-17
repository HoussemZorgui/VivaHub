import mongoose, { Document, Schema } from 'mongoose';

export enum MessageSender {
    USER = 'user',
    ai = 'ai'
}

export interface IMessage {
    text: string;
    sender: MessageSender;
    timestamp: Date;
}

export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    messages: IMessage[];
    lastUpdated: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One chat history per user for now
        },
        messages: [
            {
                text: { type: String, required: true },
                sender: { type: String, enum: Object.values(MessageSender), required: true },
                timestamp: { type: Date, default: Date.now },
            },
        ],
        lastUpdated: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
export default Chat;
