import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../components';
import { COLORS, NOTIFICATION_TYPES } from '../../utils/constants';
import { getNotifications, markNotificationRead, Notification } from '../../services/storage';
import { getRelativeTime } from '../../utils/validators';

const Notifications: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        // Mock notifications for demo
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'meeting',
                title: 'Meeting Reminder',
                titleSi: 'රැස්වීම් මතක් කිරීම',
                body: 'Your meeting with Dr. Kamal Perera is in 30 minutes',
                bodySi: 'ආචාර්ය කමල් පෙරේරා සමඟ ඔබේ රැස්වීම මිනිත්තු 30කින්',
                read: false,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                type: 'tip',
                title: "Today's Farming Tip",
                titleSi: 'අද ගොවිතැන් ඉඟිය',
                body: 'Water your crops early morning for best results',
                bodySi: 'හොඳම ප්‍රතිඵල සඳහා ඔබේ බෝගවලට උදේ ජලය දෙන්න',
                read: true,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: '3',
                type: 'chat',
                title: 'New Message',
                titleSi: 'නව පණිවිඩය',
                body: 'Prof. Nimal Silva sent you a message',
                bodySi: 'මහාචාර්ය නිමල් සිල්වා ඔබට පණිවිඩයක් එවා ඇත',
                read: false,
                createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
            {
                id: '4',
                type: 'guide',
                title: 'New Guide Available',
                titleSi: 'නව මාර්ගෝපදේශය ලබා ගත හැක',
                body: 'Check out our new guide on organic pest control',
                bodySi: 'කාබනික පළිබෝධ පාලනය පිළිබඳ අපගේ නව මාර්ගෝපදේශය බලන්න',
                read: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
        ];

        setNotifications(mockNotifications);
    };

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.read) {
            await markNotificationRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
        }

        // Navigate based on type
        switch (notification.type) {
            case 'meeting':
                navigation.navigate('MeetingsTab', { screen: 'MyMeetings' });
                break;
            case 'chat':
                navigation.navigate('ChatsList');
                break;
            case 'guide':
                navigation.navigate('LearnHubTab');
                break;
            default:
                break;
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const renderNotification = ({ item }: { item: Notification }) => {
        const typeConfig = NOTIFICATION_TYPES[item.type] || NOTIFICATION_TYPES.system;

        return (
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                className={`flex-row items-start p-4 mb-2 rounded-xl border ${item.read ? 'bg-white border-neutral-100' : 'bg-primary-50 border-primary-100'
                    }`}
            >
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: typeConfig.color + '20' }}
                >
                    <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className={`text-base ${item.read ? 'font-medium' : 'font-bold'} text-neutral-800`}>
                            {i18n.language === 'si' ? item.titleSi : item.title}
                        </Text>
                        {!item.read && (
                            <View className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                    </View>
                    <Text className="text-sm text-neutral-600 mb-1">
                        {i18n.language === 'si' ? item.bodySi : item.body}
                    </Text>
                    <Text className="text-xs text-neutral-400">
                        {getRelativeTime(item.createdAt, i18n.language)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('notifications.title')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Filters */}
            <View className="flex-row px-4 py-3">
                <Chip
                    label={t('notifications.all')}
                    selected={filter === 'all'}
                    onPress={() => setFilter('all')}
                    variant="outline"
                    size="sm"
                />
                <Chip
                    label={t('notifications.unread')}
                    selected={filter === 'unread'}
                    onPress={() => setFilter('unread')}
                    variant="outline"
                    size="sm"
                />
            </View>

            {filteredNotifications.length > 0 ? (
                <FlatList
                    data={filteredNotifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingTop: 0 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="notifications-outline"
                    title={t('notifications.no_notifications')}
                    description="You're all caught up!"
                />
            )}
        </View>
    );
};

export default Notifications;
