import { Request, Response } from 'express';
import nutritionService from './nutrition.service.js';
import logger from '../../config/logger.js';

class HealthController {
    /**
     * Search for food items
     * @route GET /api/health/nutrition/search
     */
    async searchFood(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string;
            if (!query) {
                res.status(400).json({ success: false, message: 'Recherche vide' });
                return;
            }

            const results = await nutritionService.searchFood(query);
            res.status(200).json({ success: true, data: results });
        } catch (error: any) {
            logger.error('Search Food Error:', error);
            res.status(500).json({ success: false, message: 'Erreur lors de la recherche' });
        }
    }

    /**
     * Get detailed nutrients for a food query
     * @route POST /api/health/nutrition/nutrients
     */
    async getNutrients(req: Request, res: Response): Promise<void> {
        try {
            const { query } = req.body;
            if (!query) {
                res.status(400).json({ success: false, message: 'Requete invalide' });
                return;
            }

            const nutrients = await nutritionService.getNutrients(query);
            res.status(200).json({ success: true, data: nutrients });
        } catch (error: any) {
            logger.error('Get Nutrients Error:', error);
            res.status(500).json({ success: false, message: 'Erreur lors de la récupération des nutriments' });
        }
    }
}

export default new HealthController();
