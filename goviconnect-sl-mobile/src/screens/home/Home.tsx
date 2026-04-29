import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, ActionCard, FeedCard, WeatherCard } from '../../components';
import { COLORS } from '../../utils/constants';
import { useApp } from '../../context';
import { feedAPI, notificationAPI, chatAPI, learnhubAPI } from '../../services/api';
import cropsData from '../../data/crops.json';

const { width } = Dimensions.get('window');

const Home: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { user, settings } = useApp();

    const [refreshing, setRefreshing] = useState(false);
    const [myCrops, setMyCrops] = useState<string[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
    const [feedItems, setFeedItems] = useState<any[]>([]);
    const [guideCards, setGuideCards] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [feedRes, unreadRes, chatsRes, guidesRes] = await Promise.all([
                feedAPI.getFeed().catch(() => ({ data: { data: { tips: [], crops: [] } } })),
                notificationAPI.getUnreadCount().catch(() => ({ data: { count: 0 } })),
                chatAPI.getChats().catch(() => ({ data: { data: [] } })),
                learnhubAPI.getCommunityGuides({ limit: 6 }).catch(() => ({ data: { data: [] } })),
            ]);
            const feed = feedRes.data.data;
            const feedArray = Array.isArray(feed) ? feed : (feed?.tips || feed?.feedItems || []);
            setFeedItems(feedArray);
            setMyCrops(user?.crops || ['tea', 'paddy', 'tomato']);
            setNotificationCount(unreadRes.data?.count || unreadRes.data?.data?.count || 0);
            const chats = Array.isArray(chatsRes.data.data) ? chatsRes.data.data : [];
            setChatUnreadCount(chats.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0));
            const guides = Array.isArray(guidesRes.data.data) ? guidesRes.data.data : [];
            setGuideCards(guides);
        } catch (e) {
            console.error('Home loadData error:', e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getCropDisplay = (cropId: string) => {
        const crop = cropsData.crops.find(c => c.id === cropId);
        if (!crop) return { name: cropId, icon: '🌱' };
        return {
            name: i18n.language === 'si' ? crop.nameSi : crop.name,
            icon: crop.icon,
        };
    };

    const getGuideIcon = (name: string, cropId?: string): string => {
        const lowerName = (name || '').toLowerCase();
        const crop = (cropsData as any).crops.find((c: any) =>
            c.name.toLowerCase() === lowerName ||
            c.id === cropId ||
            c.id === lowerName
        );
        return crop?.icon || '🌿';
    };

    const quickActions = [
        {
            id: 'crop-doctor',
            title: t('home.crop_doctor'),
            icon: 'medical' as const,
            iconColor: COLORS.error,
            iconBgColor: '#fee2e2',
            onPress: () => navigation.navigate('AITab', { screen: 'CropDoctorUpload' }),
        },
        {
            id: 'price-prediction',
            title: t('home.price_prediction'),
            icon: 'trending-up' as const,
            iconColor: COLORS.info,
            iconBgColor: '#dbeafe',
            onPress: () => navigation.navigate('AITab', { screen: 'PriceForm' }),
        },
        {
            id: 'learnhub',
            title: t('tabs.learnhub'),
            icon: 'book' as const,
            iconColor: COLORS.success,
            iconBgColor: COLORS.primary[50],
            onPress: () => navigation.navigate('LearnHubTab'),
        },
        {
            id: 'meetings',
            title: t('home.expert_meetings'),
            icon: 'videocam' as const,
            iconColor: COLORS.secondary[600],
            iconBgColor: COLORS.secondary[50],
            onPress: () => navigation.navigate('MeetingsTab'),
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                showCursiveTitle
                showLanguage
                showNotifications
                showChats
                onLanguagePress={() => navigation.navigate('LanguageModal')}
                onNotificationsPress={() => navigation.navigate('Notifications')}
                onChatsPress={() => navigation.navigate('ChatsList')}
                notificationCount={notificationCount}
                chatUnreadCount={chatUnreadCount}
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
                        {t('home.greeting')},{' '}
                        <Text style={styles.greetingName}>
                            {user?.name?.split(' ')[0] || 'Farmer'}
                        </Text>
                        ! 👋
                    </Text>
                </View>

                {/* Weather Card */}
                <View style={styles.weatherSection}>
                    <WeatherCard role="farmer" fallbackLocation={user?.district} />
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                        {t('home.quick_actions')}
                    </Text>

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

                {/* My Crops */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {t('home.my_crops')}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab', { screen: 'EditCrops' })}>
                            <Text style={styles.editLink}>
                                {t('common.edit')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cropsScrollContent}
                    >
                        {myCrops.map((cropId) => {
                            const { name, icon } = getCropDisplay(cropId);
                            return (
                                <TouchableOpacity
                                    key={cropId}
                                    onPress={() => navigation.navigate('LearnHubTab', {
                                        screen: 'CropDetails',
                                        params: { cropId }
                                    })}
                                    style={styles.cropCard}
                                >
                                    <Text style={styles.cropIcon}>{icon}</Text>
                                    <Text style={styles.cropName}>{name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* LearnHub Guide Cards */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('tabs.learnhub')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('LearnHubTab')}>
                            <Text style={styles.editLink}>{t('common.see_all', 'See All')}</Text>
                        </TouchableOpacity>
                    </View>

                    {guideCards.length === 0 ? (
                        <TouchableOpacity
                            style={styles.guideEmptyCard}
                            onPress={() => navigation.navigate('LearnHubTab')}
                            activeOpacity={0.85}
                        >
                            <Text style={{ fontSize: 28 }}>📚</Text>
                            <Text style={styles.guideEmptyText}>Browse crop guides</Text>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.primary[500]} />
                        </TouchableOpacity>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.guidesScrollContent}
                        >
                            {guideCards.map((guide: any) => {
                                const gid = guide._id || guide.id;
                                const title = i18n.language === 'si'
                                    ? (guide.nameSi || guide.name || '')
                                    : (guide.name || '');
                                const desc = i18n.language === 'si'
                                    ? (guide.descriptionSi || guide.description || '')
                                    : (guide.description || '');
                                const icon = getGuideIcon(guide.name, guide.cropId);
                                return (
                                    <TouchableOpacity
                                        key={gid}
                                        style={styles.guideCard}
                                        activeOpacity={0.85}
                                        onPress={() => navigation.navigate('LearnHubTab', {
                                            screen: 'FarmerGuideDetails',
                                            params: { guide },
                                        })}
                                    >
                                        <View style={styles.guideCardIconBox}>
                                            <Text style={styles.guideCardIcon}>{icon}</Text>
                                        </View>
                                        <Text style={styles.guideCardTitle} numberOfLines={2}>{title || 'Guide'}</Text>
                                        <Text style={styles.guideCardDesc} numberOfLines={2}>{desc || 'Tap to read'}</Text>
                                        <View style={styles.guideCardFooter}>
                                            <Ionicons name="person-circle-outline" size={13} color={COLORS.neutral[400]} />
                                            <Text style={styles.guideCardAuthor} numberOfLines={1}>
                                                {guide.userId?.name || 'Farmer'}
                                            </Text>
                                            {guide.likeCount > 0 && (
                                                <View style={styles.guideCardLikes}>
                                                    <Ionicons name="heart" size={11} color="#ef4444" />
                                                    <Text style={styles.guideCardLikeText}>{guide.likeCount}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Feed */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                        {t('home.feed')}
                    </Text>

                    {feedItems.map((item: any) => (
                        <FeedCard
                            key={item.id || item._id}
                            type={item.type as any}
                            title={i18n.language === 'si' ? (item.titleSi || item.title) : item.title}
                            content={i18n.language === 'si' ? (item.contentSi || item.content) : item.content}
                            timestamp={item.timestamp || item.createdAt}
                            image={item.image || undefined}
                            progress={item.progress}
                            onPress={() => {
                                if (item.type === 'guide' && (item.guideId || item._id)) {
                                    navigation.navigate('LearnHubTab', {
                                        screen: 'CropDetails',
                                        params: { cropId: item.guideId || item._id }
                                    });
                                } else if (item.type === 'meeting' && (item.meetingId || item._id)) {
                                    navigation.navigate('MeetingsTab', {
                                        screen: 'MeetingDetails',
                                        params: { meetingId: item.meetingId || item._id }
                                    });
                                }
                            }}
                            liteMode={settings.liteMode}
                        />
                    ))}
                </View>

                {/* Bottom Padding */}
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
    sectionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    editLink: {
        color: COLORS.primary[600],
        fontSize: 14,
        fontWeight: '500',
    },
    cropsScrollContent: {
        paddingRight: 16,
    },
    cropCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    cropIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    cropName: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
    },

    weatherSection: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },

    /* LearnHub guide cards */
    guidesScrollContent: {
        paddingRight: 16,
    },
    guideCard: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginRight: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    guideCardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    guideCardIcon: { fontSize: 24 },
    guideCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginBottom: 4,
        lineHeight: 18,
    },
    guideCardDesc: {
        fontSize: 11,
        color: COLORS.neutral[500],
        lineHeight: 16,
        marginBottom: 10,
    },
    guideCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    guideCardAuthor: {
        flex: 1,
        fontSize: 11,
        color: COLORS.neutral[400],
    },
    guideCardLikes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    guideCardLikeText: {
        fontSize: 11,
        color: '#ef4444',
        fontWeight: '600',
    },
    guideEmptyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.primary[50],
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.primary[100],
    },
    guideEmptyText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.primary[700],
    },
});

export default Home;
