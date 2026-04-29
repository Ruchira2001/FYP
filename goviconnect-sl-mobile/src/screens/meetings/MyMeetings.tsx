import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip, AppNotify } from '../../components';
import { COLORS, MEETING_STATUSES } from '../../utils/constants';
import { meetingAPI, chatAPI } from '../../services/api';
import { formatDateTime } from '../../utils/validators';
import { getSocket } from '../../services/socketService';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed';

interface MeetingItem {
    id: string;
    expertId: string;
    expertName: string;
    topic: string;
    topicSi: string;
    dateTime: string;
    duration: number;
    status: string;
    notes?: string;
    meetingLink?: string;
    reminderSet: boolean;
    source: string;
}

const MyMeetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [meetings, setMeetings] = useState<MeetingItem[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [loading, setLoading] = useState(true);
    const [togglingReminder, setTogglingReminder] = useState<string | null>(null);
    const [openingChat, setOpeningChat] = useState<string | null>(null);

    const loadMeetings = useCallback(async () => {
        try {
            const res = await meetingAPI.getMyMeetings();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setMeetings(data.map((m: any) => ({
                id: m._id || m.id,
                expertId: m.expert?._id || m.expertId || '',
                expertName: m.expert?.name || m.expertName || '',
                topic: m.topic || m.sessionTitle || '',
                topicSi: m.topicSi || m.topic || m.sessionTitle || '',
                dateTime: m.dateTime || m.createdAt,
                duration: m.duration || 30,
                status: m.status || 'pending',
                notes: m.notes,
                meetingLink: m.meetingLink,
                reminderSet: m.reminderSet || false,
                source: m.source || 'scheduled',
            })));
        } catch (e) {
            console.error('Failed to load my meetings:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMeetings();

        // Real-time: refresh when expert confirms / updates meeting
        const socket = getSocket();
        if (socket) {
            socket.on('meeting_updated', loadMeetings);
            socket.on('meeting_created', loadMeetings);
        }
        return () => {
            if (socket) {
                socket.off('meeting_updated', loadMeetings);
                socket.off('meeting_created', loadMeetings);
            }
        };
    }, [loadMeetings]);

    // Toggle reminder via API — persists to DB
    const handleToggleReminder = async (item: MeetingItem) => {
        setTogglingReminder(item.id);
        try {
            const res = await meetingAPI.toggleReminder(item.id);
            const updated = res.data.data;
            setMeetings(prev =>
                prev.map(m =>
                    m.id === item.id ? { ...m, reminderSet: updated.reminderSet } : m
                )
            );
            AppNotify.toast(
                updated.reminderSet
                    ? 'You will be reminded before this meeting.'
                    : 'Reminder has been removed.',
                updated.reminderSet ? 'success' : 'info'
            );
        } catch (e: any) {
            AppNotify.toast(e?.response?.data?.message || 'Could not update reminder.', 'error');
        } finally {
            setTogglingReminder(null);
        }
    };

    // Open or create chat with the meeting expert
    const handleChatWithExpert = async (item: MeetingItem) => {
        if (!item.expertId) {
            AppNotify.toast('Expert information not available.', 'warning');
            return;
        }
        setOpeningChat(item.id);
        try {
            const res = await chatAPI.createChat({ expertId: item.expertId });
            const chat = res.data.data;
            const chatId = chat._id || chat.id;
            navigation.navigate('ChatDetail', { chatId, expertName: item.expertName });
        } catch (e: any) {
            AppNotify.toast(e?.response?.data?.message || 'Could not open chat.', 'error');
        } finally {
            setOpeningChat(null);
        }
    };

    const filteredMeetings = meetings.filter(m =>
        filter === 'all' || m.status === filter
    );

    const filters: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: t('meetings.pending') },
        { id: 'confirmed', label: t('meetings.confirmed') },
        { id: 'completed', label: t('meetings.completed') },
    ];

    const renderMeeting = ({ item }: { item: MeetingItem }) => {
        const statusConfig = MEETING_STATUSES[item.status] || MEETING_STATUSES['pending'];
        const isOpeningThisChat = openingChat === item.id;
        const isTogglingThisReminder = togglingReminder === item.id;

        return (
            <View style={styles.meetingCard}>
                {/* Header: icon + topic + status */}
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: statusConfig.color + '20' }]}>
                        <Ionicons
                            name={item.source === 'chat_booking' ? 'chatbubble' : 'calendar'}
                            size={22}
                            color={statusConfig.color}
                        />
                    </View>
                    <View style={styles.headerTextBlock}>
                        <Text style={styles.topic} numberOfLines={1}>
                            {i18n.language === 'si' ? item.topicSi : item.topic}
                        </Text>
                        <Text style={styles.expertName}>{item.expertName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {i18n.language === 'si' ? statusConfig.labelSi : statusConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Date / Duration */}
                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.neutral[400]} />
                    <Text style={styles.metaText}>{formatDateTime(item.dateTime, i18n.language)}</Text>
                    <Ionicons name="time-outline" size={13} color={COLORS.neutral[400]} style={{ marginLeft: 10 }} />
                    <Text style={styles.metaText}>{item.duration} min</Text>
                </View>

                {item.source === 'chat_booking' && (
                    <View style={styles.sourceRow}>
                        <Ionicons name="chatbubble-outline" size={12} color={COLORS.neutral[400]} />
                        <Text style={styles.sourceText}>Booked from chat</Text>
                    </View>
                )}

                {item.reminderSet && (
                    <View style={styles.reminderActiveBadge}>
                        <Ionicons name="notifications" size={12} color={COLORS.primary[600]} />
                        <Text style={styles.reminderActiveBadgeText}>Reminder active</Text>
                    </View>
                )}

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    {/* Set / Remove Reminder */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.reminderBtn, item.reminderSet && styles.reminderBtnActive]}
                        onPress={() => handleToggleReminder(item)}
                        disabled={isTogglingThisReminder}
                    >
                        {isTogglingThisReminder
                            ? <ActivityIndicator size="small" color={item.reminderSet ? '#fff' : COLORS.primary[500]} />
                            : <Ionicons name={item.reminderSet ? 'notifications' : 'notifications-outline'} size={14} color={item.reminderSet ? '#fff' : COLORS.primary[500]} />
                        }
                        <Text style={[styles.actionBtnText, item.reminderSet && styles.actionBtnTextWhite]}>
                            {item.reminderSet ? 'Reminder On' : 'Set Reminder'}
                        </Text>
                    </TouchableOpacity>

                    {/* Chat with Expert */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.chatBtn]}
                        onPress={() => handleChatWithExpert(item)}
                        disabled={isOpeningThisChat}
                    >
                        {isOpeningThisChat
                            ? <ActivityIndicator size="small" color={COLORS.secondary[600]} />
                            : <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.secondary[600]} />
                        }
                        <Text style={[styles.actionBtnText, { color: COLORS.secondary[600] }]}>Chat</Text>
                    </TouchableOpacity>

                    {/* Join Meeting (confirmed + link) */}
                    {item.status === 'confirmed' && item.meetingLink ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.joinBtn]}
                            onPress={() =>
                                Linking.openURL(item.meetingLink!).catch(() =>
                                    AppNotify.toast('Cannot open meeting link.', 'error')
                                )
                            }
                        >
                            <Ionicons name="videocam" size={14} color="#fff" />
                            <Text style={[styles.actionBtnText, styles.actionBtnTextWhite]}>Join</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('meetings.my_meetings')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <View style={styles.filtersWrapper}>
                    {filters.map((f) => (
                        <Chip
                            key={f.id}
                            label={f.label}
                            selected={filter === f.id}
                            onPress={() => setFilter(f.id)}
                            variant="outline"
                            size="sm"
                        />
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary[500]} />
                </View>
            ) : filteredMeetings.length > 0 ? (
                <FlatList
                    data={filteredMeetings}
                    renderItem={renderMeeting}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={loadMeetings}
                    refreshing={false}
                />
            ) : (
                <EmptyState
                    icon="calendar-outline"
                    title={t('meetings.no_meetings')}
                    description="Book a meeting with an expert to get personalized advice"
                    actionLabel={t('meetings.title')}
                    onAction={() => navigation.goBack()}
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
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtersContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filtersWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    listContent: {
        padding: 16,
        paddingTop: 4,
    },
    meetingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        flexShrink: 0,
    },
    headerTextBlock: {
        flex: 1,
    },
    topic: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    expertName: {
        fontSize: 13,
        color: COLORS.primary[600],
        marginTop: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginLeft: 8,
        flexShrink: 0,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginLeft: 4,
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    sourceText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginLeft: 4,
    },
    reminderActiveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    reminderActiveBadgeText: {
        fontSize: 11,
        color: COLORS.primary[600],
        marginLeft: 4,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        gap: 4,
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary[600],
    },
    actionBtnTextWhite: {
        color: '#ffffff',
    },
    reminderBtn: {
        borderWidth: 1.5,
        borderColor: COLORS.primary[300],
        backgroundColor: COLORS.primary[50],
    },
    reminderBtnActive: {
        backgroundColor: COLORS.primary[500],
        borderColor: COLORS.primary[500],
    },
    chatBtn: {
        borderWidth: 1.5,
        borderColor: COLORS.secondary[300],
        backgroundColor: COLORS.secondary[50],
    },
    joinBtn: {
        backgroundColor: COLORS.primary[500],
    },
});

export default MyMeetings;
