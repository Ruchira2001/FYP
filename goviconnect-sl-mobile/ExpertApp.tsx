import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { ExpertProvider } from './src/context/ExpertContext';
import ExpertRootNavigator from './src/navigation/ExpertRootNavigator';

import {
    useFonts,
    IrishGrover_400Regular
} from '@expo-google-fonts/irish-grover';

// Ignore specific warnings
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export default function ExpertApp() {
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
                    <ExpertProvider>
                        <NavigationContainer>
                            <StatusBar
                                barStyle="dark-content"
                                backgroundColor="#ffffff"
                                translucent={false}
                            />
                            <ExpertRootNavigator />
                        </NavigationContainer>
                    </ExpertProvider>
                </I18nextProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
