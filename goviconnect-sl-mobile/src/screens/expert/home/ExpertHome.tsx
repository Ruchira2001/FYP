import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, ActionCard, WeatherCard } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { useExpert } from '../../../context/ExpertContext';
import { getRelativeTime } from '../../../utils/validators';
import { expertDashboardAPI } from '../../../services/api';

const { width } = Dimensions.get('window');

const ExpertHome: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { expert } = useExpert();

    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await expertDashboardAPI.getDashboard();
            const data = res.data.data || res.data;
            setStats(data.stats || data.dashboardStats || {});
            setRecentActivity(data.recentActivity || []);
        } catch (e) {
            console.error('Failed to load expert dashboard:', e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
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
            id: 'consultations',
            label: 'Today\'s Consults',
            value: String(stats.todayConsultations ?? 0),
            icon: 'chatbubbles' as const,
            color: COLORS.primary[500],
            bgColor: COLORS.primary[50],
        },
        {
            id: 'reviews',
            label: 'Pending Reviews',
            value: String(stats.pendingReviews ?? 0),
            icon: 'eye' as const,
            color: COLORS.warning,
            bgColor: '#fef3c7',
        },
        {
            id: 'meetings',
            label: 'Upcoming Meetings',
            value: String(stats.upcomingMeetings ?? 0),
            icon: 'calendar' as const,
            color: COLORS.info,
            bgColor: '#dbeafe',
        },
        {
            id: 'messages',
            label: 'Unread Messages',
            value: String(stats.unreadMessages ?? 0),
            icon: 'mail' as const,
            color: COLORS.secondary[500],
            bgColor: COLORS.secondary[50],
        },
    ];

    const quickActions = [
        {
            id: 'reviews',
            title: 'Diagnosis Reviews',
            icon: 'medical' as const,
            iconColor: COLORS.error,
            iconBgColor: '#fee2e2',
            onPress: () => navigation.navigate('ExpertDiagnosisReviews'),
        },
        {
            id: 'meetings',
            title: 'Meetings',
            icon: 'calendar' as const,
            iconColor: COLORS.info,
            iconBgColor: '#dbeafe',
            onPress: () => navigation.navigate('ExpertMeetingsTab'),
        },
        {
            id: 'learnhub',
            title: 'LearnHub',
            icon: 'library' as const,
            iconColor: COLORS.secondary[600],
            iconBgColor: COLORS.secondary[50],
            onPress: () => navigation.navigate('ExpertLearnHubTab'),
        },
        {
            id: 'chats',
            title: 'Chats',
            icon: 'chatbubbles' as const,
            iconColor: COLORS.primary[600],
            iconBgColor: COLORS.primary[50],
            onPress: () => navigation.navigate('ExpertChatsList'),
        },
    ];

    const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'diagnosis_verified': return 'checkmark-circle';
            case 'diagnosis_corrected': return 'pencil';
            case 'meeting_completed': return 'videocam';
            case 'chat_response': return 'chatbubble';
            case 'guide_contributed': return 'book';
            default: return 'ellipse';
        }
    };

    const getActivityColor = (type: string): string => {
        switch (type) {
            case 'diagnosis_verified': return COLORS.success;
            case 'diagnosis_corrected': return COLORS.warning;
            case 'meeting_completed': return COLORS.info;
            case 'chat_response': return COLORS.primary[500];
            case 'guide_contributed': return COLORS.secondary[500];
            default: return COLORS.neutral[400];
        }
    };

    return (
        <View style={styles.container}>
            <Header
                showCursiveTitle
                showLanguage
                showNotifications
                showChats
                onLanguagePress={() => navigation.navigate('LanguageModal')}
                onNotificationsPress={() => navigation.navigate('ExpertNotifications')}
                onChatsPress={() => navigation.navigate('ExpertChatsList')}
                notificationCount={stats.pendingReviews ?? 0}
                chatUnreadCount={stats.unreadMessages}
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
                            {expert?.name?.split(' ').slice(0, 2).join(' ') || 'Expert'}
                        </Text>
                        !
                    </Text>
                    <View style={styles.expertBadge}>
                        <Ionicons name="shield-checkmark" size={14} color={COLORS.primary[600]} />
                        <Text style={styles.expertBadgeText}>Expert</Text>
                    </View>
                </View>

                {/* Weather Card */}
                <View style={styles.weatherSection}>
                    <WeatherCard role="expert" fallbackLocation={expert?.district} />
                </View>

                {/* Stats Overview */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        {statCards.map((stat) => (
                            <TouchableOpacity key={stat.id} style={styles.statCard} activeOpacity={0.7}>
                                <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Pending Farmer Requests Banner */}
                {stats.pendingReviews > 0 && (
                    <TouchableOpacity
                        style={styles.pendingBanner}
                        onPress={() => navigation.navigate('ExpertDiagnosisReviews')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.pendingBannerIcon}>
                            <Ionicons name="alert-circle" size={24} color="#ffffff" />
                        </View>
                        <View style={styles.pendingBannerContent}>
                            <Text style={styles.pendingBannerTitle}>
                                {stats.pendingReviews} Diagnosis Reviews Pending
                            </Text>
                            <Text style={styles.pendingBannerSubtitle}>
                                Farmers are waiting for your expert review
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                    </TouchableOpacity>
                )}

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

                {/* Recent Activity */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllLink}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityContainer}>
                        {recentActivity.map((activity, index) => (
                            <View
                                key={activity.id}
                                style={[
                                    styles.activityItem,
                                    index < recentActivity.length - 1 && styles.activityItemBorder,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.activityIconContainer,
                                        { backgroundColor: getActivityColor(activity.type) + '20' },
                                    ]}
                                >
                                    <Ionicons
                                        name={getActivityIcon(activity.type)}
                                        size={18}
                                        color={getActivityColor(activity.type)}
                                    />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle} numberOfLines={1}>
                                        {activity.title}
                                    </Text>
                                    {activity.farmerName && (
                                        <Text style={styles.activityFarmer}>
                                            <Ionicons name="person-outline" size={12} color={COLORS.neutral[400]} />
                                            {' '}{activity.farmerName}
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.activityTime}>
                                    {getRelativeTime(activity.timestamp, i18n.language)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Performance Card */}
                <View style={styles.sectionContainer}>
                    <View style={styles.performanceCard}>
                        <View style={styles.performanceHeader}>
                            <View>
                                <Text style={styles.performanceTitle}>Your Performance</Text>
                                <Text style={styles.performanceSubtitle}>This Month</Text>
                            </View>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={20} color="#f59e0b" />
                                <Text style={styles.ratingText}>{expert?.rating || 4.8}</Text>
                            </View>
                        </View>

                        <View style={styles.performanceStats}>
                            <View style={styles.perfStatItem}>
                                <Text style={styles.perfStatValue}>{expert?.totalConsultations || 245}</Text>
                                <Text style={styles.perfStatLabel}>Total Consults</Text>
                            </View>
                            <View style={styles.perfStatDivider} />
                            <View style={styles.perfStatItem}>
                                <Text style={styles.perfStatValue}>{expert?.farmersHelped || 189}</Text>
                                <Text style={styles.perfStatLabel}>Farmers Helped</Text>
                            </View>
                            <View style={styles.perfStatDivider} />
                            <View style={styles.perfStatItem}>
                                <Text style={styles.perfStatValue}>{expert?.yearsExperience || 20}+</Text>
                                <Text style={styles.perfStatLabel}>Years Exp.</Text>
                            </View>
                        </View>
                    </View>
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
    weatherSection: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    greetingContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    greetingText: {
        fontSize: 18,
        color: COLORS.neutral[500],
        flex: 1,
    },
    greetingName: {
        color: COLORS.neutral[800],
        fontWeight: '600',
    },
    expertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    expertBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary[600],
        marginLeft: 4,
    },
    statsSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
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
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginTop: 2,
    },
    pendingBanner: {
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 8,
        backgroundColor: COLORS.warning,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOW.md,
        shadowColor: COLORS.warning,
    },
    pendingBannerIcon: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    pendingBannerContent: {
        flex: 1,
    },
    pendingBannerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    pendingBannerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
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
        color: COLORS.primary[600],
        fontSize: 14,
        fontWeight: '500',
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
    activityContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
        ...SHADOW.sm,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    activityItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    activityIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[800],
    },
    activityFarmer: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    activityTime: {
        fontSize: 11,
        color: COLORS.neutral[400],
    },
    performanceCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.md,
    },
    performanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    performanceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    performanceSubtitle: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#92400e',
        marginLeft: 4,
    },
    performanceStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    perfStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    perfStatValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary[600],
    },
    perfStatLabel: {
        fontSize: 11,
        color: COLORS.neutral[500],
        marginTop: 4,
    },
    perfStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.neutral[200],
    },
});

export default ExpertHome;
