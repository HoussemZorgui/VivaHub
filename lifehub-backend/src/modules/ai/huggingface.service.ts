import { HfInference } from '@huggingface/inference';
import { config } from '../../config/index.js';
import logger from '../../config/logger.js';

class HuggingFaceService {
    private hf: HfInference;

    constructor() {
        const apiKey = config.ai.huggingface?.apiKey;
        if (!apiKey || apiKey === 'your_huggingface_api_key') {
            logger.warn('Hugging Face API key is missing or default. AI features will fallback/fail.');
        }
        this.hf = new HfInference(apiKey);
    }

    async chat(message: string, systemPrompt?: string): Promise<string> {
        try {
            const response = await this.hf.chatCompletion({
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                messages: [
                    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            return response.choices[0].message.content || '';
        } catch (error: any) {
            logger.error('Hugging Face Chat Error:', error);
            throw new Error('Failed to generate response from AI');
        }
    }

    async generateImage(prompt: string): Promise<Blob> {
        try {
            const response = await this.hf.textToImage({
                model: 'stabilityai/stable-diffusion-xl-base-1.0',
                inputs: prompt,
            });

            return response as unknown as Blob;
        } catch (error: any) {
            logger.error('Hugging Face Image Error:', error);
            throw new Error('Failed to generate image from AI');
        }
    }
}

export default new HuggingFaceService();
