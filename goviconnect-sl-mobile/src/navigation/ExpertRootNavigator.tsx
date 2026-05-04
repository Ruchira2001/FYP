import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useExpert } from '../context/ExpertContext';

// Navigators
import ExpertTabNavigator from './ExpertTabNavigator';

// Screens
import ExpertChatDetail from '../screens/expert/chats/ExpertChatDetail';
import ExpertChatsList from '../screens/expert/chats/ExpertChatsList';
import FarmerDirectory from '../screens/expert/farmers/FarmerDirectory';
import FarmerRequests from '../screens/expert/requests/FarmerRequests';
import ExpertKnowledgeBase from '../screens/expert/knowledge/ExpertKnowledgeBase';
import DiagnosisReviews from '../screens/expert/diagnosis/DiagnosisReviews';
import Notifications from '../screens/notifications/Notifications';
import { LanguageModal } from '../screens/home';

// Auth Screens
import ExpertLogin from '../screens/expert/auth/ExpertLogin';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="ExpertLogin" component={ExpertLogin} />
    </AuthStack.Navigator>
);

const MainNavigator = () => (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Main Tab Navigator */}
        <RootStack.Screen name="ExpertTabs" component={ExpertTabNavigator} />

        {/* Global screens accessible from anywhere */}
        <RootStack.Screen name="ExpertChatDetail" component={ExpertChatDetail} />
        <RootStack.Screen name="ExpertChatsList" component={ExpertChatsList} />
        <RootStack.Screen name="ExpertFarmerDirectory" component={FarmerDirectory} />
        <RootStack.Screen name="ExpertFarmerRequests" component={FarmerRequests} />
        <RootStack.Screen name="ExpertKnowledgeBase" component={ExpertKnowledgeBase} />
        <RootStack.Screen name="ExpertDiagnosisReviews" component={DiagnosisReviews} />
        <RootStack.Screen name="ExpertNotifications" component={Notifications} />
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

const ExpertRootNavigator: React.FC = () => {
    const { isAuthenticated, isInitialized } = useExpert();

    if (!isInitialized) {
        return null;
    }

    return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

export default ExpertRootNavigator;
