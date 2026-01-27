// FBLA Connect - Home Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import HomeScreen from '../../features/news/screens/HomeScreen';
import SocialHubScreen from '../../features/social/screens/SocialHubScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen
                name="SocialHub"
                component={SocialHubScreen}
                options={{ headerShown: true, title: 'Social Hub' }}
            />
        </Stack.Navigator>
    );
}
