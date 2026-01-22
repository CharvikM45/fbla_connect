// FBLA Connect - Authentication Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'member' | 'officer' | 'adviser';

export interface User {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    avatarUrl?: string;
    schoolName?: string;
    chapterName?: string;
    state?: string;
    createdAt: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    onboardingComplete: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    onboardingComplete: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        completeOnboarding: (state) => {
            state.onboardingComplete = true;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setLoading,
    loginSuccess,
    loginFailure,
    logout,
    updateUser,
    completeOnboarding,
    clearError,
} = authSlice.actions;

export default authSlice.reducer;
