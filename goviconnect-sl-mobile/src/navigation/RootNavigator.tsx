import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context';

// Import navigators
import TabNavigator from './TabNavigator';

// Import auth screens
import { Splash, Onboarding, LanguageSelect, Login, Register, ForgotPassword } from '../screens/auth';

// Import global screens
import { Notifications } from '../screens/notifications';
import { ChatsList, ChatDetail, BookMeetingFromChat, NewChat } from '../screens/chats';
import { LanguageModal } from '../screens/home';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Auth Stack Navigator
const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Splash" component={Splash} />
        <AuthStack.Screen name="Onboarding" component={Onboarding} />
        <AuthStack.Screen name="LanguageSelect" component={LanguageSelect} />
        <AuthStack.Screen name="Login" component={Login} />
        <AuthStack.Screen name="Register" component={Register} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
    </AuthStack.Navigator>
);

// Farmer Navigator Component (without NavigationContainer)
export const FarmerNavigator: React.FC = () => {
    const { isAuthenticated, hasCompletedOnboarding, isInitialized } = useApp();

    if (!isInitialized) {
        // Could show a loading screen here
        return null;
    }

    // Determine initial route
    const getInitialRouteName = () => {
        if (!hasCompletedOnboarding) {
            return 'Auth';
        }
        if (!isAuthenticated) {
            return 'Auth';
        }
        return 'MainTabs';
    };

    return (
        <RootStack.Navigator
            initialRouteName={getInitialRouteName()}
            screenOptions={{ headerShown: false }}
        >
            {/* Auth Flow */}
            <RootStack.Screen name="Auth" component={AuthNavigator} />

            {/* Main App with Tab Navigation */}
            <RootStack.Screen name="MainTabs" component={TabNavigator} />

            {/* Global Screens (accessible from anywhere) */}
            <RootStack.Screen
                name="Notifications"
                component={Notifications}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <RootStack.Screen
                name="ChatsList"
                component={ChatsList}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <RootStack.Screen
                name="ChatDetail"
                component={ChatDetail}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <RootStack.Screen
                name="NewChat"
                component={NewChat}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <RootStack.Screen
                name="BookMeetingFromChat"
                component={BookMeetingFromChat}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'modal',
                }}
            />
            <RootStack.Screen
                name="LanguageModal"
                component={LanguageModal}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'transparentModal',
                }}
            />
        </RootStack.Navigator>
    );
};

// Default RootNavigator with Container (for backward compatibility if needed)
const RootNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <FarmerNavigator />
        </NavigationContainer>
    );
};

export default RootNavigator;
