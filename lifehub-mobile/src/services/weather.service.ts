export const weatherService = {
    getWeather: async (lat?: number, lon?: number) => {
        try {
            const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('@lifehub:token'));
            const config = (await import('../config')).config;
            const axios = (await import('axios')).default;
            const response = await axios.get(`${config.api.baseURL}/weather`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { lat, lon }
            });
            return response.data;
        } catch (error) {
            console.error('Weather error:', error);
            return { success: false };
        }
    }
};
