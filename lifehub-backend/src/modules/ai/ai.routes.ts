import { Router } from 'express';
import aiController from './ai.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import Joi from 'joi';

const router = Router();

const chatSchema = Joi.object({
    message: Joi.string().required(),
    systemPrompt: Joi.string().optional(),
});

const imageSchema = Joi.object({
    prompt: Joi.string().required(),
});

// All AI routes are protected
router.get('/history', authenticate, aiController.getHistory.bind(aiController) as any);
router.post('/chat', authenticate, validate(chatSchema), aiController.chat.bind(aiController));
router.post('/image', authenticate, validate(imageSchema), aiController.generateImage.bind(aiController));

export default router;
