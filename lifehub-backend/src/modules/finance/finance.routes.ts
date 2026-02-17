import { Router } from 'express';
import financeController from './finance.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Define routes for Finance module
router.get('/market', authenticate, financeController.getMarketOverview.bind(financeController));
router.get('/coins/:id', authenticate, financeController.getCoinDetails.bind(financeController));

export default router;
