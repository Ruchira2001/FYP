import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../utils/constants';

// Import screens
import { Home } from '../screens/home';
import { LearnHub, CropDetails, SavedLibrary, OfflineDownloads, AddCropGuide } from '../screens/learnhub';
import { AIHome, CropDoctorUpload, CropDoctorResult, DiagnosisHistory, PriceForm, PriceResult, PredictionHistory } from '../screens/ai';
import { Meetings, MeetingDetails, MyMeetings } from '../screens/meetings';
import { Profile, Settings, HelpFAQ, EditProfile } from '../screens/profile';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LearnHubStack = createNativeStackNavigator();
const AIStack = createNativeStackNavigator();
const MeetingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="HomeScreen" component={Home} />
    </HomeStack.Navigator>
);

// LearnHub Stack Navigator
const LearnHubStackNavigator = () => (
    <LearnHubStack.Navigator screenOptions={{ headerShown: false }}>
        <LearnHubStack.Screen name="LearnHubScreen" component={LearnHub} />
        <LearnHubStack.Screen name="CropDetails" component={CropDetails} />
        <LearnHubStack.Screen name="SavedLibrary" component={SavedLibrary} />
        <LearnHubStack.Screen name="OfflineDownloads" component={OfflineDownloads} />
    </LearnHubStack.Navigator>
);

// AI Stack Navigator
const AIStackNavigator = () => (
    <AIStack.Navigator screenOptions={{ headerShown: false }}>
        <AIStack.Screen name="AIHomeScreen" component={AIHome} />
        <AIStack.Screen name="CropDoctorUpload" component={CropDoctorUpload} />
        <AIStack.Screen name="CropDoctorResult" component={CropDoctorResult} />
        <AIStack.Screen name="DiagnosisHistory" component={DiagnosisHistory} />
        <AIStack.Screen name="PriceForm" component={PriceForm} />
        <AIStack.Screen name="PriceResult" component={PriceResult} />
        <AIStack.Screen name="PredictionHistory" component={PredictionHistory} />
    </AIStack.Navigator>
);

// Meetings Stack Navigator
const MeetingsStackNavigator = () => (
    <MeetingsStack.Navigator screenOptions={{ headerShown: false }}>
        <MeetingsStack.Screen name="MeetingsScreen" component={Meetings} />
        <MeetingsStack.Screen name="MeetingDetails" component={MeetingDetails} />
        <MeetingsStack.Screen name="MyMeetings" component={MyMeetings} />
    </MeetingsStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="ProfileScreen" component={Profile} />
        <ProfileStack.Screen name="Settings" component={Settings} />
        <ProfileStack.Screen name="HelpFAQ" component={HelpFAQ} />
        <ProfileStack.Screen name="EditProfile" component={EditProfile} />
        <ProfileStack.Screen name="AddCropGuide" component={AddCropGuide} />
    </ProfileStack.Navigator>
);

// Tab Bar Icon Component
interface TabIconProps {
    route: string;
    focused: boolean;
    color: string;
    size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ route, focused, color, size }) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (route) {
        case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
        case 'LearnHubTab':
            iconName = focused ? 'book' : 'book-outline';
            break;
        case 'AITab':
            iconName = focused ? 'sparkles' : 'sparkles-outline';
            break;
        case 'MeetingsTab':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
        case 'ProfileTab':
            iconName = focused ? 'person' : 'person-outline';
            break;
        default:
            iconName = 'ellipse';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
};

// Main Tab Navigator
const TabNavigator: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => (
                    <TabIcon route={route.name} focused={focused} color={color} size={size} />
                ),
                tabBarActiveTintColor: COLORS.primary[600],
                tabBarInactiveTintColor: COLORS.neutral[400],
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: COLORS.neutral[100],
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 2,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ tabBarLabel: t('tabs.home') }}
            />
            <Tab.Screen
                name="LearnHubTab"
                component={LearnHubStackNavigator}
                options={{ tabBarLabel: t('tabs.learnhub') }}
            />
            <Tab.Screen
                name="AITab"
                component={AIStackNavigator}
                options={{ tabBarLabel: t('tabs.ai') }}
            />
            <Tab.Screen
                name="MeetingsTab"
                component={MeetingsStackNavigator}
                options={{ tabBarLabel: t('tabs.meetings') }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{ tabBarLabel: t('tabs.profile') }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
