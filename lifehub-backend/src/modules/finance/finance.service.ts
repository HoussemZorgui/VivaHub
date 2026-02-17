import axios from 'axios';
import logger from '../../config/logger.js';

class FinanceService {
    private readonly baseURL = 'https://api.coingecko.com/api/v3';
    private apiKey: string | undefined;

    constructor() {
        // The API key is optional for the public API, but can be added if available
        this.apiKey = process.env.COINGECKO_API_KEY;
    }

    private getHeaders() {
        const headers: any = {
            'Accept': 'application/json',
        };
        // Only add x-cg-demo-api-key if we have a key
        if (this.apiKey) {
            headers['x-cg-demo-api-key'] = this.apiKey;
        }
        return headers;
    }

    async getMarketData(currency: string = 'usd', limit: number = 20) {
        try {
            const response = await axios.get(`${this.baseURL}/coins/markets`, {
                params: {
                    vs_currency: currency,
                    order: 'market_cap_desc',
                    per_page: limit,
                    page: 1,
                    sparkline: true,
                    price_change_percentage: '24h'
                },
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            logger.error('CoinGecko API Error:', error.response?.data || error.message);
            // Fallback data in case of rate limit or error
            if (error.response?.status === 429) {
                logger.warn('CoinGecko Rate Limit Reached. Returning cached/mock data.');
                // For now return empty or simple mock
                return [];
            }
            throw new Error('Failed to fetch market data');
        }
    }

    async getCoinDetails(coinId: string) {
        try {
            const response = await axios.get(`${this.baseURL}/coins/${coinId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: true
                },
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            logger.error(`CoinGecko Details Error (${coinId}):`, error.response?.data || error.message);
            throw new Error(`Failed to fetch details for ${coinId}`);
        }
    }
}

export default new FinanceService();
