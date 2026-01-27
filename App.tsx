// FBLA Connect - Main App Entry Point
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConvexProvider } from "convex/react";
import { convex } from "./src/shared/lib/convex";

import { store } from './src/shared/store';
import { paperTheme, navigationLightTheme } from './src/shared/theme';
import RootNavigator from './src/shared/navigation/RootNavigator';

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <ReduxProvider store={store}>
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <NavigationContainer theme={navigationLightTheme}>
              <StatusBar style="auto" />
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </ReduxProvider>
    </ConvexProvider>
  );
}
