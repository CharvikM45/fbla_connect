// FBLA Connect - Main Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { colors } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

// Import navigators

// Import navigators
import HomeNavigator from './HomeNavigator';
import CalendarScreen from '../../features/calendar/screens/CalendarScreen';
import ResourcesNavigator from './ResourcesNavigator';
import AIAssistantScreen from '../../features/ai/assistant/screens/AIAssistantScreen';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = 'home' | 'home-outline' | 'calendar' | 'calendar-outline' |
    'document-text' | 'document-text-outline' | 'chatbubbles' | 'chatbubbles-outline' |
    'person' | 'person-outline';

const getTabIcon = (routeName: string, focused: boolean): IconName => {
    const icons: { [key: string]: { focused: IconName; unfocused: IconName } } = {
        Home: { focused: 'home', unfocused: 'home-outline' },
        Events: { focused: 'calendar', unfocused: 'calendar-outline' },
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
                    borderBottomWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 20,
                    letterSpacing: 0.5,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    const iconName = getTabIcon(route.name, focused);
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.neutral[400],
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: colors.neutral[200],
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
                tabBarHideOnKeyboard: true,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{ title: 'FBLA Connect', headerShown: false }}
            />
            <Tab.Screen
                name="Events"
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
                component={ProfileNavigator}
                options={{ title: 'My Profile', headerShown: false }}
            />
        </Tab.Navigator>
    );
}
