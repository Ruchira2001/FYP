import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShop } from '../../../context/ShopContext';
import { COLORS, SHADOW } from '../../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Header, AppNotify, ActionCard } from '../../../components';
import { shopAPI } from '../../../services/api';
import { connectSocket, getSocket } from '../../../services/socketService';

const ShopProfile: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { logout, shop } = useShop();
    const [profileStats, setProfileStats] = useState({ products: 0, orders: 0, rating: 0 });

    useEffect(() => {
        loadStats();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadStats();
        }, [])
    );

    useEffect(() => {
        let mounted = true;
        let socket = getSocket();

        const refreshStats = () => {
            if (mounted) loadStats();
        };

        const subscribe = async () => {
            socket = socket || await connectSocket();
            socket?.on('dashboard_updated', refreshStats);
        };

        subscribe();

        return () => {
            mounted = false;
            socket?.off('dashboard_updated', refreshStats);
        };
    }, []);

    const loadStats = async () => {
        try {
            const res = await shopAPI.getDashboard();
            const data = res.data.data || res.data;
            const products = data.products || {};
            const orders = data.orders || {};
            setProfileStats({
                products: data.totalProducts ?? products.total ?? data.stats?.totalProducts ?? 0,
                orders: data.totalOrders ?? orders.total ?? data.stats?.totalOrders ?? 0,
                rating: data.rating || data.stats?.rating || 0,
            });
        } catch (e) {
            console.error('Failed to load profile stats:', e);
        }
    };

    // Quick shortcuts
    const shortcuts = [
        { id: 'products', label: 'Products', icon: 'leaf' as const, iconColor: COLORS.primary[600], iconBgColor: COLORS.primary[50], onPress: () => navigation.navigate('ProductsTab') },
        { id: 'learnhub', label: 'LearnHub', icon: 'book' as const, iconColor: COLORS.secondary[600], iconBgColor: COLORS.secondary[50], onPress: () => navigation.navigate('ShopLearnHubTab') },
    ];

    // Bottom menu items (matching farmer/expert side)
    const bottomMenuItems = [
        { id: 'settings', icon: 'settings-outline', label: 'Settings', onPress: () => navigation.navigate('Settings') },
        { id: 'help', icon: 'help-circle-outline', label: 'Help & FAQ', onPress: () => navigation.navigate('HelpFAQ') },
        {
            id: 'logout', icon: 'log-out-outline', label: 'Logout', color: COLORS.error, onPress: () => {
                AppNotify.confirm('Logout', 'Are you sure you want to logout?', logout, { confirmLabel: 'Logout', destructive: true });
            }
        },
    ];

    return (
        <View style={styles.container}>
            <Header title="Profile" showBack onBackPress={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>🏪</Text>
                        </View>
                    </View>
                    <Text style={styles.shopName}>{shop?.name || 'My Shop'}</Text>
                    <Text style={styles.shopType}>{shop?.type || 'Business'} Account</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.neutral[500]} />
                        <Text style={styles.locationText}>{shop?.location || 'Location not set'}</Text>
                    </View>

                    {/* Edit Button */}
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ShopEditProfile')}>
                        <Ionicons name="create-outline" size={16} color={COLORS.primary[600]} />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profileStats.products}</Text>
                            <Text style={styles.statLabel}>Products</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profileStats.orders}</Text>
                            <Text style={styles.statLabel}>Orders</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profileStats.rating || '-'}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Access Shortcuts */}
                <View style={styles.shortcutsSection}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <View style={styles.shortcutsGrid}>
                        {shortcuts.map((shortcut) => (
                            <View key={shortcut.id} style={styles.shortcutCardWrapper}>
                                <ActionCard
                                    title={shortcut.label}
                                    icon={shortcut.icon}
                                    iconColor={shortcut.iconColor}
                                    iconBgColor={shortcut.iconBgColor}
                                    onPress={shortcut.onPress}
                                    size="sm"
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom Menu (Settings, Help & FAQ, Logout) */}
                <View style={styles.bottomMenuSection}>
                    <View style={styles.bottomMenuContainer}>
                        {bottomMenuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.bottomMenuItem,
                                    index < bottomMenuItems.length - 1 && styles.bottomMenuItemBorder
                                ]}
                                onPress={item.onPress}
                                activeOpacity={0.6}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={22}
                                    color={item.color || COLORS.neutral[600]}
                                />
                                <Text style={[
                                    styles.bottomMenuLabel,
                                    item.color ? { color: item.color } : {}
                                ]}>
                                    {item.label}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[300]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Version */}
                <Text style={styles.versionText}>GoviConnect SL v1.0.2 (Shop)</Text>

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    // ===== Profile Card =====
    profileCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    avatarWrapper: {
        marginBottom: 12,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.primary[100],
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 40,
    },
    shopName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    shopType: {
        fontSize: 14,
        color: COLORS.neutral[500],
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        fontSize: 14,
        color: COLORS.neutral[500],
        marginLeft: 4,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
        marginBottom: 20,
    },
    editButtonText: {
        color: COLORS.primary[600],
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 14,
    },
    // ===== Stats =====
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: COLORS.neutral[50],
        borderRadius: 14,
        paddingVertical: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.neutral[200],
    },
    // ===== Shortcuts =====
    shortcutsSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
    },
    shortcutsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    shortcutCardWrapper: {
        width: '48%',
        marginBottom: 12,
    },
    // ===== Bottom Menu =====
    bottomMenuSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    bottomMenuContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
    },
    bottomMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    bottomMenuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    bottomMenuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.neutral[700],
        marginLeft: 14,
    },
    // ===== Version =====
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.neutral[300],
        marginTop: 16,
    },
});

export default ShopProfile;
