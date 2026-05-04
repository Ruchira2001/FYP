import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, ActionCard } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { useShop } from '../../../context/ShopContext';
import { notificationAPI, shopAPI } from '../../../services/api';
import { connectSocket, getSocket } from '../../../services/socketService';

const { width } = Dimensions.get('window');

const ShopHome: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { shop } = useShop();

    const [refreshing, setRefreshing] = useState(false);
    const [dashStats, setDashStats] = useState({ totalProducts: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
    const [popularProducts, setPopularProducts] = useState<any[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        loadDashboard();
        loadNotificationCount();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadNotificationCount();
        }, [])
    );

    useEffect(() => {
        let mounted = true;
        let socket = getSocket();

        const refreshNotificationCount = () => {
            if (mounted) {
                loadNotificationCount();
            }
        };

        const subscribe = async () => {
            socket = socket || await connectSocket();
            socket?.on('notification', refreshNotificationCount);
        };

        subscribe();

        return () => {
            mounted = false;
            socket?.off('notification', refreshNotificationCount);
        };
    }, []);

    const loadNotificationCount = async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setNotificationCount(res.data?.count || res.data?.data?.count || 0);
        } catch {
            setNotificationCount(0);
        }
    };

    const loadDashboard = async () => {
        try {
            const res = await shopAPI.getDashboard();
            const data = res.data.data || res.data;
            setDashStats({
                totalProducts: data.totalProducts || data.stats?.totalProducts || 0,
                inStock: data.inStock || data.stats?.inStock || 0,
                lowStock: data.lowStock || data.stats?.lowStock || 0,
                outOfStock: data.outOfStock || data.stats?.outOfStock || 0,
            });
            setPopularProducts(data.popularProducts || []);
        } catch (e) {
            console.error('Failed to load shop dashboard:', e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadDashboard(), loadNotificationCount()]);
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const statCards = [
        {
            id: 'products',
            label: 'Total Products',
            value: String(dashStats.totalProducts),
            icon: 'leaf' as const,
            color: COLORS.primary[500],
            bgColor: COLORS.primary[50],
        },
        {
            id: 'available',
            label: 'In Stock',
            value: String(dashStats.inStock),
            icon: 'checkmark-circle' as const,
            color: COLORS.success,
            bgColor: '#dcfce7',
        },
        {
            id: 'low-stock',
            label: 'Low Stock',
            value: String(dashStats.lowStock),
            icon: 'warning' as const,
            color: COLORS.warning,
            bgColor: '#fef3c7',
        },
        {
            id: 'out-of-stock',
            label: 'Out of Stock',
            value: String(dashStats.outOfStock),
            icon: 'close-circle' as const,
            color: COLORS.error,
            bgColor: '#fee2e2',
        },
    ];

    const quickActions = [
        {
            id: 'products',
            title: 'My Products',
            icon: 'leaf' as const,
            iconColor: COLORS.primary[600],
            iconBgColor: COLORS.primary[50],
            onPress: () => navigation.navigate('ProductsTab'),
        },
        {
            id: 'learnhub',
            title: 'LearnHub',
            icon: 'book' as const,
            iconColor: COLORS.secondary[600],
            iconBgColor: COLORS.secondary[50],
            onPress: () => navigation.navigate('ShopLearnHubTab'),
        },
    ];

    // Popular products from dashboard API
    const displayProducts = popularProducts.length > 0 ? popularProducts.map((p: any) => ({
        id: p._id || p.id,
        name: p.name || '',
        category: p.category || '',
        emoji: p.emoji || '🧪',
        stock: p.stock || 0,
        color: (p.stock || 0) < 10 ? COLORS.error : COLORS.success,
    })) : [];

    return (
        <View style={styles.container}>
            {/* Header - matching farmer/expert side */}
            <Header
                showCursiveTitle
                showLanguage
                showNotifications
                onLanguagePress={() => navigation.navigate('LanguageModal')}
                onNotificationsPress={() => navigation.navigate('ShopNotifications')}
                notificationCount={notificationCount}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary[500]]}
                        tintColor={COLORS.primary[500]}
                    />
                }
            >
                {/* Greeting */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>
                        {getGreeting()},{' '}
                        <Text style={styles.greetingName}>
                            {shop?.name || 'Shop Owner'}
                        </Text>
                        ! 🏪
                    </Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        {statCards.map((stat) => (
                            <View key={stat.id} style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action) => (
                            <View key={action.id} style={styles.actionCardWrapper}>
                                <ActionCard
                                    title={action.title}
                                    icon={action.icon}
                                    iconColor={action.iconColor}
                                    iconBgColor={action.iconBgColor}
                                    onPress={action.onPress}
                                    size="sm"
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Popular Products */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Products</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProductsTab')}>
                            <Text style={styles.seeAllLink}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {displayProducts.map((product) => (
                        <TouchableOpacity
                            key={product.id}
                            style={styles.productCard}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ProductsTab', {
                                screen: 'ShopProductDetail',
                                params: { productId: product.id }
                            })}
                        >
                            <View style={[styles.productIcon, { backgroundColor: product.color + '15' }]}>
                                <Text style={styles.productEmoji}>{product.emoji}</Text>
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productCategory}>{product.category}</Text>
                            </View>
                            <View style={styles.productStock}>
                                <Text style={[
                                    styles.stockText,
                                    { color: product.stock < 10 ? COLORS.error : COLORS.success }
                                ]}>
                                    {product.stock} units
                                </Text>
                                <Text style={styles.stockLabel}>in stock</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    scrollView: {
        flex: 1,
    },
    greetingContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    greetingText: {
        fontSize: 18,
        color: COLORS.neutral[500],
    },
    greetingName: {
        color: COLORS.neutral[800],
        fontWeight: '600',
    },
    // ===== Stats =====
    statsSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginTop: 2,
    },
    // ===== Quick Actions =====
    sectionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllLink: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.primary[600],
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCardWrapper: {
        width: '48%',
        marginBottom: 12,
    },
    // ===== Popular Products =====
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    productIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    productEmoji: {
        fontSize: 24,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    productCategory: {
        fontSize: 13,
        color: COLORS.neutral[500],
        marginTop: 2,
    },
    productStock: {
        alignItems: 'flex-end',
        marginRight: 8,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
    },
    stockLabel: {
        fontSize: 11,
        color: COLORS.neutral[400],
    },
});

export default ShopHome;
