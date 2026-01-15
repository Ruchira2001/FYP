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
import { ChatsList, ChatDetail, BookMeetingFromChat } from '../screens/chats';
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

// Root Navigator
const RootNavigator: React.FC = () => {
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
        <NavigationContainer>
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
        </NavigationContainer>
    );
};

export default RootNavigator;
