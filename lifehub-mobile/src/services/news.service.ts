import api from './api.service';

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    image?: string;
    category: string;
}

class NewsService {
    async getCategories(): Promise<string[]> {
        const response = await api.get('/news/categories');
        return response.data;
    }

    async getNews(category: string): Promise<NewsItem[]> {
        const response = await api.get(`/news/${category}`);
        return response.data;
    }
}

export default new NewsService();
