import { Request, Response } from 'express';
import weatherService from './weather.service.js';
import logger from '../../config/logger.js';

class WeatherController {
    /**
     * Get current weather
     * @route GET /api/weather
     */
    async getWeather(req: Request, res: Response): Promise<void> {
        try {
            // Default to Paris if no coords provided
            const lat = Number(req.query.lat) || 48.8566;
            const lon = Number(req.query.lon) || 2.3522;

            const weather = await weatherService.getCurrentWeather(lat, lon);

            res.status(200).json({
                success: true,
                data: weather
            });
        } catch (error: any) {
            logger.error('Get Weather Error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
        }
    }
}

export default new WeatherController();
