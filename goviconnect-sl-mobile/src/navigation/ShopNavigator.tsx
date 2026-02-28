import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { useShop } from '../context/ShopContext';
import { ShopLogin, ShopHome, ShopProfile } from '../screens/shop';
import ShopProducts from '../screens/shop/products/ShopProducts';
import ShopProductDetail from '../screens/shop/products/ShopProductDetail';
import ShopEditProfile from '../screens/shop/profile/ShopEditProfile';
import { Settings, HelpFAQ } from '../screens/profile';
import { LanguageModal } from '../screens/home';
import Notifications from '../screens/notifications/Notifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProductsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackNavigator = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="ShopHomeScreen" component={ShopHome} />
    </HomeStack.Navigator>
);

const ProductsStackNavigator = () => (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
        <ProductsStack.Screen name="ShopProductsScreen" component={ShopProducts} />
        <ProductsStack.Screen name="ShopProductDetail" component={ShopProductDetail} />
    </ProductsStack.Navigator>
);

const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="ShopProfileScreen" component={ShopProfile} />
        <ProfileStack.Screen name="ShopEditProfile" component={ShopEditProfile} />
        <ProfileStack.Screen name="Settings" component={Settings} />
        <ProfileStack.Screen name="HelpFAQ" component={HelpFAQ} />
    </ProfileStack.Navigator>
);

// Badge component
const TabBadge: React.FC<{ count: number }> = ({ count }) => {
    if (count <= 0) return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
};

const ShopTabs: React.FC = () => {
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
                        case 'ProductsTab':
                            iconName = focused ? 'leaf' : 'leaf-outline';
                            break;
                        case 'ProfileTab':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                    }

                    return (
                        <View style={styles.tabIconContainer}>
                            {focused && <View style={styles.activeIndicator} />}
                            <Ionicons name={iconName} size={22} color={color} />
                            {route.name === 'ProductsTab' && <TabBadge count={5} />}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="ProductsTab"
                component={ProductsStackNavigator}
                options={{ tabBarLabel: 'Products' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

const ShopNavigator: React.FC = () => {
    const { isAuthenticated, isInitialized } = useShop();

    if (!isInitialized) {
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="ShopLogin" component={ShopLogin} />
            ) : (
                <>
                    <Stack.Screen name="ShopTabs" component={ShopTabs} />
                    <Stack.Screen
                        name="LanguageModal"
                        component={LanguageModal}
                        options={{
                            animation: 'slide_from_bottom',
                            presentation: 'transparentModal',
                        }}
                    />
                    <Stack.Screen name="ShopNotifications" component={Notifications} />
                </>
            )}
        </Stack.Navigator>
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

export default ShopNavigator;
