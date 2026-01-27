// FBLA Connect - Navigation Types
import { NavigatorScreenParams } from '@react-navigation/native';

// Root stack navigator params
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth stack params
export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
};

// Onboarding stack params
export type OnboardingStackParamList = {
    RoleSelection: undefined;
    SchoolInfo: undefined;
    Interests: undefined;
    Notifications: undefined;
    AIIntro: undefined;
};

// Main tab navigator params
export type MainTabParamList = {
    Home: NavigatorScreenParams<HomeStackParamList>;
    Calendar: NavigatorScreenParams<CalendarStackParamList>;
    Resources: NavigatorScreenParams<ResourcesStackParamList>;
    AI: undefined;
    Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Home stack params
export type HomeStackParamList = {
    HomeMain: undefined;
    SocialHub: undefined;
};

// Calendar stack params
export type CalendarStackParamList = {
    CalendarMain: undefined;
    EventDetail: { eventId: string };
    CreateEvent: undefined;
};

// Resources stack params
export type ResourcesStackParamList = {
    ResourcesList: undefined;
    CompetitiveEvents: undefined;
    ResourceDetail: { resourceId: string };
    ResourceViewer: { resourceId: string; url: string };
};

// Profile stack params
export type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;
    Badges: undefined;
    Leaderboard: undefined;
    Settings: undefined;
};

// News stack params (nested in Home)
export type NewsStackParamList = {
    NewsFeed: undefined;
    NewsDetail: { newsId: string };
};

// Social stack params (nested in Home)
export type SocialStackParamList = {
    SocialFeed: undefined;
    SocialPost: { postId: string; platform: string };
};
