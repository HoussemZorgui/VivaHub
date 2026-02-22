import Parser from 'rss-parser';
import logger from '../../config/logger.js';

type NewsItem = {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    image?: string;
    category: string;
};

class NewsService {
    private parser: Parser;
    private feeds: Record<string, { url: string; name: string }> = {
        tech: {
            url: 'https://www.theverge.com/rss/index.xml',
            name: 'The Verge'
        },
        sport: {
            url: 'https://www.skysports.com/rss/12040',
            name: 'Sky Sports'
        },
        business: {
            url: 'https://www.cnbc.com/id/10001147/device/rss/rss.xml',
            name: 'CNBC Business'
        },
        science: {
            url: 'https://www.wired.com/feed/category/science/latest/rss',
            name: 'Wired Science'
        },
        general: {
            url: 'http://feeds.bbci.co.uk/news/rss.xml',
            name: 'BBC News'
        }
    };

    constructor() {
        this.parser = new Parser({
            customFields: {
                item: [
                    ['media:content', 'mediaContent', { keepArray: true }],
                    ['media:thumbnail', 'mediaThumbnail'],
                    ['content:encoded', 'contentEncoded'],
                    ['media:group', 'mediaGroup'],
                ],
            },
        });
    }

    async getNewsByCategory(category: string): Promise<NewsItem[]> {
        const feedConfig = this.feeds[category.toLowerCase()] || this.feeds.general;

        try {
            const feed = await this.parser.parseURL(feedConfig.url);

            return feed.items.map((item: any) => {
                let image = '';

                // 1. Try media:content (High resolution usually)
                if (item.mediaContent) {
                    const media = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent;
                    if (media && media.$ && media.$.url) {
                        image = media.$.url;
                    }
                }

                // 2. Try media:group (Common in BBC and others)
                if (!image && item.mediaGroup && item.mediaGroup['media:content']) {
                    const groupMedia = item.mediaGroup['media:content'];
                    const media = Array.isArray(groupMedia) ? groupMedia[0] : groupMedia;
                    if (media && media.$ && media.$.url) {
                        image = media.$.url;
                    }
                }

                // 3. Try enclosure (Standard)
                if (!image && item.enclosure && item.enclosure.url) {
                    image = item.enclosure.url;
                }

                // 4. Try media:thumbnail
                if (!image && item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
                    image = item.mediaThumbnail.$.url;
                }

                // 5. Try to extract from content:encoded or content (Regex)
                if (!image) {
                    const searchIn = item.contentEncoded || item.content || item.description || '';
                    const imgMatch = searchIn.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) {
                        image = imgMatch[1];
                    }
                }

                // 6. Specific fix for The Verge / Atom feeds which use <link rel="enclosure">
                if (!image && item.links) {
                    const enclosureLink = item.links.find((l: any) => l.$.rel === 'enclosure');
                    if (enclosureLink) image = enclosureLink.$.href;
                }

                // Fallback to Unsplash WITH keywords based on title for variety if still no image
                if (!image || image.includes('transparent.png')) {
                    const keywords = encodeURIComponent(`${category} ${item.title.split(' ').slice(0, 3).join(' ')}`);
                    image = `https://source.unsplash.com/featured/800x450?${keywords}`;
                }

                return {
                    title: item.title || 'No Title',
                    link: item.link || '',
                    pubDate: item.pubDate || new Date().toISOString(),
                    contentSnippet: (item.contentSnippet || item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 150),
                    source: feedConfig.name,
                    image: image,
                    category: category
                };
            });
        } catch (error: any) {
            logger.error(`Error fetching RSS feed for ${category}:`, error.message);
            throw new Error(`Failed to fetch news for ${category}`);
        }
    }

    async getAllCategories(): Promise<string[]> {
        return Object.keys(this.feeds);
    }
}

export default new NewsService();
