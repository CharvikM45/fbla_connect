// FBLA Connect - Profile Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import ChapterManagementScreen from '../../features/profile/screens/ChapterManagementScreen';
import AdvisorDashboardScreen from '../../features/profile/screens/AdvisorDashboardScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen
                name="ChapterManagement"
                component={ChapterManagementScreen}
                options={{ headerShown: true, title: 'Chapter Management' }}
            />
            <Stack.Screen
                name="AdvisorDashboard"
                component={AdvisorDashboardScreen}
                options={{ headerShown: true, title: 'Advisor Dashboard' }}
            />
        </Stack.Navigator>
    );
}
