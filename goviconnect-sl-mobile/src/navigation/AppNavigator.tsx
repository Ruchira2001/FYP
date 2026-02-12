import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useExpert } from '../context/ExpertContext';
import { FarmerNavigator } from './RootNavigator';
import ExpertRootNavigator from './ExpertRootNavigator';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
    const { isAuthenticated: isFarmerAuth, isInitialized: isFarmerInitialized } = useApp();
    const { isAuthenticated: isExpertAuth, isInitialized: isExpertInitialized } = useExpert();
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        if (isFarmerInitialized && isExpertInitialized) {
            if (isFarmerAuth) {
                setInitialRoute('FarmerApp');
            } else if (isExpertAuth) {
                setInitialRoute('ExpertApp');
            } else {
                setInitialRoute('RoleSelection');
            }
        }
    }, [isFarmerAuth, isExpertAuth, isFarmerInitialized, isExpertInitialized]);

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
        </Stack.Navigator>
    );
};

export default AppNavigator;
