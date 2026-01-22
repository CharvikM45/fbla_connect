// FBLA Connect - Profile Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OfficerRole {
    title: string;
    level: 'chapter' | 'district' | 'state' | 'national';
    startDate: string;
    endDate?: string;
}

export interface CompetitiveEvent {
    id: string;
    name: string;
    category: string;
    year: string;
    level?: 'chapter' | 'district' | 'regional' | 'state' | 'national';
    placement?: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
    category: 'attendance' | 'competition' | 'leadership' | 'service' | 'special';
}

export interface Profile {
    userId: string;
    bio?: string;
    gradeLevel: 9 | 10 | 11 | 12 | 'alumni';
    graduationYear?: number;
    interests: string[];
    careerGoals: string[];
    officerRoles: OfficerRole[];
    competitiveEvents: CompetitiveEvent[];
    badges: Badge[];
    totalXP: number;
    level: number;
    contactPreferences: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    privacySettings: {
        showProfile: boolean;
        showBadges: boolean;
        showEvents: boolean;
    };
}

interface ProfileState {
    profile: Profile | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    profile: null,
    isLoading: false,
    error: null,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setProfile: (state, action: PayloadAction<Profile>) => {
            state.profile = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
            }
        },
        addBadge: (state, action: PayloadAction<Badge>) => {
            if (state.profile) {
                state.profile.badges.push(action.payload);
            }
        },
        addXP: (state, action: PayloadAction<number>) => {
            if (state.profile) {
                state.profile.totalXP += action.payload;
                // Level up every 1000 XP
                state.profile.level = Math.floor(state.profile.totalXP / 1000) + 1;
            }
        },
        addCompetitiveEvent: (state, action: PayloadAction<CompetitiveEvent>) => {
            if (state.profile) {
                state.profile.competitiveEvents.push(action.payload);
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
        },
    },
});

export const {
    setLoading,
    setProfile,
    updateProfile,
    addBadge,
    addXP,
    addCompetitiveEvent,
    setError,
    clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
