export const healthService = {
    searchFood: async (query: string) => {
        try {
            const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('@lifehub:token'));
            const config = (await import('../config')).config;
            const axios = (await import('axios')).default;
            const response = await axios.get(`${config.api.baseURL}/health/nutrition/search`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            console.error('Health search error:', error);
            return { success: false, data: { common: [] } };
        }
    },
    getNutrients: async (query: string) => {
        try {
            const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('@lifehub:token'));
            const config = (await import('../config')).config;
            const axios = (await import('axios')).default;
            const response = await axios.post(`${config.api.baseURL}/health/nutrition/nutrients`, { query }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Health nutrients error:', error);
            return { success: false };
        }
    }
};
