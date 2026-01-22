// FBLA Connect - Onboarding Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';

// Import screens
import RoleSelectionScreen from '../../features/auth/screens/RoleSelectionScreen';
import SchoolInfoScreen from '../../features/auth/screens/SchoolInfoScreen';
import InterestsScreen from '../../features/auth/screens/InterestsScreen';
import NotificationsScreen from '../../features/auth/screens/NotificationsScreen';
import AIIntroScreen from '../../features/auth/screens/AIIntroScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="SchoolInfo" component={SchoolInfoScreen} />
            <Stack.Screen name="Interests" component={InterestsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="AIIntro" component={AIIntroScreen} />
        </Stack.Navigator>
    );
}
