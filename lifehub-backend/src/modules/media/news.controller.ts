import { Request, Response, NextFunction } from 'express';
import newsService from './news.service.js';

class NewsController {
    /**
     * Get news by category
     */
    async getNews(req: Request, res: Response, next: NextFunction) {
        try {
            const { category } = req.params;
            const news = await newsService.getNewsByCategory(category);

            res.status(200).json({
                success: true,
                count: news.length,
                data: news
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all available news categories
     */
    async getCategories(_req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await newsService.getAllCategories();

            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new NewsController();
