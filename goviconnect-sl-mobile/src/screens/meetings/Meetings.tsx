import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../components';
import { COLORS } from '../../utils/constants';
import { formatDateTime } from '../../utils/validators';
import { meetingAPI } from '../../services/api';

const Meetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const res = await meetingAPI.getSessions();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setUpcomingSessions(data.map((s: any) => ({
                id: s._id || s.id,
                title: s.topic || s.title || '',
                titleSi: s.topicSi || s.titleSi || s.topic || '',
                expertName: s.expert?.name || s.expertName || '',
                dateTime: s.dateTime || s.createdAt,
                duration: s.duration || 60,
                attendees: s.attendees?.length || 0,
                maxAttendees: s.maxAttendees || 50,
            })));
        } catch (e) {
            console.error('Failed to load sessions:', e);
        }
    };

    const renderSession = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('MeetingDetails', { meetingId: item.id })}
            style={styles.sessionCard}
        >
            <View style={styles.sessionContent}>
                <View style={styles.iconContainer}>
                    <Ionicons name="videocam" size={24} color={COLORS.primary[600]} />
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sessionTitle} numberOfLines={2}>
                        {i18n.language === 'si' ? item.titleSi : item.title}
                    </Text>
                    <Text style={styles.expertName}>
                        {item.expertName}
                    </Text>

                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.metaText}>
                            {formatDateTime(item.dateTime, i18n.language)}
                        </Text>
                    </View>

                    <View style={styles.metaRowSecondary}>
                        <Ionicons name="time-outline" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.metaText}>
                            {item.duration} min
                        </Text>
                        <View style={styles.attendeesContainer}>
                            <Ionicons name="people-outline" size={14} color={COLORS.neutral[400]} />
                            <Text style={styles.metaText}>
                                {item.attendees}/{item.maxAttendees}
                            </Text>
                        </View>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header title={t('meetings.title')} showBack onBackPress={() => navigation.goBack()} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* My Meetings Quick Access */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('MyMeetings')}
                    style={styles.quickAccessCard}
                >
                    <View style={styles.quickAccessIcon}>
                        <Ionicons name="calendar" size={24} color="white" />
                    </View>
                    <View style={styles.quickAccessContent}>
                        <Text style={styles.quickAccessTitle}>
                            {t('meetings.my_meetings')}
                        </Text>
                        <Text style={styles.quickAccessDescription}>
                            View your booked and requested meetings
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>

                {/* Upcoming Sessions */}
                <View style={styles.upcomingContainer}>
                    <Text style={styles.sectionTitle}>
                        {t('meetings.upcoming')}
                    </Text>

                    {upcomingSessions.length > 0 ? (
                        upcomingSessions.map((session) => (
                            <View key={session.id}>
                                {renderSession({ item: session })}
                            </View>
                        ))
                    ) : (
                        <EmptyState
                            icon="calendar-outline"
                            title={t('meetings.no_upcoming')}
                            description="No upcoming expert sessions at the moment"
                        />
                    )}
                </View>
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
    quickAccessCard: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: COLORS.primary[500],
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    quickAccessIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    quickAccessContent: {
        flex: 1,
    },
    quickAccessTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    quickAccessDescription: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    upcomingContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
    },
    sessionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sessionContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.primary[100],
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailsContainer: {
        flex: 1,
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    expertName: {
        fontSize: 14,
        color: COLORS.primary[600],
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    metaRowSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginLeft: 4,
    },
    attendeesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
});

export default Meetings;
