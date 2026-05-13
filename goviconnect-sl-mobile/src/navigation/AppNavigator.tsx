import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useExpert } from '../context/ExpertContext';
import { useShop } from '../context/ShopContext';
import { FarmerNavigator } from './RootNavigator';
import ExpertRootNavigator from './ExpertRootNavigator';
import ShopNavigator from './ShopNavigator';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import { Splash, Onboarding, LanguageSelect } from '../screens/auth';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
    const { isInitialized: isFarmerInitialized } = useApp();
    const { isInitialized: isExpertInitialized } = useExpert();
    const { isInitialized: isShopInitialized } = useShop();

    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        if (isFarmerInitialized && isExpertInitialized && isShopInitialized) {
            setInitialRoute('Splash');
        }
    }, [isFarmerInitialized, isExpertInitialized, isShopInitialized]);

    if (!initialRoute) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <ActivityIndicator size="large" color={COLORS.primary[500]} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                name="Splash"
                component={Splash}
                options={{
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="Onboarding"
                component={Onboarding}
                options={{
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="LanguageSelect"
                component={LanguageSelect}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="RoleSelection"
                component={RoleSelectionScreen}
                options={{
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="FarmerApp"
                component={FarmerNavigator}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="ExpertApp"
                component={ExpertRootNavigator}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="ShopApp"
                component={ShopNavigator}
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
