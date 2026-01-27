// FBLA Connect - Resources Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ResourcesStackParamList } from './types';
import ResourcesScreen from '../../features/resources/screens/ResourcesScreen';
import CompetitiveEventsScreen from '../../features/resources/screens/CompetitiveEventsScreen';

const Stack = createNativeStackNavigator<ResourcesStackParamList>();

export default function ResourcesNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ResourcesList" component={ResourcesScreen} />
            {/* Added CompetitiveEvents as a named route */}
            <Stack.Screen
                name="CompetitiveEvents"
                component={CompetitiveEventsScreen as any}
            />
        </Stack.Navigator>
    );
}
