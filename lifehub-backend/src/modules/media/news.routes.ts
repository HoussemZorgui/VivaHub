import { Router } from 'express';
import newsController from './news.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Get all categories
router.get('/categories', authenticate, newsController.getCategories);

// Get news by category
router.get('/:category', authenticate, newsController.getNews);

export default router;
