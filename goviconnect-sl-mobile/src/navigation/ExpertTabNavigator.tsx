import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

// Screens
import ExpertHome from '../../screens/expert/home/ExpertHome';
import ExpertChatsList from '../../screens/expert/chats/ExpertChatsList';
import DiagnosisReviews from '../../screens/expert/diagnosis/DiagnosisReviews';
import ExpertMeetings from '../../screens/expert/meetings/ExpertMeetings';
import ExpertProfile from '../../screens/expert/profile/ExpertProfile';

// Stack navigators for each tab
const HomeStack = createNativeStackNavigator();
const ChatsStack = createNativeStackNavigator();
const DiagnosisStack = createNativeStackNavigator();
const MeetingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const HomeStackNavigator = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="ExpertHomeScreen" component={ExpertHome} />
    </HomeStack.Navigator>
);

const ChatsStackNavigator = () => (
    <ChatsStack.Navigator screenOptions={{ headerShown: false }}>
        <ChatsStack.Screen name="ExpertChatsListScreen" component={ExpertChatsList} />
    </ChatsStack.Navigator>
);

const DiagnosisStackNavigator = () => (
    <DiagnosisStack.Navigator screenOptions={{ headerShown: false }}>
        <DiagnosisStack.Screen name="DiagnosisReviewsScreen" component={DiagnosisReviews} />
    </DiagnosisStack.Navigator>
);

const MeetingsStackNavigator = () => (
    <MeetingsStack.Navigator screenOptions={{ headerShown: false }}>
        <MeetingsStack.Screen name="ExpertMeetingsScreen" component={ExpertMeetings} />
    </MeetingsStack.Navigator>
);

const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="ExpertProfileScreen" component={ExpertProfile} />
    </ProfileStack.Navigator>
);

// Badge component for tab icons
const TabBadge: React.FC<{ count: number }> = ({ count }) => {
    if (count <= 0) return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
};

const ExpertTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary[600],
                tabBarInactiveTintColor: COLORS.neutral[400],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    switch (route.name) {
                        case 'ExpertHomeTab':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'ExpertChatsTab':
                            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                            break;
                        case 'ExpertDiagnosisTab':
                            iconName = focused ? 'medical' : 'medical-outline';
                            break;
                        case 'ExpertMeetingsTab':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        case 'ExpertProfileTab':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                    }

                    return (
                        <View style={styles.tabIconContainer}>
                            {focused && <View style={styles.activeIndicator} />}
                            <Ionicons name={iconName} size={22} color={color} />
                            {route.name === 'ExpertChatsTab' && <TabBadge count={5} />}
                            {route.name === 'ExpertDiagnosisTab' && <TabBadge count={2} />}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name="ExpertHomeTab"
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="ExpertChatsTab"
                component={ChatsStackNavigator}
                options={{ tabBarLabel: 'Chats' }}
            />
            <Tab.Screen
                name="ExpertDiagnosisTab"
                component={DiagnosisStackNavigator}
                options={{ tabBarLabel: 'Diagnosis' }}
            />
            <Tab.Screen
                name="ExpertMeetingsTab"
                component={MeetingsStackNavigator}
                options={{ tabBarLabel: 'Meetings' }}
            />
            <Tab.Screen
                name="ExpertProfileTab"
                component={ProfileStackNavigator}
                options={{ tabBarLabel: 'Profile' }}
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

export default ExpertTabNavigator;
