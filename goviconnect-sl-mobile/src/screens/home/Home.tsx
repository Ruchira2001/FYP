import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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
        <View className="flex-1 bg-neutral-50">
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
                className="flex-1"
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
                <View className="px-4 pt-4 pb-2">
                    <Text className="text-lg text-neutral-500">
                        {t('home.greeting')},{' '}
                        <Text className="text-neutral-800 font-semibold">
                            {user?.name?.split(' ')[0] || 'Farmer'}
                        </Text>
                        ! 👋
                    </Text>
                </View>

                {/* Quick Actions */}
                <View className="px-4 py-4">
                    <Text className="text-lg font-semibold text-neutral-800 mb-3">
                        {t('home.quick_actions')}
                    </Text>

                    <View className="flex-row flex-wrap justify-between">
                        {quickActions.map((action) => (
                            <View key={action.id} className="w-[48%] mb-3">
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
                <View className="px-4 py-2">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-semibold text-neutral-800">
                            {t('home.my_crops')}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab', { screen: 'EditCrops' })}>
                            <Text className="text-primary-600 text-sm font-medium">
                                {t('common.edit')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 16 }}
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
                                    className="bg-white rounded-2xl px-4 py-3 mr-3 flex-row items-center border border-neutral-100"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 4,
                                        elevation: 1,
                                    }}
                                >
                                    <Text className="text-xl mr-2">{icon}</Text>
                                    <Text className="text-sm font-medium text-neutral-700">{name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Feed */}
                <View className="px-4 py-4">
                    <Text className="text-lg font-semibold text-neutral-800 mb-3">
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
                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default Home;
