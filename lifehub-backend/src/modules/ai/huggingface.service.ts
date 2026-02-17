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
            const prompt = systemPrompt
                ? `System: ${systemPrompt}\nUser: ${message}\nAssistant:`
                : `User: ${message}\nAssistant:`;

            const response = await this.hf.textGeneration({
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95,
                    repetition_penalty: 1.2,
                    return_full_text: false,
                },
            });

            return response.generated_text;
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

            return response as Blob;
        } catch (error: any) {
            logger.error('Hugging Face Image Error:', error);
            throw new Error('Failed to generate image from AI');
        }
    }
}

export default new HuggingFaceService();
