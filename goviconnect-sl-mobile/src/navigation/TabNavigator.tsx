import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
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

// Badge component for tab icons (matching expert side)
const TabBadge: React.FC<{ count: number }> = ({ count }) => {
    if (count <= 0) return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
};

// Main Tab Navigator
const TabNavigator: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary[600],
                tabBarInactiveTintColor: COLORS.neutral[400],
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    switch (route.name) {
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

                    return (
                        <View style={styles.tabIconContainer}>
                            {focused && <View style={styles.activeIndicator} />}
                            <Ionicons name={iconName} size={22} color={color} />
                            {route.name === 'AITab' && <TabBadge count={3} />}
                            {route.name === 'MeetingsTab' && <TabBadge count={1} />}
                        </View>
                    );
                },
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

const styles = StyleSheet.create({
    tabBar: {
        height: 60,
        paddingBottom: 6,
        paddingTop: 6,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    tabIconContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        top: -10,
        width: 20,
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.primary[600],
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -10,
        backgroundColor: COLORS.error,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
    },
});

export default TabNavigator;

