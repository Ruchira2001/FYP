import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../components';
import { COLORS, NOTIFICATION_TYPES } from '../../utils/constants';
import { markNotificationRead, Notification } from '../../services/storage';
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
                style={[
                    styles.notificationCard,
                    item.read ? styles.cardRead : styles.cardUnread
                ]}
            >
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: typeConfig.color + '20' }
                    ]}
                >
                    <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[
                            styles.title,
                            item.read ? styles.titleRead : styles.titleUnread
                        ]}>
                            {i18n.language === 'si' ? item.titleSi : item.title}
                        </Text>
                        {!item.read && (
                            <View style={styles.unreadDot} />
                        )}
                    </View>
                    <Text style={styles.bodyText} numberOfLines={2}>
                        {i18n.language === 'si' ? item.bodySi : item.body}
                    </Text>
                    <Text style={styles.timeText}>
                        {getRelativeTime(item.createdAt, i18n.language)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('notifications.title')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Filters */}
            <View style={styles.filterContainer}>
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
                    contentContainerStyle={styles.listContent}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50], // neutral-50
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        // Add gap between items via direct margin in components or container logic
        gap: 8,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    cardRead: {
        backgroundColor: '#ffffff',
        borderColor: COLORS.neutral[100],
    },
    cardUnread: {
        backgroundColor: COLORS.primary[50],
        borderColor: COLORS.primary[100],
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        color: COLORS.neutral[800],
        flex: 1,
        marginRight: 8,
    },
    titleRead: {
        fontWeight: '500',
    },
    titleUnread: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        backgroundColor: COLORS.primary[500],
        borderRadius: 4,
    },
    bodyText: {
        fontSize: 14,
        color: COLORS.neutral[600],
        marginBottom: 6,
        lineHeight: 20,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
});

export default Notifications;
