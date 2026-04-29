import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { AppProvider } from './src/context';
import { ExpertProvider } from './src/context/ExpertContext';
import { ShopProvider } from './src/context/ShopContext';
import AppNavigator from './src/navigation/AppNavigator';
import { AppNotifyHost } from './src/components';

// Ignore specific warnings (optional)
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

import {
    useFonts,
    IrishGrover_400Regular
} from '@expo-google-fonts/irish-grover';

export default function App() {
    let [fontsLoaded] = useFonts({
        IrishGrover_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <I18nextProvider i18n={i18n}>
                    <AppProvider>
                        <ExpertProvider>
                            <ShopProvider>
                                <StatusBar
                                    barStyle="dark-content"
                                    backgroundColor="#ffffff"
                                    translucent={false}
                                />
                                <NavigationContainer>
                                    <AppNavigator />
                                    <AppNotifyHost />
                                </NavigationContainer>
                            </ShopProvider>
                        </ExpertProvider>
                    </AppProvider>
                </I18nextProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
