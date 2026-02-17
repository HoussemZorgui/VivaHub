import { Router } from 'express';
import healthController from './health.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Nutrition Routes
router.get('/nutrition/search', authenticate, healthController.searchFood.bind(healthController));
router.post('/nutrition/nutrients', authenticate, healthController.getNutrients.bind(healthController));

export default router;
