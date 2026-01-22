// FBLA Connect - Redux Store Configuration
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import profileReducer from '../features/profile/profileSlice';
import calendarReducer from '../features/calendar/calendarSlice';
import resourcesReducer from '../features/resources/resourcesSlice';
import newsReducer from '../features/news/newsSlice';
import gamificationReducer from '../features/gamification/gamificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        calendar: calendarReducer,
        resources: resourcesReducer,
        news: newsReducer,
        gamification: gamificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for date handling
                ignoredActions: ['calendar/setSelectedDate'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
