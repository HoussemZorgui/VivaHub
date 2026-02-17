import axios from 'axios';
import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AIService {
    private async getAuthHeader() {
        const token = await AsyncStorage.getItem('@lifehub:token');
        return { Authorization: `Bearer ${token}` };
    }

    async getHistory() {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.get(`${config.api.baseURL}/ai/history`, { headers });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async chat(message: string, systemPrompt?: string) {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.post(`${config.api.baseURL}/ai/chat`, {
                message,
                systemPrompt,
            }, { headers });

            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async generateImage(prompt: string) {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.post(`${config.api.baseURL}/ai/image`, {
                prompt,
            }, {
                headers,
                responseType: 'blob'
            });

            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
}

export const aiService = new AIService();
