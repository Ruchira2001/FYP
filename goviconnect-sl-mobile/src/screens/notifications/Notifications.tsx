import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../components';
import { COLORS, NOTIFICATION_TYPES, SHADOW } from '../../utils/constants';
import { markNotificationRead, Notification } from '../../services/storage';
import { getRelativeTime } from '../../utils/validators';

const FILTERS = ['All', 'Unread', 'Meetings', 'Tips', 'Chats'];

const Notifications: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');

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
            {
                id: '5',
                type: 'meeting',
                title: 'Meeting Completed',
                titleSi: 'රැස්වීම සම්පූර්ණයි',
                body: 'Your consultation with Dr. Perera has been completed',
                bodySi: 'ආචාර්ය පෙරේරා සමඟ ඔබේ උපදේශනය සම්පූර්ණ කර ඇත',
                read: true,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
            {
                id: '6',
                type: 'tip',
                title: 'Weather Alert',
                titleSi: 'කාලගුණ අනතුරු ඇඟවීම',
                body: 'Heavy rain expected this weekend. Protect your harvest!',
                bodySi: 'මේ සති අන්තයේ අධික වැසි අපේක්ෂා කෙරේ. ඔබේ අස්වැන්න ආරක්ෂා කරන්න!',
                read: false,
                createdAt: new Date(Date.now() - 10800000).toISOString(),
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

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'Unread') return !n.read;
        if (activeFilter === 'Meetings') return n.type === 'meeting';
        if (activeFilter === 'Tips') return n.type === 'tip';
        if (activeFilter === 'Chats') return n.type === 'chat';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const meetingCount = notifications.filter(n => n.type === 'meeting').length;
    const tipCount = notifications.filter(n => n.type === 'tip').length;

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'meeting':
                return { icon: 'calendar' as const, color: COLORS.info, bgColor: '#dbeafe', label: 'Meeting' };
            case 'tip':
                return { icon: 'bulb' as const, color: COLORS.warning, bgColor: '#fef3c7', label: 'Tip' };
            case 'chat':
                return { icon: 'chatbubble' as const, color: COLORS.primary[500], bgColor: COLORS.primary[50], label: 'Chat' };
            case 'guide':
                return { icon: 'book' as const, color: COLORS.success, bgColor: '#dcfce7', label: 'Guide' };
            default:
                return { icon: 'notifications' as const, color: COLORS.neutral[500], bgColor: COLORS.neutral[100], label: 'System' };
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => {
        const typeConfig = getTypeConfig(item.type);

        return (
            <TouchableOpacity
                onPress={() => handleNotificationPress(item)}
                style={[styles.notificationCard, item.read ? styles.cardRead : styles.cardUnread]}
                activeOpacity={0.7}
            >
                {/* Header Row */}
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

                {/* Content */}
                <View style={styles.contentRow}>
                    <View style={[styles.iconContainer, { backgroundColor: typeConfig.bgColor }]}>
                        <Ionicons name={typeConfig.icon} size={22} color={typeConfig.color} />
                    </View>
                    <View style={styles.contentInfo}>
                        <Text style={[styles.title, item.read ? styles.titleRead : styles.titleUnread]}>
                            {i18n.language === 'si' ? item.titleSi : item.title}
                        </Text>
                        <Text style={styles.bodyText} numberOfLines={2}>
                            {i18n.language === 'si' ? item.bodySi : item.body}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <Text style={styles.timeText}>
                        {getRelativeTime(item.createdAt, i18n.language)}
                    </Text>
                    <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.primary[600]} />
                    </TouchableOpacity>
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

            {/* Stats Summary */}
            <View style={styles.statsSummary}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                        {unreadCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Unread</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.info }]}>
                        {meetingCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Meetings</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                        {tipCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Tips</Text>
                </View>
            </View>

            {/* Filters */}
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

            {/* Mark all read button */}
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
    // ===== Stats Summary =====
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
    // ===== Filters =====
    filtersContainer: {
        paddingVertical: 12,
    },
    filtersContent: {
        paddingHorizontal: 16,
    },
    // ===== Mark All Read =====
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
    // ===== List =====
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 24,
    },
    // ===== Notification Card =====
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
    // ===== Content =====
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
    // ===== Footer =====
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
