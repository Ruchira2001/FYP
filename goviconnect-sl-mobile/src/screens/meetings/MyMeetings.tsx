import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../components';
import { COLORS, MEETING_STATUSES } from '../../utils/constants';
import { Meeting } from '../../services/storage';
import { meetingAPI } from '../../services/api';
import { formatDateTime } from '../../utils/validators';
import { getSocket } from '../../services/socketService';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed';

const MyMeetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        loadMeetings();

        // Real-time: refresh when expert updates meeting status
        const socket = getSocket();
        if (socket) {
            socket.on('meeting_updated', () => loadMeetings());
        }

        return () => {
            if (socket) socket.off('meeting_updated');
        };
    }, []);

    const loadMeetings = async () => {
        try {
            const res = await meetingAPI.getMyMeetings();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setMeetings(data.map((m: any) => ({
                id: m._id || m.id,
                expertId: m.expert?._id || m.expertId || '',
                expertName: m.expert?.name || m.expertName || '',
                expertAvatar: m.expert?.avatar,
                topic: m.topic || '',
                topicSi: m.topicSi || m.topic || '',
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

    const renderMeeting = ({ item }: { item: Meeting }) => {
        const statusConfig = MEETING_STATUSES[item.status];

        return (
            <TouchableOpacity
                style={styles.meetingCard}
                onPress={() => { /* Perhaps navigate to MeetingDetails if applicable */ }}
            >
                <View style={styles.cardContent}>
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: statusConfig.color + '20' }
                        ]}
                    >
                        <Ionicons
                            name={item.source === 'chat_booking' ? 'chatbubble' : 'calendar'}
                            size={24}
                            color={statusConfig.color}
                        />
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.topic} numberOfLines={1}>
                                {i18n.language === 'si' ? item.topicSi : item.topic}
                            </Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: statusConfig.color + '20' }
                                ]}
                            >
                                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                    {i18n.language === 'si' ? statusConfig.labelSi : statusConfig.label}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.expertName}>
                            {item.expertName}
                        </Text>

                        <View style={styles.metaRow}>
                            <Ionicons name="calendar-outline" size={14} color={COLORS.neutral[400]} />
                            <Text style={styles.metaText}>
                                {formatDateTime(item.dateTime, i18n.language)}
                            </Text>
                            <Text style={styles.durationText}>
                                • {item.duration} min
                            </Text>
                        </View>

                        {item.source === 'chat_booking' && (
                            <View style={styles.sourceRow}>
                                <Ionicons name="chatbubble-outline" size={12} color={COLORS.neutral[400]} />
                                <Text style={styles.sourceText}>Booked from chat</Text>
                            </View>
                        )}

                        {item.status === 'confirmed' && item.meetingLink ? (
                            <TouchableOpacity
                                style={styles.joinButton}
                                onPress={() => Linking.openURL(item.meetingLink!).catch(() => Alert.alert('Error', 'Cannot open meeting link.'))}
                            >
                                <Ionicons name="videocam" size={14} color="#fff" />
                                <Text style={styles.joinButtonText}>Join Meeting</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            </TouchableOpacity>
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

            {filteredMeetings.length > 0 ? (
                <FlatList
                    data={filteredMeetings}
                    renderItem={renderMeeting}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
    filtersContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filtersWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    meetingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailsContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    topic: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    expertName: {
        fontSize: 14,
        color: COLORS.primary[600],
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginLeft: 4,
    },
    durationText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginLeft: 8,
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    sourceText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginLeft: 4,
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[500],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    joinButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 4,
    },
});

export default MyMeetings;
