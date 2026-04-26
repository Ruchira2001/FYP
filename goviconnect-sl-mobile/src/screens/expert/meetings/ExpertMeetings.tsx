import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip, PrimaryButton } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { formatDate, formatTime, getRelativeTime } from '../../../utils/validators';
import { expertDashboardAPI } from '../../../services/api';
import { getSocket } from '../../../services/socketService';

const MEETING_FILTERS = ['All', 'Upcoming', 'Personal', 'Group', 'Completed'];

const ExpertMeetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { i18n } = useTranslation();

    const [activeFilter, setActiveFilter] = useState('All');
    const [meetings, setMeetings] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        description: '',
        type: 'group' as 'group' | 'personal',
        duration: '60',
        zoomLink: '',
        dateTime: tomorrow,
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const d = new Date(tomorrow);
        d.setDate(1);
        return d;
    });

    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 – 22:00
    const MINUTES = [0, 15, 30, 45];

    const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const getFirstDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

    const prevMonth = () => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const nextMonth = () => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const selectDay = (day: number) => {
        const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        const updated = new Date(newMeeting.dateTime);
        updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setNewMeeting(prev => ({ ...prev, dateTime: updated }));
        setShowDatePicker(false);
    };

    const selectHour = (h: number) => {
        const updated = new Date(newMeeting.dateTime);
        updated.setHours(h);
        setNewMeeting(prev => ({ ...prev, dateTime: updated }));
    };

    const selectMinute = (m: number) => {
        const updated = new Date(newMeeting.dateTime);
        updated.setMinutes(m);
        setNewMeeting(prev => ({ ...prev, dateTime: updated }));
        setShowTimePicker(false);
    };

    useEffect(() => {
        loadMeetings();

        // Real-time: listen for meeting updates from farmers
        const socket = getSocket();
        if (socket) {
            socket.on('meeting_booked', (data: any) => {
                loadMeetings();
            });
            socket.on('meeting_registered', (data: any) => {
                loadMeetings();
            });
        }

        return () => {
            if (socket) {
                socket.off('meeting_booked');
                socket.off('meeting_registered');
            }
        };
    }, []);

    const loadMeetings = async () => {
        try {
            const res = await expertDashboardAPI.getExpertMeetings();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setMeetings(data.map((m: any) => ({
                id: m._id || m.id,
                sessionTitle: m.sessionTitle || m.title || '',
                description: m.description || '',
                type: m.type || 'group',
                status: m.status || 'pending',
                dateTime: m.dateTime || m.date || '',
                duration: m.duration || 60,
                farmerName: m.farmer?.name || m.farmerName || '',
                attendees: m.attendees || 0,
                maxAttendees: m.maxAttendees || 20,
                meetingLink: m.meetingLink || '',
            })));
        } catch (e) {
            console.error('Failed to load expert meetings:', e);
        }
    };

    const isActiveStatus = (status: string) =>
        status === 'pending' || status === 'confirmed';

    const filteredMeetings = meetings.filter(meeting => {
        if (activeFilter === 'Upcoming') return isActiveStatus(meeting.status);
        if (activeFilter === 'Personal') return meeting.type === 'personal';
        if (activeFilter === 'Group') return meeting.type === 'group';
        if (activeFilter === 'Completed') return meeting.status === 'completed' || meeting.status === 'cancelled';
        return true;
    });

    const upcomingCount = meetings.filter(m => isActiveStatus(m.status)).length;

    const getMeetingTypeConfig = (type: string) => {
        if (type === 'personal') {
            return { label: 'One-on-One', icon: 'person' as const, color: COLORS.secondary[500], bgColor: COLORS.secondary[50] };
        }
        return { label: 'Group Session', icon: 'people' as const, color: COLORS.primary[600], bgColor: COLORS.primary[50] };
    };

    const handleCreateMeeting = async () => {
        if (!newMeeting.title.trim()) {
            Alert.alert('Error', 'Please enter a meeting title.');
            return;
        }
        if (newMeeting.dateTime <= new Date()) {
            Alert.alert('Error', 'Please select a future date and time.');
            return;
        }
        try {
            await expertDashboardAPI.createMeeting({
                topic: newMeeting.title,
                sessionTitle: newMeeting.title,
                description: newMeeting.description,
                type: newMeeting.type,
                duration: parseInt(newMeeting.duration),
                dateTime: newMeeting.dateTime.toISOString(),
                meetingLink: newMeeting.zoomLink.trim() || undefined,
            });
            Alert.alert('Success', 'Meeting session created successfully!');
            setShowCreateModal(false);
            setNewMeeting({ title: '', description: '', type: 'group', duration: '60', zoomLink: '', dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000) });
            loadMeetings();
        } catch (e: any) {
            console.error('Failed to create meeting:', e);
            const message = e?.response?.data?.message || e?.message || 'Failed to create meeting.';
            Alert.alert('Error', message);
        }
    };

    const renderMeetingCard = (meeting: any) => {
        const typeConfig = getMeetingTypeConfig(meeting.type);
        const isUpcoming = isActiveStatus(meeting.status);

        return (
            <TouchableOpacity
                key={meeting.id}
                style={[styles.meetingCard, !isUpcoming && styles.meetingCardCompleted]}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
                        <Ionicons name={typeConfig.icon} size={14} color={typeConfig.color} />
                        <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                    </View>
                    {isUpcoming ? (
                        <View style={styles.statusLive}>
                            <View style={styles.liveDot} />
                            <Text style={styles.statusLiveText}>Upcoming</Text>
                        </View>
                    ) : (
                        <View style={styles.statusCompleted}>
                            <Ionicons name="checkmark-circle" size={14} color={COLORS.neutral[400]} />
                            <Text style={styles.statusCompletedText}>Completed</Text>
                        </View>
                    )}
                </View>

                {/* Title */}
                <Text style={styles.meetingTitle}>{meeting.sessionTitle}</Text>
                <Text style={styles.meetingDescription} numberOfLines={2}>
                    {meeting.description}
                </Text>

                {/* Personal meeting farmer */}
                {meeting.type === 'personal' && meeting.farmerName && (
                    <View style={styles.farmerInfoRow}>
                        <View style={styles.farmerMiniAvatar}>
                            <Text style={{ fontSize: 12 }}>👨‍🌾</Text>
                        </View>
                        <Text style={styles.farmerInfoText}>{meeting.farmerName}</Text>
                    </View>
                )}

                {/* Meeting Info */}
                <View style={styles.meetingInfoGrid}>
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.neutral[400]} />
                        <Text style={styles.infoText}>
                            {formatDate(meeting.dateTime, i18n.language)}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color={COLORS.neutral[400]} />
                        <Text style={styles.infoText}>
                            {formatTime(meeting.dateTime, i18n.language)}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="hourglass-outline" size={16} color={COLORS.neutral[400]} />
                        <Text style={styles.infoText}>{meeting.duration} min</Text>
                    </View>
                </View>

                {/* Attendees */}
                {meeting.type === 'group' && (
                    <View style={styles.attendeesSection}>
                        <View style={styles.attendeesBar}>
                            <View style={styles.attendeesFill}>
                                <View
                                    style={[
                                        styles.attendeesProgress,
                                        {
                                            width: `${Math.min((meeting.attendees / meeting.maxAttendees) * 100, 100)}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={styles.attendeesText}>
                            {meeting.attendees}/{meeting.maxAttendees} farmers registered
                        </Text>
                    </View>
                )}

                {/* Action Button */}
                {isUpcoming && meeting.meetingLink && (
                    <TouchableOpacity
                        style={styles.joinButton}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(meeting.meetingLink).catch(() => Alert.alert('Error', 'Cannot open meeting link.'))}
                    >
                        <Ionicons name="videocam" size={18} color="#ffffff" />
                        <Text style={styles.joinButtonText}>
                            {meeting.type === 'personal' ? 'Start Session' : 'Start Meeting'}
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="My Meetings"
                showBack
                onBackPress={() => navigation.goBack()}
                rightContent={
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Ionicons name="add" size={20} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                }
            />

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Ionicons name="calendar" size={18} color={COLORS.primary[500]} />
                    <Text style={styles.statNumber}>{upcomingCount}</Text>
                    <Text style={styles.statText}>Upcoming</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Ionicons name="people" size={18} color={COLORS.secondary[500]} />
                    <Text style={styles.statNumber}>
                        {meetings.filter(m => m.type === 'group').length}
                    </Text>
                    <Text style={styles.statText}>Group</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Ionicons name="person" size={18} color={COLORS.info} />
                    <Text style={styles.statNumber}>
                        {meetings.filter(m => m.type === 'personal').length}
                    </Text>
                    <Text style={styles.statText}>Personal</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {MEETING_FILTERS.map((filter) => (
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

            {/* Meetings List */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {filteredMeetings.length > 0 ? (
                    filteredMeetings.map(renderMeetingCard)
                ) : (
                    <EmptyState
                        icon="calendar-outline"
                        title="No meetings found"
                        description="No meetings match the selected filter."
                    />
                )}
                <View style={{ height: 24 }} />
            </ScrollView>

            {/* Create Meeting Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create Meeting</Text>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.neutral[600]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Meeting Type</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        newMeeting.type === 'group' && styles.typeOptionActive,
                                    ]}
                                    onPress={() => setNewMeeting(prev => ({ ...prev, type: 'group' }))}
                                >
                                    <Ionicons name="people" size={20} color={newMeeting.type === 'group' ? COLORS.primary[600] : COLORS.neutral[400]} />
                                    <Text style={[
                                        styles.typeOptionText,
                                        newMeeting.type === 'group' && styles.typeOptionTextActive,
                                    ]}>Group Session</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        newMeeting.type === 'personal' && styles.typeOptionActive,
                                    ]}
                                    onPress={() => setNewMeeting(prev => ({ ...prev, type: 'personal' }))}
                                >
                                    <Ionicons name="person" size={20} color={newMeeting.type === 'personal' ? COLORS.secondary[600] : COLORS.neutral[400]} />
                                    <Text style={[
                                        styles.typeOptionText,
                                        newMeeting.type === 'personal' && styles.typeOptionTextActive2,
                                    ]}>One-on-One</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Title</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Enter meeting title..."
                                placeholderTextColor={COLORS.neutral[400]}
                                value={newMeeting.title}
                                onChangeText={(text) => setNewMeeting(prev => ({ ...prev, title: text }))}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={[styles.formInput, styles.formTextarea]}
                                placeholder="Enter meeting description..."
                                placeholderTextColor={COLORS.neutral[400]}
                                value={newMeeting.description}
                                onChangeText={(text) => setNewMeeting(prev => ({ ...prev, description: text }))}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Duration (minutes)</Text>
                            <View style={styles.durationSelector}>
                                {['30', '45', '60', '90'].map((duration) => (
                                    <TouchableOpacity
                                        key={duration}
                                        style={[
                                            styles.durationOption,
                                            newMeeting.duration === duration && styles.durationOptionActive,
                                        ]}
                                        onPress={() => setNewMeeting(prev => ({ ...prev, duration }))}
                                    >
                                        <Text style={[
                                            styles.durationText,
                                            newMeeting.duration === duration && styles.durationTextActive,
                                        ]}>{duration}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Date Picker */}
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Date</Text>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => {
                                    const m = new Date(newMeeting.dateTime);
                                    m.setDate(1);
                                    setCalendarMonth(m);
                                    setShowDatePicker(v => !v);
                                    setShowTimePicker(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="calendar-outline" size={18} color={COLORS.primary[500]} />
                                <Text style={styles.datePickerText}>
                                    {newMeeting.dateTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </Text>
                                <Ionicons name={showDatePicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>

                            {showDatePicker && (
                                <View style={styles.calendarPanel}>
                                    {/* Month nav */}
                                    <View style={styles.calendarNav}>
                                        <TouchableOpacity onPress={prevMonth} style={styles.calendarNavBtn}>
                                            <Ionicons name="chevron-back" size={20} color={COLORS.primary[500]} />
                                        </TouchableOpacity>
                                        <Text style={styles.calendarMonthLabel}>
                                            {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                                        </Text>
                                        <TouchableOpacity onPress={nextMonth} style={styles.calendarNavBtn}>
                                            <Ionicons name="chevron-forward" size={20} color={COLORS.primary[500]} />
                                        </TouchableOpacity>
                                    </View>
                                    {/* Day headers */}
                                    <View style={styles.calendarRow}>
                                        {DAY_NAMES.map(d => (
                                            <Text key={d} style={styles.calendarDayHeader}>{d}</Text>
                                        ))}
                                    </View>
                                    {/* Day grid */}
                                    <View style={styles.calendarGrid}>
                                        {Array.from({ length: getFirstDay(calendarMonth) }).map((_, i) => (
                                            <View key={`e${i}`} style={styles.calendarCell} />
                                        ))}
                                        {Array.from({ length: getDaysInMonth(calendarMonth) }).map((_, i) => {
                                            const day = i + 1;
                                            const thisDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                            const isPast = thisDate < today;
                                            const isSelected = isSameDay(thisDate, newMeeting.dateTime);
                                            return (
                                                <TouchableOpacity
                                                    key={day}
                                                    style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                                                    onPress={() => !isPast && selectDay(day)}
                                                    activeOpacity={isPast ? 1 : 0.7}
                                                >
                                                    <Text style={[
                                                        styles.calendarDayText,
                                                        isSelected && styles.calendarDayTextSelected,
                                                        isPast && styles.calendarDayPast,
                                                    ]}>{day}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Time Picker */}
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Time</Text>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => {
                                    setShowTimePicker(v => !v);
                                    setShowDatePicker(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="time-outline" size={18} color={COLORS.primary[500]} />
                                <Text style={styles.datePickerText}>
                                    {newMeeting.dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Ionicons name={showTimePicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>

                            {showTimePicker && (
                                <View style={styles.timePanel}>
                                    <Text style={styles.timePanelLabel}>Hour</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                        {HOURS.map(h => {
                                            const sel = newMeeting.dateTime.getHours() === h;
                                            return (
                                                <TouchableOpacity
                                                    key={h}
                                                    style={[styles.timeChip, sel && styles.timeChipSelected]}
                                                    onPress={() => selectHour(h)}
                                                >
                                                    <Text style={[styles.timeChipText, sel && styles.timeChipTextSelected]}>
                                                        {h.toString().padStart(2, '0')}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                    <Text style={styles.timePanelLabel}>Minute</Text>
                                    <View style={styles.minuteRow}>
                                        {MINUTES.map(m => {
                                            const sel = newMeeting.dateTime.getMinutes() === m;
                                            return (
                                                <TouchableOpacity
                                                    key={m}
                                                    style={[styles.timeChip, sel && styles.timeChipSelected]}
                                                    onPress={() => selectMinute(m)}
                                                >
                                                    <Text style={[styles.timeChipText, sel && styles.timeChipTextSelected]}>
                                                        :{m.toString().padStart(2, '0')}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Zoom / Meeting Link */}
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Zoom / Meeting Link (optional)</Text>
                            <View style={styles.linkInputRow}>
                                <Ionicons name="videocam-outline" size={18} color={COLORS.primary[500]} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.formInput, { flex: 1 }]}
                                    placeholder="https://zoom.us/j/..."
                                    placeholderTextColor={COLORS.neutral[400]}
                                    value={newMeeting.zoomLink}
                                    onChangeText={(text) => setNewMeeting(prev => ({ ...prev, zoomLink: text }))}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <PrimaryButton
                            title="Create Meeting"
                            onPress={handleCreateMeeting}
                            icon="calendar"
                            fullWidth
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary[50],
        borderWidth: 1,
        borderColor: COLORS.primary[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        marginTop: 4,
    },
    statText: {
        fontSize: 11,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    statDivider: {
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
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    meetingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    meetingCardCompleted: {
        opacity: 0.7,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    statusLive: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    statusLiveText: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '500',
    },
    statusCompleted: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusCompletedText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginLeft: 4,
    },
    meetingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    meetingDescription: {
        fontSize: 13,
        color: COLORS.neutral[500],
        lineHeight: 18,
        marginBottom: 10,
    },
    farmerInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: COLORS.secondary[50],
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    farmerMiniAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    farmerInfoText: {
        fontSize: 13,
        color: COLORS.secondary[700],
        fontWeight: '500',
    },
    meetingInfoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        color: COLORS.neutral[600],
        marginLeft: 4,
    },
    attendeesSection: {
        marginBottom: 12,
    },
    attendeesBar: {
        height: 6,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    attendeesFill: {
        height: '100%',
    },
    attendeesProgress: {
        height: '100%',
        backgroundColor: COLORS.primary[400],
        borderRadius: 3,
    },
    attendeesText: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: COLORS.primary[500],
        ...SHADOW.md,
        shadowColor: COLORS.primary[500],
    },
    joinButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 6,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[700],
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: COLORS.neutral[50],
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: COLORS.neutral[800],
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    formTextarea: {
        minHeight: 100,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.neutral[200],
    },
    typeOptionActive: {
        borderColor: COLORS.primary[400],
        backgroundColor: COLORS.primary[50],
    },
    typeOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[500],
        marginLeft: 8,
    },
    typeOptionTextActive: {
        color: COLORS.primary[600],
    },
    typeOptionTextActive2: {
        color: COLORS.secondary[600],
    },
    durationSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    durationOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COLORS.neutral[200],
    },
    durationOptionActive: {
        borderColor: COLORS.primary[400],
        backgroundColor: COLORS.primary[50],
    },
    durationText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[500],
    },
    durationTextActive: {
        color: COLORS.primary[600],
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[50],
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    datePickerText: {
        fontSize: 14,
        color: COLORS.neutral[800],
        marginLeft: 8,
    },
    // ── Calendar ─────────────────────────────────────────────
    calendarPanel: {
        marginTop: 8,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        padding: 12,
    },
    calendarNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    calendarNavBtn: {
        padding: 6,
    },
    calendarMonthLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    calendarRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    calendarDayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.neutral[400],
        paddingVertical: 4,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    calendarCellSelected: {
        backgroundColor: COLORS.primary[500],
    },
    calendarDayText: {
        fontSize: 13,
        color: COLORS.neutral[700],
    },
    calendarDayTextSelected: {
        color: '#ffffff',
        fontWeight: '700',
    },
    calendarDayPast: {
        color: COLORS.neutral[300],
    },
    // ── Time Picker ──────────────────────────────────────────
    timePanel: {
        marginTop: 8,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        padding: 12,
    },
    timePanelLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.neutral[500],
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    minuteRow: {
        flexDirection: 'row',
        gap: 8,
    },
    timeChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.neutral[200],
        marginRight: 8,
        backgroundColor: COLORS.neutral[50],
    },
    timeChipSelected: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[500],
    },
    timeChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[600],
    },
    timeChipTextSelected: {
        color: '#ffffff',
    },
    linkInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[50],
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
});

export default ExpertMeetings;
