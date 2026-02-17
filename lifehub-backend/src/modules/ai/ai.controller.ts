import { Request, Response } from 'express';
import huggingfaceService from './huggingface.service.js';
import logger from '../../config/logger.js';
import { Chat, MessageSender } from './chat.model.js';

export class AIController {
    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            let chat = await Chat.findOne({ userId });

            if (!chat) {
                // Return empty history (or welcome message) if no chat exists
                chat = await Chat.create({
                    userId,
                    messages: [{
                        text: "Bonjour ! Je suis votre assistant Neural AI. Comment puis-je vous aider ?",
                        sender: MessageSender.ai,
                        timestamp: new Date()
                    }]
                });
            }

            res.status(200).json({
                success: true,
                data: chat.messages,
            });
        } catch (error: any) {
            logger.error('AI History Error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch history' });
        }
    }

    async chat(req: Request, res: Response): Promise<void> {
        try {
            const { message, systemPrompt } = req.body;

            if (!message) {
                res.status(400).json({
                    success: false,
                    message: 'Message is required',
                });
                return;
            }

            const userId = req.user?._id;

            // 1. Get AI Response
            const responseText = await huggingfaceService.chat(message, systemPrompt);

            // 2. Find or create chat session
            let chat = await Chat.findOne({ userId });

            if (!chat) {
                chat = new Chat({ userId, messages: [] });
            }

            // 3. Append messages
            chat.messages.push({
                text: message,
                sender: MessageSender.USER,
                timestamp: new Date()
            });

            chat.messages.push({
                text: responseText,
                sender: MessageSender.ai,
                timestamp: new Date()
            });

            chat.lastUpdated = new Date();
            await chat.save();

            res.status(200).json({
                success: true,
                data: {
                    response: responseText,
                    history: chat.messages
                },
            });
        } catch (error: any) {
            logger.error('AI Chat Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'AI failed to process your request',
                error: error.message,
            });
        }
    }

    async generateImage(req: Request, res: Response): Promise<void> {
        try {
            const { prompt } = req.body;

            if (!prompt) {
                res.status(400).json({
                    success: false,
                    message: 'Prompt is required',
                });
                return;
            }

            const imageBlob = await huggingfaceService.generateImage(prompt);

            // Set correct content type
            res.type(imageBlob.type || 'image/png');

            // Convert Blob to ArrayBuffer then to Buffer
            const arrayBuffer = await imageBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            res.send(buffer);
        } catch (error: any) {
            logger.error('AI Image Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'AI failed to generate image',
                error: error.message,
            });
        }
    }
}

export default new AIController();
