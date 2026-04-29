import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../components';
import { COLORS } from '../../utils/constants';
import { formatDateTime } from '../../utils/validators';
import { meetingAPI, expertsAPI } from '../../services/api';
import { getSocket } from '../../services/socketService';

type TabType = 'upcoming' | 'myMeetings';

const SPECIALTIES = [
    'All', 'Vegetables', 'Fruits', 'Paddy', 'Tea', 'Rubber',
    'Coconut', 'Spices', 'Organic Farming', 'Soil Science', 'Plant Pathology',
];

const Meetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [experts, setExperts] = useState<any[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
    const [loadingExperts, setLoadingExperts] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');

    useFocusEffect(
        useCallback(() => {
            loadExperts();
            loadSessions();

            const socket = getSocket();
            if (socket) {
                socket.on('meeting_created', loadSessions);
            }
            return () => {
                if (socket) socket.off('meeting_created', loadSessions);
            };
        }, [])
    );

    const loadExperts = async () => {
        setLoadingExperts(true);
        try {
            const res = await expertsAPI.listExperts();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setExperts(data);
        } catch (e) {
            console.error('Failed to load experts:', e);
        } finally {
            setLoadingExperts(false);
        }
    };

    const loadSessions = async () => {
        setLoadingSessions(true);
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
        } finally {
            setLoadingSessions(false);
        }
    };

    const filteredExperts = experts.filter((e: any) => {
        const matchesSearch =
            searchQuery === '' ||
            (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (e.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (e.district || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty =
            selectedSpecialty === 'All' ||
            (e.specialty || '').toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
            (e.specializations || []).some((s: string) =>
                s.toLowerCase().includes(selectedSpecialty.toLowerCase())
            );
        return matchesSearch && matchesSpecialty;
    });

    const getInitials = (name: string) =>
        (name || 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

    const renderStars = (rating: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <Ionicons
                key={i}
                name={i < Math.round(rating) ? 'star' : 'star-outline'}
                size={11}
                color={i < Math.round(rating) ? '#f59e0b' : COLORS.neutral[300]}
            />
        ));

    const renderSession = (item: any) => (
        <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate('MeetingDetails', { meetingId: item.id })}
            style={styles.sessionCard}
            activeOpacity={0.85}
        >
            <View style={styles.sessionIconBox}>
                <Ionicons name="videocam" size={22} color={COLORS.primary[600]} />
            </View>
            <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle} numberOfLines={2}>
                    {i18n.language === 'si' ? item.titleSi : item.title}
                </Text>
                <Text style={styles.sessionExpert}>{item.expertName}</Text>
                <View style={styles.sessionMeta}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.neutral[400]} />
                    <Text style={styles.sessionMetaText}>{formatDateTime(item.dateTime, i18n.language)}</Text>
                    <Ionicons name="time-outline" size={12} color={COLORS.neutral[400]} style={{ marginLeft: 8 }} />
                    <Text style={styles.sessionMetaText}>{item.duration} min</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[400]} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* LearnHub-style header with back button */}
            <Header title="Expert Hub" showBack onBackPress={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={COLORS.neutral[400]} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search experts by name, specialty..."
                            placeholderTextColor={COLORS.neutral[400]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={COLORS.neutral[400]} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Specialty Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChips}
                >
                    {SPECIALTIES.map(spec => (
                        <TouchableOpacity
                            key={spec}
                            onPress={() => setSelectedSpecialty(spec)}
                            style={[styles.filterChip, selectedSpecialty === spec && styles.filterChipActive]}
                        >
                            <Text style={[styles.filterChipText, selectedSpecialty === spec && styles.filterChipTextActive]}>
                                {spec}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Our Experts — Horizontal Circular Buttons */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Our Experts</Text>
                    <Text style={styles.sectionCount}>
                        {loadingExperts ? '...' : `${filteredExperts.length} available`}
                    </Text>
                </View>

                {loadingExperts ? (
                    <View style={styles.expertsLoadingRow}>
                        <ActivityIndicator size="small" color={COLORS.primary[500]} />
                    </View>
                ) : filteredExperts.length === 0 ? (
                    <View style={styles.expertsLoadingRow}>
                        <Text style={styles.noExpertsText}>No experts match your search</Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.expertCirclesList}
                    >
                        {filteredExperts.map((item: any) => {
                            const id = item._id || item.id;
                            const initials = getInitials(item.name);
                            return (
                                <TouchableOpacity
                                    key={id}
                                    style={styles.expertCircleItem}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('ExpertProfileView', { expertId: id, expertName: item.name })}
                                >
                                    <View style={styles.expertCircle}>
                                        <Text style={styles.expertCircleInitials}>{initials}</Text>
                                        {item.isActive !== false && <View style={styles.expertOnlineDot} />}
                                    </View>
                                    <Text style={styles.expertCircleName} numberOfLines={2}>{item.name}</Text>
                                    <View style={styles.expertCircleRatingRow}>
                                        <Ionicons name="star" size={10} color="#f59e0b" />
                                        <Text style={styles.expertCircleRatingText}>
                                            {item.rating ? item.rating.toFixed(1) : '—'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Sessions / My Meetings Segmented Tabs */}
                <View style={styles.sessionTabRow}>
                    {([
                        { key: 'upcoming', label: 'Upcoming Sessions', icon: 'calendar-outline' },
                        { key: 'myMeetings', label: 'My Meetings', icon: 'person-circle-outline' },
                    ] as { key: TabType; label: string; icon: any }[]).map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.sessionTabItem, activeTab === tab.key && styles.sessionTabItemActive]}
                            onPress={() => {
                                if (tab.key === 'myMeetings') {
                                    navigation.navigate('MyMeetings');
                                } else {
                                    setActiveTab(tab.key);
                                }
                            }}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={15}
                                color={activeTab === tab.key ? COLORS.primary[600] : COLORS.neutral[400]}
                            />
                            <Text style={[styles.sessionTabLabel, activeTab === tab.key && styles.sessionTabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sessions List */}
                {loadingSessions ? (
                    <ActivityIndicator size="small" color={COLORS.primary[400]} style={{ marginVertical: 20 }} />
                ) : upcomingSessions.length > 0 ? (
                    <View style={styles.sessionsContainer}>
                        {upcomingSessions.map(session => renderSession(session))}
                    </View>
                ) : (
                    <EmptyState
                        icon="calendar-outline"
                        title="No upcoming sessions"
                        description="No expert sessions scheduled right now"
                    />
                )}

                <View style={{ height: 24 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },

    searchContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.neutral[800] },

    filterChips: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.neutral[200],
        backgroundColor: '#fff',
    },
    filterChipActive: { borderColor: COLORS.primary[500], backgroundColor: COLORS.primary[500] },
    filterChipText: { fontSize: 13, fontWeight: '500', color: COLORS.neutral[600] },
    filterChipTextActive: { color: '#fff', fontWeight: '600' },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 10,
        marginTop: 14,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.neutral[800] },
    sectionCount: { fontSize: 13, color: COLORS.neutral[400] },

    /* Horizontal expert circles */
    expertsLoadingRow: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    noExpertsText: { fontSize: 14, color: COLORS.neutral[400] },
    expertCirclesList: { paddingHorizontal: 16, paddingBottom: 8, gap: 14 },
    expertCircleItem: {
        alignItems: 'center',
        width: 76,
    },
    expertCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        shadowColor: COLORS.primary[600],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    expertCircleInitials: { fontSize: 22, fontWeight: '800', color: '#fff' },
    expertOnlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22c55e',
        borderWidth: 2.5,
        borderColor: '#fff',
    },
    expertCircleName: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.neutral[800],
        textAlign: 'center',
        marginTop: 7,
        lineHeight: 15,
        width: 76,
    },
    expertCircleRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 3,
    },
    expertCircleRatingText: { fontSize: 11, color: COLORS.neutral[500] },

    /* Segmented tab row for sessions */
    sessionTabRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 18,
        marginBottom: 12,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 12,
        padding: 4,
    },
    sessionTabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 9,
    },
    sessionTabItemActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    sessionTabLabel: { fontSize: 13, fontWeight: '500', color: COLORS.neutral[500] },
    sessionTabLabelActive: { color: COLORS.primary[700], fontWeight: '700' },

    sessionsContainer: { paddingHorizontal: 16 },
    sessionCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 10,
    },
    sessionIconBox: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary[50],
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sessionInfo: { flex: 1 },
    sessionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.neutral[800], marginBottom: 2 },
    sessionExpert: { fontSize: 12, color: COLORS.primary[600], marginBottom: 6 },
    sessionMeta: { flexDirection: 'row', alignItems: 'center' },
    sessionMetaText: { fontSize: 11, color: COLORS.neutral[400], marginLeft: 3 },
});

export default Meetings;

