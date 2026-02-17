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

            // Simple chart data aggregation (monthly) - basic implementation
            // In a real app, this should be more robust with full date range handling
            const chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Placeholder for now, ideally dynamic
                income: [0, 0, 0, 0, 0, 0], // Placeholder
                expenses: [0, 0, 0, 0, 0, 0] // Placeholder
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
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color for now
                legendFontColor: '#7F7F7F',
                legendFontSize: 12
            }));

            res.status(200).json({
                success: true,
                data: {
                    balance,
                    income: totalIncome,
                    expense: totalExpense,
                    transactions: transactions.slice(0, 5), // Recent 5
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
}

export default new FinanceController();
