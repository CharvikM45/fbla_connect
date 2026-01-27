// FBLA Connect - News Service
import { NewsItem, NewsLevel } from '../../features/news/newsSlice';

const STATE_API_MAP: Record<string, string> = {
    'GA': 'https://georgiafbla.org/wp-json/wp/v2/posts?per_page=10',
    'NE': 'https://nebraskafbla.org/wp-json/wp/v2/posts?per_page=10', // Hypothetical
};

const NATIONAL_API = 'https://www.fbla.org/wp-json/wp/v2/posts?per_page=10'; // Hypothetical

export const fetchStateNews = async (stateId: string): Promise<Partial<NewsItem>[]> => {
    const url = STATE_API_MAP[stateId];
    if (!url) return [];

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data.map((post: any) => ({
            id: `wp-${post.id}`,
            title: post.title.rendered,
            summary: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
            content: post.content.rendered,
            publishedAt: post.date,
            level: 'state' as NewsLevel,
            stateId,
            authorName: `${stateId} FBLA`,
            isPinned: false,
            priority: 'normal',
            isRead: false,
            isSaved: false,
            linkUrl: post.link,
            imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url
        }));
    } catch (error) {
        console.error(`Error fetching news for ${stateId}:`, error);
        return [];
    }
};

export const fetchNationalNews = async (): Promise<Partial<NewsItem>[]> => {
    // Similar to fetchStateNews if national FBLA uses WP
    return [];
};
