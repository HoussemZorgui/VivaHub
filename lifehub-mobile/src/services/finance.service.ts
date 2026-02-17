import axios from 'axios';
import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FinanceService {
    private async getAuthHeader() {
        const token = await AsyncStorage.getItem('@lifehub:token');
        return { Authorization: `Bearer ${token}` };
    }

    async getMarketOverview() {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.get(`${config.api.baseURL}/finance/market`, { headers });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getCoinDetails(id: string) {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.get(`${config.api.baseURL}/finance/coins/${id}`, { headers });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getDashboardData() {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.get(`${config.api.baseURL}/finance/dashboard`, { headers });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getTransactions() {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.get(`${config.api.baseURL}/finance/transactions`, { headers });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async addTransaction(transaction: any) {
        try {
            const headers = await this.getAuthHeader();
            const response = await axios.post(`${config.api.baseURL}/finance/transactions`, transaction, { headers });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
}

export const financeService = new FinanceService();
