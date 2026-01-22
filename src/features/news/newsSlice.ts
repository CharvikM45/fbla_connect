// FBLA Connect - News Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NewsLevel = 'national' | 'state' | 'chapter';
export type NewsCategory =
    | 'announcement'
    | 'deadline'
    | 'event'
    | 'recognition'
    | 'update'
    | 'alert';

export interface NewsItem {
    id: string;
    title: string;
    content: string;
    summary: string;
    level: NewsLevel;
    category: NewsCategory;
    authorId: string;
    authorName: string;
    authorRole: string;
    publishedAt: string;
    updatedAt?: string;
    expiresAt?: string;
    isPinned: boolean;
    priority: 'normal' | 'high' | 'urgent';
    imageUrl?: string;
    linkUrl?: string;
    tags: string[];
    relatedEventIds: string[];
    chapterId?: string;
    stateId?: string;
    isRead: boolean;
    isSaved: boolean;
}

interface NewsState {
    news: NewsItem[];
    savedNews: string[]; // News IDs
    unreadCount: number;
    filters: {
        levels: NewsLevel[];
        categories: NewsCategory[];
        showPinnedOnly: boolean;
    };
    isLoading: boolean;
    lastRefreshed: string | null;
    error: string | null;
}

const initialState: NewsState = {
    news: [],
    savedNews: [],
    unreadCount: 0,
    filters: {
        levels: [],
        categories: [],
        showPinnedOnly: false,
    },
    isLoading: false,
    lastRefreshed: null,
    error: null,
};

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setNews: (state, action: PayloadAction<NewsItem[]>) => {
            state.news = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
            state.lastRefreshed = new Date().toISOString();
            state.isLoading = false;
        },
        addNewsItem: (state, action: PayloadAction<NewsItem>) => {
            state.news.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const item = state.news.find(n => n.id === action.payload);
            if (item && !item.isRead) {
                item.isRead = true;
                state.unreadCount -= 1;
            }
        },
        markAllAsRead: (state) => {
            state.news.forEach(item => {
                item.isRead = true;
            });
            state.unreadCount = 0;
        },
        toggleSaved: (state, action: PayloadAction<string>) => {
            const item = state.news.find(n => n.id === action.payload);
            if (item) {
                item.isSaved = !item.isSaved;
                if (item.isSaved) {
                    state.savedNews.push(item.id);
                } else {
                    state.savedNews = state.savedNews.filter(id => id !== item.id);
                }
            }
        },
        setFilters: (state, action: PayloadAction<Partial<NewsState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
    },
});

export const {
    setLoading,
    setNews,
    addNewsItem,
    markAsRead,
    markAllAsRead,
    toggleSaved,
    setFilters,
    setError,
} = newsSlice.actions;

export default newsSlice.reducer;
