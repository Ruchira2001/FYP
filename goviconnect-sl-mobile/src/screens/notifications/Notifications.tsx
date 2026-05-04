import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../components';
import { COLORS, SHADOW } from '../../utils/constants';
import { notificationAPI } from '../../services/api';
import { connectSocket, getSocket } from '../../services/socketService';
import { getRelativeTime } from '../../utils/validators';

const FILTERS = ['All', 'Unread', 'Meetings', 'Tips', 'Chats', 'Diagnosis'];

type NotificationType = 'meeting' | 'tip' | 'guide' | 'chat' | 'system' | 'diagnosis';

interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    titleSi?: string;
    body: string;
    bodySi?: string;
    read: boolean;
    createdAt: string;
    data?: any;
}

const Notifications: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const normalizeNotification = (item: any): NotificationItem => ({
        id: item._id || item.id || `${item.type || 'notification'}-${item.createdAt || Date.now()}`,
        type: item.type || 'system',
        title: item.title || 'Notification',
        titleSi: item.titleSi || item.title,
        body: item.body || '',
        bodySi: item.bodySi || item.body,
        read: item.read === true,
        createdAt: item.createdAt || new Date().toISOString(),
        data: item.data,
    });

    const loadNotifications = async () => {
        try {
            const res = await notificationAPI.getNotifications({ page: 1, limit: 50 });
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setNotifications(data.map(normalizeNotification));
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setNotifications([]);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        let mounted = true;
        let socket = getSocket();

        const handleRealtimeNotification = (notification: any) => {
            if (!mounted) return;
            const normalized = normalizeNotification(notification);
            setNotifications(prev => [
                normalized,
                ...prev.filter(item => item.id !== normalized.id),
            ]);
        };

        const subscribe = async () => {
            socket = socket || await connectSocket();
            socket?.on('notification', handleRealtimeNotification);
        };

        subscribe();

        return () => {
            mounted = false;
            socket?.off('notification', handleRealtimeNotification);
        };
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleNotificationPress = async (notification: NotificationItem) => {
        if (!notification.read) {
            try {
                await notificationAPI.markAsRead(notification.id);
            } catch {
                // Keep the UI responsive even if the read update fails briefly.
            }
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
        }

        const data = notification.data || {};
        const routeNames = navigation.getState()?.routeNames || [];
        const hasRoute = (name: string) => routeNames.includes(name);

        switch (notification.type) {
            case 'meeting':
                if (hasRoute('ExpertTabs')) {
                    navigation.navigate('ExpertTabs', { screen: 'ExpertMeetingsTab' });
                } else if (hasRoute('MainTabs')) {
                    navigation.navigate('MainTabs', {
                        screen: 'MeetingsTab',
                        params: data.meetingId
                            ? { screen: 'MeetingDetails', params: { meetingId: data.meetingId } }
                            : { screen: 'MyMeetings' },
                    });
                } else if (hasRoute('MeetingsTab')) {
                    navigation.navigate('MeetingsTab', data.meetingId
                        ? { screen: 'MeetingDetails', params: { meetingId: data.meetingId } }
                        : { screen: 'MyMeetings' });
                }
                break;
            case 'chat':
                if (hasRoute('ExpertChatDetail') && data.chatId) {
                    navigation.navigate('ExpertChatDetail', { chatId: data.chatId });
                } else if (hasRoute('ExpertChatsList')) {
                    navigation.navigate('ExpertChatsList');
                } else if (hasRoute('ChatDetail') && data.chatId) {
                    navigation.navigate('ChatDetail', { chatId: data.chatId });
                } else if (hasRoute('ChatsList')) {
                    navigation.navigate('ChatsList');
                }
                break;
            case 'guide':
                if (hasRoute('ExpertTabs')) {
                    navigation.navigate('ExpertTabs', { screen: 'ExpertLearnHubTab' });
                } else if (hasRoute('ShopTabs')) {
                    navigation.navigate('ShopTabs', { screen: 'ShopLearnHubTab' });
                } else if (hasRoute('MainTabs')) {
                    navigation.navigate('MainTabs', { screen: 'LearnHubTab' });
                } else if (hasRoute('LearnHubTab')) {
                    navigation.navigate('LearnHubTab');
                }
                break;
            case 'diagnosis':
                if (hasRoute('ExpertDiagnosisReviews')) {
                    navigation.navigate('ExpertDiagnosisReviews');
                } else if (hasRoute('MainTabs')) {
                    navigation.navigate('MainTabs', { screen: 'AITab', params: { screen: 'DiagnosisHistory' } });
                } else if (hasRoute('AITab')) {
                    navigation.navigate('AITab', { screen: 'DiagnosisHistory' });
                }
                break;
            default:
                break;
        }
    };

    const handleMarkAllRead = async () => {
        await notificationAPI.markAllAsRead().catch(() => {});
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'Unread') return !n.read;
        if (activeFilter === 'Meetings') return n.type === 'meeting';
        if (activeFilter === 'Tips') return n.type === 'tip';
        if (activeFilter === 'Chats') return n.type === 'chat';
        if (activeFilter === 'Diagnosis') return n.type === 'diagnosis';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const meetingCount = notifications.filter(n => n.type === 'meeting').length;
    const diagnosisCount = notifications.filter(n => n.type === 'diagnosis').length;

    const getTypeConfig = (type: NotificationType) => {
        switch (type) {
            case 'meeting':
                return { icon: 'calendar' as const, color: COLORS.info, bgColor: '#dbeafe', label: 'Meeting' };
            case 'tip':
                return { icon: 'bulb' as const, color: COLORS.warning, bgColor: '#fef3c7', label: 'Tip' };
            case 'chat':
                return { icon: 'chatbubble' as const, color: COLORS.primary[500], bgColor: COLORS.primary[50], label: 'Chat' };
            case 'guide':
                return { icon: 'book' as const, color: COLORS.success, bgColor: '#dcfce7', label: 'Guide' };
            case 'diagnosis':
                return { icon: 'medical' as const, color: COLORS.error, bgColor: '#fee2e2', label: 'Diagnosis' };
            default:
                return { icon: 'notifications' as const, color: COLORS.neutral[500], bgColor: COLORS.neutral[100], label: 'System' };
        }
    };

    const renderNotification = ({ item }: { item: NotificationItem }) => {
        const typeConfig = getTypeConfig(item.type);
        const title = i18n.language === 'si' ? item.titleSi || item.title : item.title;
        const body = i18n.language === 'si' ? item.bodySi || item.body : item.body;

        return (
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                style={[styles.notificationCard, item.read ? styles.cardRead : styles.cardUnread]}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
                        <Ionicons name={typeConfig.icon} size={12} color={typeConfig.color} />
                        <Text style={[styles.typeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                    </View>
                    {!item.read && (
                        <View style={styles.unreadBadge}>
                            <View style={styles.unreadDot} />
                            <Text style={styles.unreadText}>New</Text>
                        </View>
                    )}
                </View>

                <View style={styles.contentRow}>
                    <View style={[styles.iconContainer, { backgroundColor: typeConfig.bgColor }]}>
                        <Ionicons name={typeConfig.icon} size={22} color={typeConfig.color} />
                    </View>
                    <View style={styles.contentInfo}>
                        <Text style={[styles.title, item.read ? styles.titleRead : styles.titleUnread]}>
                            {title}
                        </Text>
                        <Text style={styles.bodyText}>{body}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.timeText}>
                        {getRelativeTime(item.createdAt, i18n.language)}
                    </Text>
                    <View style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.primary[600]} />
                    </View>
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

            <View style={styles.statsSummary}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.error }]}>{unreadCount}</Text>
                    <Text style={styles.summaryLabel}>Unread</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.info }]}>{meetingCount}</Text>
                    <Text style={styles.summaryLabel}>Meetings</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{diagnosisCount}</Text>
                    <Text style={styles.summaryLabel}>Diagnosis</Text>
                </View>
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {FILTERS.map(filter => (
                        <Chip
                            key={filter}
                            label={filter}
                            selected={activeFilter === filter}
                            onPress={() => setActiveFilter(filter)}
                            variant="outline"
                            size="sm"
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllReadButton}>
                    <Ionicons name="checkmark-done" size={16} color={COLORS.primary[600]} />
                    <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
            )}

            {filteredNotifications.length > 0 ? (
                <FlatList
                    data={filteredNotifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary[500]]}
                            tintColor={COLORS.primary[500]}
                        />
                    }
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
        backgroundColor: COLORS.neutral[50],
    },
    statsSummary: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    summaryLabel: {
        fontSize: 11,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: COLORS.neutral[200],
    },
    filtersContainer: {
        paddingVertical: 12,
    },
    filtersContent: {
        paddingHorizontal: 16,
    },
    markAllReadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginRight: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: COLORS.primary[50],
        borderRadius: 50,
    },
    markAllReadText: {
        fontSize: 12,
        color: COLORS.primary[600],
        fontWeight: '500',
        marginLeft: 4,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 24,
    },
    notificationCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        ...SHADOW.sm,
    },
    cardRead: {
        backgroundColor: '#ffffff',
        borderColor: COLORS.neutral[100],
    },
    cardUnread: {
        backgroundColor: COLORS.primary[50],
        borderColor: COLORS.primary[100],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    unreadBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        backgroundColor: COLORS.primary[500],
        borderRadius: 4,
        marginRight: 4,
    },
    unreadText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.primary[600],
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    contentInfo: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    titleRead: {
        fontWeight: '500',
    },
    titleUnread: {
        fontWeight: '700',
    },
    bodyText: {
        fontSize: 13,
        color: COLORS.neutral[500],
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    timeText: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary[600],
        marginRight: 4,
    },
});

export default Notifications;
