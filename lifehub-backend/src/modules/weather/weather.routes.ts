import { Router } from 'express';
import weatherController from './weather.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Get current weather
router.get('/', authenticate, weatherController.getWeather.bind(weatherController));

export default router;
