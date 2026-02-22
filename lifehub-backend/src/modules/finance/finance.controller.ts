import { Request, Response } from 'express';
import financeService from './finance.service.js';
import logger from '../../config/logger.js';
import Transaction, { TransactionType } from './transaction.model.js';

class FinanceController {
    async getMarketOverview(_req: Request, res: Response): Promise<void> {
        try {
            const updates = await financeService.getMarketData('usd', 20);
            res.status(200).json({
                success: true,
                data: updates,
            });
        } catch (error: any) {
            logger.error('Finance Market Overview Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch market overview',
                error: error.message,
            });
        }
    }

    async getDashboardData(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            const transactions = await Transaction.find({ userId }).sort({ date: -1 });

            // Calculate totals
            const totalIncome = transactions
                .filter(t => t.type === TransactionType.INCOME)
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpense = transactions
                .filter(t => t.type === TransactionType.EXPENSE)
                .reduce((sum, t) => sum + t.amount, 0);

            const balance = totalIncome - totalExpense;

            // Monthly aggregation for the last 6 months
            const labels = [];
            const incomeData = [];
            const expenseData = [];
            const now = new Date();

            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = d.toLocaleString('fr-FR', { month: 'short' });
                labels.push(monthName);

                const monthTransactions = transactions.filter(t => {
                    const td = new Date(t.date);
                    return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
                });

                incomeData.push(monthTransactions
                    .filter(t => t.type === TransactionType.INCOME)
                    .reduce((sum, t) => sum + t.amount, 0));

                expenseData.push(monthTransactions
                    .filter(t => t.type === TransactionType.EXPENSE)
                    .reduce((sum, t) => sum + t.amount, 0));
            }

            const chartData = {
                labels,
                income: incomeData,
                expenses: expenseData
            };

            // Group expenses by category for Pie Chart
            const expensesByCategory = transactions
                .filter(t => t.type === TransactionType.EXPENSE)
                .reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                }, {} as Record<string, number>);

            const pieData = Object.entries(expensesByCategory).map(([name, population]) => ({
                name,
                population,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                legendFontColor: '#7F7F7F',
                legendFontSize: 12
            }));

            res.status(200).json({
                success: true,
                data: {
                    balance,
                    income: totalIncome,
                    expense: totalExpense,
                    transactions: transactions.slice(0, 10), // Increased to 10
                    chartData,
                    pieData
                }
            });
        } catch (error: any) {
            logger.error('Finance Dashboard Error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
        }
    }

    async getTransactions(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            const transactions = await Transaction.find({ userId }).sort({ date: -1 });
            res.status(200).json({ success: true, data: transactions });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
        }
    }

    async addTransaction(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            const { type, amount, category, description, date } = req.body;

            if (!type || !amount || !category) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }

            const transaction = await Transaction.create({
                userId,
                type,
                amount: Number(amount),
                category,
                description,
                date: date || new Date()
            });

            res.status(201).json({ success: true, data: transaction });
        } catch (error: any) {
            logger.error('Add Transaction Error:', error);
            res.status(500).json({ success: false, message: 'Failed to add transaction' });
        }
    }

    async getCoinDetails(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: 'Coin ID is required' });
                return;
            }

            const details = await financeService.getCoinDetails(id);
            res.status(200).json({
                success: true,
                data: details,
            });
        } catch (error: any) {
            logger.error(`Finance Coin Details Error (${req.params.id}):`, error);
            res.status(500).json({
                success: false,
                message: `Failed to fetch details for ${req.params.id}`,
                error: error.message,
            });
        }
    }

    async getExchangeRates(req: Request, res: Response): Promise<void> {
        try {
            const { base } = req.query;
            const rates = await financeService.getExchangeRates((base as string) || 'USD');
            res.status(200).json({
                success: true,
                data: rates,
            });
        } catch (error: any) {
            logger.error('Finance Exchange Rates Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch exchange rates',
                error: error.message,
            });
        }
    }
}

export default new FinanceController();
