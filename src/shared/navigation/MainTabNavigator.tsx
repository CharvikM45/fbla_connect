// FBLA Connect - Main Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { colors } from '../theme';

// Import navigators
import HomeNavigator from './HomeNavigator';
import CalendarScreen from '../../features/calendar/screens/CalendarScreen';
import ResourcesNavigator from './ResourcesNavigator';
import AIAssistantScreen from '../../features/ai/assistant/screens/AIAssistantScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = 'home' | 'home-outline' | 'calendar' | 'calendar-outline' |
    'document-text' | 'document-text-outline' | 'chatbubbles' | 'chatbubbles-outline' |
    'person' | 'person-outline';

const getTabIcon = (routeName: string, focused: boolean): IconName => {
    const icons: { [key: string]: { focused: IconName; unfocused: IconName } } = {
        Home: { focused: 'home', unfocused: 'home-outline' },
        Calendar: { focused: 'calendar', unfocused: 'calendar-outline' },
        Resources: { focused: 'document-text', unfocused: 'document-text-outline' },
        AI: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
        Profile: { focused: 'person', unfocused: 'person-outline' },
    };

    return focused ? icons[routeName].focused : icons[routeName].unfocused;
};

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                headerStyle: {
                    backgroundColor: colors.primary[600],
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    const iconName = getTabIcon(route.name, focused);
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.neutral[400],
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: colors.neutral[200],
                    paddingBottom: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{ title: 'FBLA Connect', headerShown: false }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{ title: 'Events' }}
            />
            <Tab.Screen
                name="Resources"
                component={ResourcesNavigator}
                options={{ title: 'Resources' }}
            />
            <Tab.Screen
                name="AI"
                component={AIAssistantScreen}
                options={{ title: 'AI Assistant' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'My Profile' }}
            />
        </Tab.Navigator>
    );
}
