import { Request, Response } from 'express';
import huggingfaceService from './huggingface.service.js';
import logger from '../../config/logger.js';

export class AIController {
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

            const responseText = await huggingfaceService.chat(message, systemPrompt);

            res.status(200).json({
                success: true,
                data: {
                    response: responseText,
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
