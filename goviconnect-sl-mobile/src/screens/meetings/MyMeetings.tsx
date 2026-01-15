import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../components';
import { COLORS, MEETING_STATUSES } from '../../utils/constants';
import { getMyMeetings, Meeting } from '../../services/storage';
import { formatDateTime } from '../../utils/validators';
import meetingsData from '../../data/meetings.json';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed';

const MyMeetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        const storedMeetings = await getMyMeetings();
        // Combine with mock data
        const mockMeetings: Meeting[] = meetingsData.myMeetings.map(m => ({
            ...m,
            status: m.status as Meeting['status'],
            source: m.source as Meeting['source'],
        }));
        setMeetings([...mockMeetings, ...storedMeetings]);
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
});

export default MyMeetings;
