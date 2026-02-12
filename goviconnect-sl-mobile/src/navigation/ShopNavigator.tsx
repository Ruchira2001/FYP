import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useShop } from '../context/ShopContext';
import { ShopLogin, ShopHome, ShopOrders, ShopProfile } from '../screens/shop';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ShopTabs: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.info, // Blue for Shop Owner
                tabBarInactiveTintColor: COLORS.neutral[400],
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 4,
                },
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 4,
                    paddingTop: 8,
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: COLORS.neutral[100],
                    elevation: 8,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'storefront' : 'storefront-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={ShopHome}
                options={{ tabBarLabel: 'Shop' }}
            />
            <Tab.Screen
                name="Orders"
                component={ShopOrders}
                options={{ tabBarLabel: 'Orders' }}
            />
            <Tab.Screen
                name="Profile"
                component={ShopProfile}
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
                <Stack.Screen name="ShopTabs" component={ShopTabs} />
            )}
        </Stack.Navigator>
    );
};

export default ShopNavigator;
