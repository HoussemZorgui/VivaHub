import { Request, Response } from 'express';
import financeService from './finance.service.js';
import logger from '../../config/logger.js';

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
