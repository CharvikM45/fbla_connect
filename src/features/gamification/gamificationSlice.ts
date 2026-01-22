// FBLA Connect - Gamification Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type BadgeCategory = 'attendance' | 'competition' | 'leadership' | 'service' | 'social' | 'special';
export type LeaderboardScope = 'chapter' | 'state' | 'national' | 'friends';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    xpValue: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    requirements: string;
    isEarned: boolean;
    earnedAt?: string;
    progress?: number; // 0-100 for progress-based badges
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    chapterName: string;
    state: string;
    totalXP: number;
    level: number;
    rank: number;
    badgeCount: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    xpAwarded: number;
    earnedAt: string;
    badgeId?: string;
}

interface GamificationState {
    badges: Badge[];
    earnedBadges: Badge[];
    leaderboard: LeaderboardEntry[];
    leaderboardScope: LeaderboardScope;
    userRank: number | null;
    recentAchievements: Achievement[];
    streaks: {
        currentMeetingStreak: number;
        longestMeetingStreak: number;
        lastMeetingDate?: string;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: GamificationState = {
    badges: [],
    earnedBadges: [],
    leaderboard: [],
    leaderboardScope: 'chapter',
    userRank: null,
    recentAchievements: [],
    streaks: {
        currentMeetingStreak: 0,
        longestMeetingStreak: 0,
    },
    isLoading: false,
    error: null,
};

const gamificationSlice = createSlice({
    name: 'gamification',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setBadges: (state, action: PayloadAction<Badge[]>) => {
            state.badges = action.payload;
            state.earnedBadges = action.payload.filter(b => b.isEarned);
            state.isLoading = false;
        },
        earnBadge: (state, action: PayloadAction<string>) => {
            const badge = state.badges.find(b => b.id === action.payload);
            if (badge && !badge.isEarned) {
                badge.isEarned = true;
                badge.earnedAt = new Date().toISOString();
                state.earnedBadges.push(badge);

                // Add to recent achievements
                state.recentAchievements.unshift({
                    id: `ach-${Date.now()}`,
                    title: `Badge Earned: ${badge.name}`,
                    description: badge.description,
                    xpAwarded: badge.xpValue,
                    earnedAt: new Date().toISOString(),
                    badgeId: badge.id,
                });
            }
        },
        updateBadgeProgress: (
            state,
            action: PayloadAction<{ badgeId: string; progress: number }>
        ) => {
            const badge = state.badges.find(b => b.id === action.payload.badgeId);
            if (badge) {
                badge.progress = Math.min(100, action.payload.progress);
            }
        },
        setLeaderboard: (state, action: PayloadAction<LeaderboardEntry[]>) => {
            state.leaderboard = action.payload;
        },
        setLeaderboardScope: (state, action: PayloadAction<LeaderboardScope>) => {
            state.leaderboardScope = action.payload;
        },
        setUserRank: (state, action: PayloadAction<number>) => {
            state.userRank = action.payload;
        },
        addAchievement: (state, action: PayloadAction<Achievement>) => {
            state.recentAchievements.unshift(action.payload);
            if (state.recentAchievements.length > 50) {
                state.recentAchievements.pop();
            }
        },
        updateStreak: (state, action: PayloadAction<{ date: string }>) => {
            const today = action.payload.date;
            const lastDate = state.streaks.lastMeetingDate;

            if (!lastDate) {
                state.streaks.currentMeetingStreak = 1;
            } else {
                const lastDateObj = new Date(lastDate);
                const todayObj = new Date(today);
                const diffDays = Math.floor(
                    (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (diffDays === 1) {
                    state.streaks.currentMeetingStreak += 1;
                } else if (diffDays > 1) {
                    state.streaks.currentMeetingStreak = 1;
                }
            }

            state.streaks.lastMeetingDate = today;
            state.streaks.longestMeetingStreak = Math.max(
                state.streaks.longestMeetingStreak,
                state.streaks.currentMeetingStreak
            );
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
    },
});

export const {
    setLoading,
    setBadges,
    earnBadge,
    updateBadgeProgress,
    setLeaderboard,
    setLeaderboardScope,
    setUserRank,
    addAchievement,
    updateStreak,
    setError,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
