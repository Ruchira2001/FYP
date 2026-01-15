import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, ActionCard, FeedCard } from '../../components';
import { COLORS } from '../../utils/constants';
import { useApp } from '../../context';
import { getMyCrops, getNotifications, getChats } from '../../services/storage';
import cropsData from '../../data/crops.json';
import tipsData from '../../data/tips.json';

const { width } = Dimensions.get('window');

const Home: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { user, settings } = useApp();

    const [refreshing, setRefreshing] = useState(false);
    const [myCrops, setMyCrops] = useState<string[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [crops, notifications, chats] = await Promise.all([
            getMyCrops(),
            getNotifications(),
            getChats(),
        ]);

        setMyCrops(crops);
        setNotificationCount(notifications.filter(n => !n.read).length);
        setChatUnreadCount(chats.reduce((sum, c) => sum + c.unreadCount, 0));
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

                {/* Feed */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                        {t('home.feed')}
                    </Text>

                    {tipsData.feedItems.map((item) => (
                        <FeedCard
                            key={item.id}
                            type={item.type as any}
                            title={i18n.language === 'si' ? item.titleSi : item.title}
                            content={i18n.language === 'si' ? item.contentSi : item.content}
                            timestamp={item.timestamp}
                            image={item.image || undefined}
                            progress={item.progress}
                            onPress={() => {
                                if (item.type === 'guide' && item.guideId) {
                                    navigation.navigate('LearnHubTab', {
                                        screen: 'CropDetails',
                                        params: { cropId: item.guideId }
                                    });
                                } else if (item.type === 'meeting' && item.meetingId) {
                                    navigation.navigate('MeetingsTab', {
                                        screen: 'MeetingDetails',
                                        params: { meetingId: item.meetingId }
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
});

export default Home;
