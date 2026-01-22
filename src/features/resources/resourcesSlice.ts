// FBLA Connect - Resources Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ResourceType = 'pdf' | 'link' | 'video' | 'document' | 'form';
export type ResourceCategory =
    | 'guidelines'
    | 'rubrics'
    | 'dress-code'
    | 'code-of-conduct'
    | 'study-materials'
    | 'forms'
    | 'other';

export interface Resource {
    id: string;
    title: string;
    description: string;
    type: ResourceType;
    category: ResourceCategory;
    url: string;
    localPath?: string; // For offline cached files
    fileSize?: number;
    lastUpdated: string;
    tags: string[];
    relatedEvents: string[]; // Event IDs
    isFavorite: boolean;
    isDownloaded: boolean;
    downloadedAt?: string;
}

interface ResourcesState {
    resources: Resource[];
    favorites: string[]; // Resource IDs
    recentlyViewed: string[];
    searchQuery: string;
    filters: {
        types: ResourceType[];
        categories: ResourceCategory[];
        downloadedOnly: boolean;
    };
    isLoading: boolean;
    downloadProgress: { [resourceId: string]: number };
    error: string | null;
}

const initialState: ResourcesState = {
    resources: [],
    favorites: [],
    recentlyViewed: [],
    searchQuery: '',
    filters: {
        types: [],
        categories: [],
        downloadedOnly: false,
    },
    isLoading: false,
    downloadProgress: {},
    error: null,
};

const resourcesSlice = createSlice({
    name: 'resources',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setResources: (state, action: PayloadAction<Resource[]>) => {
            state.resources = action.payload;
            state.isLoading = false;
        },
        toggleFavorite: (state, action: PayloadAction<string>) => {
            const resource = state.resources.find(r => r.id === action.payload);
            if (resource) {
                resource.isFavorite = !resource.isFavorite;
                if (resource.isFavorite) {
                    state.favorites.push(resource.id);
                } else {
                    state.favorites = state.favorites.filter(id => id !== resource.id);
                }
            }
        },
        addToRecentlyViewed: (state, action: PayloadAction<string>) => {
            state.recentlyViewed = [
                action.payload,
                ...state.recentlyViewed.filter(id => id !== action.payload),
            ].slice(0, 20); // Keep only 20 most recent
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<ResourcesState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setDownloadProgress: (
            state,
            action: PayloadAction<{ resourceId: string; progress: number }>
        ) => {
            state.downloadProgress[action.payload.resourceId] = action.payload.progress;
        },
        markAsDownloaded: (
            state,
            action: PayloadAction<{ resourceId: string; localPath: string }>
        ) => {
            const resource = state.resources.find(r => r.id === action.payload.resourceId);
            if (resource) {
                resource.isDownloaded = true;
                resource.localPath = action.payload.localPath;
                resource.downloadedAt = new Date().toISOString();
            }
            delete state.downloadProgress[action.payload.resourceId];
        },
        removeDownload: (state, action: PayloadAction<string>) => {
            const resource = state.resources.find(r => r.id === action.payload);
            if (resource) {
                resource.isDownloaded = false;
                resource.localPath = undefined;
                resource.downloadedAt = undefined;
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
    },
});

export const {
    setLoading,
    setResources,
    toggleFavorite,
    addToRecentlyViewed,
    setSearchQuery,
    setFilters,
    setDownloadProgress,
    markAsDownloaded,
    removeDownload,
    setError,
} = resourcesSlice.actions;

export default resourcesSlice.reducer;
