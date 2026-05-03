import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Modal, TextInput, Linking, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip, PrimaryButton, AppNotify } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { formatDate, formatTime } from '../../../utils/validators';
import { expertDashboardAPI, chatAPI } from '../../../services/api';
import { getSocket } from '../../../services/socketService';

interface MeetingItem {
    id: string;
    sessionTitle: string;
    description: string;
    type: 'group' | 'personal';
    status: string;
    dateTime: string;
    duration: number;
    farmerId: string;
    farmerName: string;
    farmerDistrict: string;
    attendees: number;
    maxAttendees: number;
    meetingLink: string;
    registeredUsers: { _id: string; name: string; district?: string }[];
}

const MEETING_FILTERS = ['All', 'Upcoming', 'Personal', 'Group', 'Past'] as const;
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const MINUTES = [0, 15, 30, 45];

const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const getFirstDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
const emptyForm = () => ({
    title: '', description: '', type: 'group' as 'group' | 'personal',
    duration: '60', zoomLink: '', dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
});

const ExpertMeetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { i18n } = useTranslation();

    const [activeFilter, setActiveFilter] = useState<typeof MEETING_FILTERS[number]>('All');
    const [meetings, setMeetings] = useState<MeetingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<MeetingItem | null>(null);
    const [formData, setFormData] = useState(emptyForm());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(Date.now() + 86400000); d.setDate(1); return d; });
    const [formLoading, setFormLoading] = useState(false);
    const [detailMeeting, setDetailMeeting] = useState<MeetingItem | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [actionMeeting, setActionMeeting] = useState<MeetingItem | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const actionSheetAnim = useRef(new Animated.Value(200)).current;
    const [postponeMeeting, setPostponeMeeting] = useState<MeetingItem | null>(null);
    const [showPostpone, setShowPostpone] = useState(false);
    const [postponeDate, setPostponeDate] = useState(new Date(Date.now() + 86400000));
    const [postponeCalMonth, setPostponeCalMonth] = useState(() => { const d = new Date(Date.now() + 86400000); d.setDate(1); return d; });
    const [showPostponeDatePicker, setShowPostponeDatePicker] = useState(false);
    const [showPostponeTimePicker, setShowPostponeTimePicker] = useState(false);
    const [openingChat, setOpeningChat] = useState<string | null>(null);

    useEffect(() => {
        loadMeetings();
        const socket = getSocket();
        if (socket) {
            socket.on('meeting_booked', loadMeetings);
            socket.on('meeting_registered', loadMeetings);
            socket.on('meeting_updated', loadMeetings);
            socket.on('meeting_deleted', loadMeetings);
        }
        return () => {
            if (socket) {
                socket.off('meeting_booked', loadMeetings);
                socket.off('meeting_registered', loadMeetings);
                socket.off('meeting_updated', loadMeetings);
                socket.off('meeting_deleted', loadMeetings);
            }
        };
    }, []);

    const loadMeetings = async () => {
        setLoading(true);
        try {
            const res = await expertDashboardAPI.getExpertMeetings();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setMeetings(data.map((m: any): MeetingItem => ({
                id: m._id || m.id,
                sessionTitle: m.sessionTitle || m.topic || m.title || '',
                description: m.description || '',
                type: m.type || 'group',
                status: m.status || 'pending',
                dateTime: m.dateTime || m.date || '',
                duration: m.duration || 60,
                farmerId: m.farmerId?._id || m.farmerId || '',
                farmerName: m.farmerId?.name || m.farmerName || '',
                farmerDistrict: m.farmerId?.district || m.farmerDistrict || '',
                attendees: m.attendees || 0,
                maxAttendees: m.maxAttendees || 50,
                meetingLink: m.meetingLink || '',
                registeredUsers: Array.isArray(m.registeredUsers) ? m.registeredUsers : [],
            })));
        } catch (e) {
            console.error('Failed to load expert meetings:', e);
        } finally {
            setLoading(false);
        }
    };

    const isActive = (m: MeetingItem) => m.status === 'pending' || m.status === 'confirmed';
    const isPast = (m: MeetingItem) => m.status === 'completed' || m.status === 'cancelled';
    const activeMeetings = meetings.filter(isActive);
    const pastMeetings = meetings.filter(isPast);
    const filteredActive = activeMeetings.filter(m => {
        if (activeFilter === 'Upcoming') return true;
        if (activeFilter === 'Personal') return m.type === 'personal';
        if (activeFilter === 'Group') return m.type === 'group';
        if (activeFilter === 'Past') return false;
        return true;
    });
    const showPastSection = activeFilter === 'All' || activeFilter === 'Past';
    const upcomingCount = activeMeetings.length;

    const openActionSheet = (m: MeetingItem) => {
        setActionMeeting(m);
        setShowActionSheet(true);
        Animated.spring(actionSheetAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    };
    const closeActionSheet = () => {
        Animated.timing(actionSheetAnim, { toValue: 300, useNativeDriver: true, duration: 220 }).start(() => {
            setShowActionSheet(false);
            setActionMeeting(null);
        });
    };

    const openDetail = (m: MeetingItem) => { setDetailMeeting(m); setShowDetail(true); };

    const openEditForm = (m: MeetingItem) => {
        setEditingMeeting(m);
        const dt = new Date(m.dateTime);
        const cal = new Date(dt); cal.setDate(1);
        setFormData({ title: m.sessionTitle, description: m.description, type: m.type, duration: String(m.duration), zoomLink: m.meetingLink, dateTime: dt });
        setCalendarMonth(cal);
        setShowFormModal(true);
    };

    const openCreateForm = () => {
        setEditingMeeting(null);
        setFormData(emptyForm());
        setShowDatePicker(false);
        setShowTimePicker(false);
        setShowFormModal(true);
    };

    const handleSubmitForm = async () => {
        if (!formData.title.trim()) { AppNotify.toast('Please enter a meeting title.', 'error'); return; }
        if (formData.dateTime <= new Date()) { AppNotify.toast('Please select a future date and time.', 'error'); return; }
        setFormLoading(true);
        try {
            const payload = {
                topic: formData.title, sessionTitle: formData.title, description: formData.description,
                type: formData.type, duration: parseInt(formData.duration), dateTime: formData.dateTime.toISOString(),
                meetingLink: formData.zoomLink.trim() || undefined,
            };
            if (editingMeeting) {
                await expertDashboardAPI.updateMeeting(editingMeeting.id, payload);
                AppNotify.toast('Meeting updated successfully!', 'success');
            } else {
                await expertDashboardAPI.createMeeting(payload);
                AppNotify.toast('Meeting created successfully!', 'success');
            }
            setShowFormModal(false);
            setEditingMeeting(null);
            loadMeetings();
        } catch (e: any) {
            AppNotify.toast(e?.response?.data?.message || e?.message || 'Failed to save meeting.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (m: MeetingItem) => {
        closeActionSheet();
        setTimeout(() => {
            AppNotify.confirm('Delete Meeting', `Delete "${m.sessionTitle}"? This cannot be undone.`, async () => {
                try {
                    await expertDashboardAPI.deleteMeeting(m.id);
                    AppNotify.toast('Meeting deleted.', 'success');
                    loadMeetings();
                } catch (e: any) {
                    AppNotify.toast(e?.response?.data?.message || 'Failed to delete meeting.', 'error');
                }
            }, { confirmLabel: 'Delete', destructive: true });
        }, 300);
    };

    const handleMarkCompleted = async (m: MeetingItem) => {
        closeActionSheet();
        try {
            await expertDashboardAPI.updateMeeting(m.id, { status: 'completed' });
            AppNotify.toast('Meeting marked as completed.', 'success');
            loadMeetings();
        } catch {
            AppNotify.toast('Failed to update meeting.', 'error');
        }
    };

    const handleConfirmMeeting = async (m: MeetingItem) => {
        closeActionSheet();
        try {
            await expertDashboardAPI.updateMeeting(m.id, { status: 'confirmed' });
            AppNotify.toast('Meeting confirmed. Farmers can now see it.', 'success');
            loadMeetings();
        } catch {
            AppNotify.toast('Failed to confirm meeting.', 'error');
        }
    };

    const handlePostponeSubmit = async () => {
        if (!postponeMeeting) return;
        if (postponeDate <= new Date()) { AppNotify.toast('Please select a future date and time.', 'error'); return; }
        try {
            await expertDashboardAPI.updateMeeting(postponeMeeting.id, { dateTime: postponeDate.toISOString(), status: 'confirmed' });
            AppNotify.toast('Meeting rescheduled.', 'success');
            setShowPostpone(false);
            setPostponeMeeting(null);
            loadMeetings();
        } catch {
            AppNotify.toast('Failed to reschedule meeting.', 'error');
        }
    };

    const handleChatWithFarmer = async (meeting: MeetingItem) => {
        if (!meeting.farmerId) { AppNotify.toast('Farmer information not available.', 'error'); return; }
        setOpeningChat(meeting.id);
        try {
            const res = await chatAPI.createChat({ expertId: meeting.farmerId });
            const chat = res.data.data;
            navigation.navigate('ExpertChatDetail', { chatId: chat._id || chat.id, farmerName: meeting.farmerName });
        } catch (e: any) {
            AppNotify.toast(e?.response?.data?.message || 'Could not open chat.', 'error');
        } finally {
            setOpeningChat(null);
        }
    };

    const getMeetingTypeConfig = (type: string) => {
        if (type === 'personal') return { label: 'One-on-One', icon: 'person' as const, color: COLORS.secondary[500], bgColor: COLORS.secondary[50], accent: COLORS.secondary[400] };
        return { label: 'Group Session', icon: 'people' as const, color: COLORS.primary[600], bgColor: COLORS.primary[50], accent: COLORS.primary[400] };
    };

    const renderCalendar = (selectedDate: Date, calMonth: Date, onSelectDay: (day: number) => void, onPrevMonth: () => void, onNextMonth: () => void) => (
        <View style={styles.calendarPanel}>
            <View style={styles.calendarNav}>
                <TouchableOpacity onPress={onPrevMonth} style={styles.calendarNavBtn}>
                    <Ionicons name="chevron-back" size={20} color={COLORS.primary[500]} />
                </TouchableOpacity>
                <Text style={styles.calendarMonthLabel}>{MONTH_NAMES[calMonth.getMonth()]} {calMonth.getFullYear()}</Text>
                <TouchableOpacity onPress={onNextMonth} style={styles.calendarNavBtn}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary[500]} />
                </TouchableOpacity>
            </View>
            <View style={styles.calendarRow}>
                {DAY_NAMES.map(d => <Text key={d} style={styles.calendarDayHeader}>{d}</Text>)}
            </View>
            <View style={styles.calendarGrid}>
                {Array.from({ length: getFirstDay(calMonth) }).map((_, i) => <View key={`e${i}`} style={styles.calendarCell} />)}
                {Array.from({ length: getDaysInMonth(calMonth) }).map((_, i) => {
                    const day = i + 1;
                    const thisDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const isPastDay = thisDate < today;
                    const isSelected = isSameDay(thisDate, selectedDate);
                    return (
                        <TouchableOpacity key={day} style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                            onPress={() => !isPastDay && onSelectDay(day)} activeOpacity={isPastDay ? 1 : 0.7}>
                            <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected, isPastDay && styles.calendarDayPast]}>{day}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderTimePicker = (selectedDate: Date, onSelectHour: (h: number) => void, onSelectMinute: (m: number) => void) => (
        <View style={styles.timePanel}>
            <Text style={styles.timePanelLabel}>Hour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {HOURS.map(h => {
                    const sel = selectedDate.getHours() === h;
                    return (
                        <TouchableOpacity key={h} style={[styles.timeChip, sel && styles.timeChipSelected]} onPress={() => onSelectHour(h)}>
                            <Text style={[styles.timeChipText, sel && styles.timeChipTextSelected]}>{h.toString().padStart(2, '0')}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <Text style={styles.timePanelLabel}>Minute</Text>
            <View style={styles.minuteRow}>
                {MINUTES.map(m => {
                    const sel = selectedDate.getMinutes() === m;
                    return (
                        <TouchableOpacity key={m} style={[styles.timeChip, sel && styles.timeChipSelected]} onPress={() => onSelectMinute(m)}>
                            <Text style={[styles.timeChipText, sel && styles.timeChipTextSelected]}>:{m.toString().padStart(2, '0')}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderMeetingCard = (meeting: MeetingItem) => {
        const typeConfig = getMeetingTypeConfig(meeting.type);
        const regCount = meeting.registeredUsers?.length ?? meeting.attendees;
        return (
            <TouchableOpacity key={meeting.id} style={styles.meetingCard} activeOpacity={0.88} onPress={() => openDetail(meeting)}>
                <View style={[styles.cardAccent, { backgroundColor: typeConfig.accent }]} />
                <View style={styles.cardInner}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
                            <Ionicons name={typeConfig.icon} size={13} color={typeConfig.color} />
                            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                        </View>
                        <View style={styles.cardHeaderRight}>
                            <View style={styles.statusLive}>
                                <View style={styles.liveDot} />
                                <Text style={styles.statusLiveText}>{meeting.status === 'confirmed' ? 'Confirmed' : 'Upcoming'}</Text>
                            </View>
                            <TouchableOpacity style={styles.moreBtn} onPress={() => openActionSheet(meeting)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="ellipsis-vertical" size={18} color={COLORS.neutral[500]} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.meetingTitle} numberOfLines={1}>{meeting.sessionTitle}</Text>
                    {!!meeting.description && <Text style={styles.meetingDescription} numberOfLines={2}>{meeting.description}</Text>}
                    <View style={styles.meetingMetaRow}>
                        <View style={styles.metaChip}><Ionicons name="calendar-outline" size={12} color={COLORS.primary[600]} /><Text style={styles.metaChipText}>{formatDate(meeting.dateTime, i18n.language)}</Text></View>
                        <View style={styles.metaChip}><Ionicons name="time-outline" size={12} color={COLORS.primary[600]} /><Text style={styles.metaChipText}>{formatTime(meeting.dateTime, i18n.language)}</Text></View>
                        <View style={styles.metaChip}><Ionicons name="hourglass-outline" size={12} color={COLORS.primary[600]} /><Text style={styles.metaChipText}>{meeting.duration} min</Text></View>
                    </View>
                    {meeting.type === 'personal' && meeting.farmerName ? (
                        <View style={styles.farmerRow}>
                            <View style={styles.farmerInfoRow}>
                                <View style={styles.farmerMiniAvatar}><Text style={{ fontSize: 12 }}>?????</Text></View>
                                <Text style={styles.farmerInfoText}>{meeting.farmerName}</Text>
                                {!!meeting.farmerDistrict && <Text style={styles.farmerDistrict}> � {meeting.farmerDistrict}</Text>}
                            </View>
                            <TouchableOpacity style={styles.chatFarmerBtn} onPress={() => handleChatWithFarmer(meeting)} disabled={openingChat === meeting.id}>
                                <Ionicons name="chatbubble-ellipses-outline" size={13} color={COLORS.secondary[600]} />
                                <Text style={styles.chatFarmerBtnText}>Chat</Text>
                            </TouchableOpacity>
                        </View>
                    ) : meeting.type === 'group' ? (
                        <View style={styles.attendeesSection}>
                            <View style={styles.attendeesHeader}>
                                <Ionicons name="people-outline" size={13} color={COLORS.neutral[500]} />
                                <Text style={styles.attendeesText}>{regCount}/{meeting.maxAttendees} registered</Text>
                            </View>
                            <View style={styles.attendeesBarTrack}>
                                <View style={[styles.attendeesBarFill, { width: `${Math.min((regCount / meeting.maxAttendees) * 100, 100)}%` as any }]} />
                            </View>
                        </View>
                    ) : null}
                    <View style={styles.cardFooter}>
                        <Text style={styles.tapHint}>Tap to view details</Text>
                        {!!meeting.meetingLink && (
                            <TouchableOpacity style={[styles.joinButton, { backgroundColor: typeConfig.accent }]} activeOpacity={0.85}
                                onPress={() => Linking.openURL(meeting.meetingLink).catch(() => AppNotify.toast('Cannot open meeting link.', 'error'))}>
                                <Ionicons name="videocam" size={14} color="#fff" />
                                <Text style={styles.joinButtonText}>{meeting.type === 'personal' ? 'Start' : 'Join'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderPastCard = (meeting: MeetingItem) => {
        const typeConfig = getMeetingTypeConfig(meeting.type);
        const isCancelled = meeting.status === 'cancelled';
        const regCount = meeting.registeredUsers?.length ?? meeting.attendees;
        return (
            <TouchableOpacity key={meeting.id} style={styles.pastCard} activeOpacity={0.85} onPress={() => openDetail(meeting)}>
                <View style={[styles.pastCardAccent, { backgroundColor: isCancelled ? COLORS.error : COLORS.neutral[300] }]} />
                <View style={styles.cardInner}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
                            <Ionicons name={typeConfig.icon} size={12} color={typeConfig.color} />
                            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                        </View>
                        <View style={[styles.pastStatusBadge, { backgroundColor: isCancelled ? '#fee2e2' : '#dcfce7' }]}>
                            <Ionicons name={isCancelled ? 'close-circle' : 'checkmark-circle'} size={13} color={isCancelled ? COLORS.error : COLORS.success} />
                            <Text style={[styles.pastStatusText, { color: isCancelled ? COLORS.error : COLORS.success }]}>{isCancelled ? 'Cancelled' : 'Completed'}</Text>
                        </View>
                    </View>
                    <Text style={styles.pastMeetingTitle} numberOfLines={1}>{meeting.sessionTitle}</Text>
                    <View style={styles.pastMetaRow}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.neutral[400]} />
                        <Text style={styles.pastMetaText}>{formatDate(meeting.dateTime, i18n.language)} � {formatTime(meeting.dateTime, i18n.language)}</Text>
                        <Text style={styles.pastMetaDot}>�</Text>
                        <Ionicons name="hourglass-outline" size={12} color={COLORS.neutral[400]} />
                        <Text style={styles.pastMetaText}>{meeting.duration} min</Text>
                    </View>
                    {meeting.type === 'group' && <Text style={styles.pastAttendeesText}>{regCount} farmer{regCount !== 1 ? 's' : ''} attended</Text>}
                    {meeting.type === 'personal' && meeting.farmerName && <Text style={styles.pastAttendeesText}>With: {meeting.farmerName}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetailModal = () => {
        if (!detailMeeting) return null;
        const m = detailMeeting;
        const typeConfig = getMeetingTypeConfig(m.type);
        const isUpcoming = isActive(m);
        const regCount = m.registeredUsers?.length ?? m.attendees;
        return (
            <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDetail(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.modalCloseBtn}>
                            <Ionicons name="chevron-down" size={24} color={COLORS.neutral[600]} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Meeting Details</Text>
                        {isUpcoming
                            ? <TouchableOpacity onPress={() => { setShowDetail(false); setTimeout(() => openEditForm(m), 200); }}><Text style={styles.editLink}>Edit</Text></TouchableOpacity>
                            : <View style={{ width: 40 }} />}
                    </View>
                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={[styles.detailBand, { backgroundColor: typeConfig.bgColor, borderColor: typeConfig.bgColor }]}>
                            <View style={[styles.detailTypeIcon, { backgroundColor: typeConfig.color }]}>
                                <Ionicons name={typeConfig.icon} size={22} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.detailTypeLabel, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                                <Text style={styles.detailTitle}>{m.sessionTitle}</Text>
                            </View>
                            <View style={[styles.detailStatusBadge, { backgroundColor: isUpcoming ? '#dcfce7' : m.status === 'cancelled' ? '#fee2e2' : '#f3f4f6' }]}>
                                <Text style={[styles.detailStatusText, { color: isUpcoming ? COLORS.success : m.status === 'cancelled' ? COLORS.error : COLORS.neutral[500] }]}>
                                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                        {!!m.description && <View style={styles.detailSection}><Text style={styles.detailSectionTitle}>DESCRIPTION</Text><Text style={styles.detailBodyText}>{m.description}</Text></View>}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailSectionTitle}>SCHEDULE</Text>
                            <View style={styles.detailInfoGrid}>
                                <View style={styles.detailInfoItem}><View style={[styles.detailInfoIcon, { backgroundColor: COLORS.primary[50] }]}><Ionicons name="calendar" size={18} color={COLORS.primary[600]} /></View><View><Text style={styles.detailInfoLabel}>Date</Text><Text style={styles.detailInfoValue}>{formatDate(m.dateTime, i18n.language)}</Text></View></View>
                                <View style={styles.detailInfoItem}><View style={[styles.detailInfoIcon, { backgroundColor: COLORS.primary[50] }]}><Ionicons name="time" size={18} color={COLORS.primary[600]} /></View><View><Text style={styles.detailInfoLabel}>Time</Text><Text style={styles.detailInfoValue}>{formatTime(m.dateTime, i18n.language)}</Text></View></View>
                                <View style={styles.detailInfoItem}><View style={[styles.detailInfoIcon, { backgroundColor: COLORS.primary[50] }]}><Ionicons name="hourglass" size={18} color={COLORS.primary[600]} /></View><View><Text style={styles.detailInfoLabel}>Duration</Text><Text style={styles.detailInfoValue}>{m.duration} minutes</Text></View></View>
                            </View>
                        </View>
                        {m.type === 'personal' && m.farmerName && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailSectionTitle}>FARMER</Text>
                                <View style={styles.detailFarmerCard}>
                                    <View style={styles.detailFarmerAvatar}><Text style={{ fontSize: 22 }}>?????</Text></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.detailFarmerName}>{m.farmerName}</Text>
                                        {!!m.farmerDistrict && <Text style={styles.detailFarmerDistrict}>{m.farmerDistrict}</Text>}
                                    </View>
                                    <TouchableOpacity style={styles.detailChatBtn} onPress={() => { setShowDetail(false); setTimeout(() => handleChatWithFarmer(m), 200); }}>
                                        <Ionicons name="chatbubble-ellipses-outline" size={15} color={COLORS.secondary[600]} />
                                        <Text style={styles.detailChatBtnText}>Chat</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        {m.type === 'group' && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailSectionTitle}>REGISTERED FARMERS ({regCount}/{m.maxAttendees})</Text>
                                <View style={styles.attendeesBarTrack}>
                                    <View style={[styles.attendeesBarFill, { width: `${Math.min((regCount / m.maxAttendees) * 100, 100)}%` as any }]} />
                                </View>
                                {m.registeredUsers.length > 0 ? (
                                    <View style={styles.registeredList}>
                                        {m.registeredUsers.map((u, idx) => (
                                            <View key={u._id || idx} style={styles.registeredItem}>
                                                <View style={styles.registeredAvatar}><Text style={{ fontSize: 14 }}>?????</Text></View>
                                                <View><Text style={styles.registeredName}>{u.name}</Text>{!!u.district && <Text style={styles.registeredDistrict}>{u.district}</Text>}</View>
                                            </View>
                                        ))}
                                    </View>
                                ) : <Text style={styles.noRegistrationsText}>No farmers registered yet.</Text>}
                            </View>
                        )}
                        {!!m.meetingLink && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailSectionTitle}>MEETING LINK</Text>
                                <TouchableOpacity style={styles.linkCard} onPress={() => Linking.openURL(m.meetingLink).catch(() => AppNotify.toast('Cannot open link.', 'error'))}>
                                    <Ionicons name="videocam-outline" size={18} color={COLORS.primary[600]} />
                                    <Text style={styles.linkText} numberOfLines={1}>{m.meetingLink}</Text>
                                    <Ionicons name="open-outline" size={16} color={COLORS.primary[500]} />
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={{ height: 24 }} />
                    </ScrollView>
                    {isUpcoming && !!m.meetingLink && (
                        <View style={styles.detailFooter}>
                            <TouchableOpacity style={[styles.detailFooterBtn, { backgroundColor: typeConfig.accent, flex: 1 }]}
                                onPress={() => Linking.openURL(m.meetingLink).catch(() => AppNotify.toast('Cannot open link.', 'error'))}>
                                <Ionicons name="videocam" size={18} color="#fff" />
                                <Text style={styles.detailFooterBtnText}>{m.type === 'personal' ? 'Start Session' : 'Start Meeting'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        );
    };

    const renderActionSheet = () => (
        <Modal visible={showActionSheet} transparent animationType="none" onRequestClose={closeActionSheet}>
            <TouchableOpacity style={styles.actionSheetOverlay} activeOpacity={1} onPress={closeActionSheet} />
            <Animated.View style={[styles.actionSheet, { transform: [{ translateY: actionSheetAnim }] }]}>
                <View style={styles.actionSheetHandle} />
                {actionMeeting && <Text style={styles.actionSheetTitle} numberOfLines={1}>{actionMeeting.sessionTitle}</Text>}
                <TouchableOpacity style={styles.actionSheetItem} onPress={() => { closeActionSheet(); if (actionMeeting) setTimeout(() => openDetail(actionMeeting), 300); }}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: COLORS.primary[50] }]}><Ionicons name="eye-outline" size={20} color={COLORS.primary[600]} /></View>
                    <Text style={styles.actionSheetLabel}>View Details</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionSheetItem} onPress={() => { closeActionSheet(); if (actionMeeting) setTimeout(() => openEditForm(actionMeeting), 300); }}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#dbeafe' }]}><Ionicons name="pencil-outline" size={20} color={COLORS.info} /></View>
                    <Text style={styles.actionSheetLabel}>Edit Meeting</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionSheetItem} onPress={() => {
                    closeActionSheet();
                    if (actionMeeting) {
                        const dt = new Date(actionMeeting.dateTime); dt.setDate(dt.getDate() + 1);
                        setPostponeDate(dt);
                        const cal = new Date(dt); cal.setDate(1); setPostponeCalMonth(cal);
                        setPostponeMeeting(actionMeeting);
                        setTimeout(() => setShowPostpone(true), 300);
                    }
                }}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#fef3c7' }]}><Ionicons name="calendar-outline" size={20} color={COLORS.warning} /></View>
                    <Text style={styles.actionSheetLabel}>Postpone / Reschedule</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>
                {actionMeeting?.status === 'pending' && (
                    <TouchableOpacity style={styles.actionSheetItem} onPress={() => actionMeeting && handleConfirmMeeting(actionMeeting)}>
                        <View style={[styles.actionSheetIcon, { backgroundColor: '#dcfce7' }]}><Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} /></View>
                        <Text style={styles.actionSheetLabel}>Confirm for Farmers</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionSheetItem} onPress={() => actionMeeting && handleMarkCompleted(actionMeeting)}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#dcfce7' }]}><Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} /></View>
                    <Text style={styles.actionSheetLabel}>Mark as Completed</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionSheetItem]} onPress={() => actionMeeting && handleDelete(actionMeeting)}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#fee2e2' }]}><Ionicons name="trash-outline" size={20} color={COLORS.error} /></View>
                    <Text style={[styles.actionSheetLabel, { color: COLORS.error }]}>Delete Meeting</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionSheetCancel} onPress={closeActionSheet}>
                    <Text style={styles.actionSheetCancelText}>Cancel</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );

    const renderFormModal = () => (
        <Modal visible={showFormModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFormModal(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowFormModal(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={24} color={COLORS.neutral[600]} /></TouchableOpacity>
                    <Text style={styles.modalTitle}>{editingMeeting ? 'Edit Meeting' : 'Create Meeting'}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Meeting Type</Text>
                        <View style={styles.typeSelector}>
                            {(['group', 'personal'] as const).map(t => (
                                <TouchableOpacity key={t} style={[styles.typeOption, formData.type === t && styles.typeOptionActive]} onPress={() => setFormData(prev => ({ ...prev, type: t }))}>
                                    <Ionicons name={t === 'group' ? 'people' : 'person'} size={20} color={formData.type === t ? (t === 'group' ? COLORS.primary[600] : COLORS.secondary[600]) : COLORS.neutral[400]} />
                                    <Text style={[styles.typeOptionText, formData.type === t && { color: t === 'group' ? COLORS.primary[600] : COLORS.secondary[600] }]}>{t === 'group' ? 'Group Session' : 'One-on-One'}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Title</Text>
                        <TextInput style={styles.formInput} placeholder="Enter meeting title..." placeholderTextColor={COLORS.neutral[400]} value={formData.title} onChangeText={text => setFormData(prev => ({ ...prev, title: text }))} />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Description</Text>
                        <TextInput style={[styles.formInput, styles.formTextarea]} placeholder="Enter meeting description..." placeholderTextColor={COLORS.neutral[400]} value={formData.description} onChangeText={text => setFormData(prev => ({ ...prev, description: text }))} multiline numberOfLines={4} textAlignVertical="top" />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Duration (minutes)</Text>
                        <View style={styles.durationSelector}>
                            {['30', '45', '60', '90'].map(dur => (
                                <TouchableOpacity key={dur} style={[styles.durationOption, formData.duration === dur && styles.durationOptionActive]} onPress={() => setFormData(prev => ({ ...prev, duration: dur }))}>
                                    <Text style={[styles.durationText, formData.duration === dur && styles.durationTextActive]}>{dur}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Date</Text>
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => { setShowDatePicker(v => !v); setShowTimePicker(false); }}>
                            <Ionicons name="calendar-outline" size={18} color={COLORS.primary[500]} />
                            <Text style={styles.datePickerText}>{formData.dateTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                            <Ionicons name={showDatePicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                        {showDatePicker && renderCalendar(formData.dateTime, calendarMonth,
                            (day) => { const sel = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day); setFormData(prev => { const d = new Date(prev.dateTime); d.setFullYear(sel.getFullYear(), sel.getMonth(), sel.getDate()); return { ...prev, dateTime: d }; }); setShowDatePicker(false); },
                            () => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
                            () => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
                        )}
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Time</Text>
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => { setShowTimePicker(v => !v); setShowDatePicker(false); }}>
                            <Ionicons name="time-outline" size={18} color={COLORS.primary[500]} />
                            <Text style={styles.datePickerText}>{formData.dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                            <Ionicons name={showTimePicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                        {showTimePicker && renderTimePicker(formData.dateTime,
                            (h) => setFormData(prev => { const d = new Date(prev.dateTime); d.setHours(h); return { ...prev, dateTime: d }; }),
                            (mi) => { setFormData(prev => { const d = new Date(prev.dateTime); d.setMinutes(mi); return { ...prev, dateTime: d }; }); setShowTimePicker(false); },
                        )}
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Zoom / Meeting Link (optional)</Text>
                        <View style={styles.linkInputRow}>
                            <Ionicons name="videocam-outline" size={18} color={COLORS.primary[500]} style={{ marginRight: 8 }} />
                            <TextInput style={[styles.formInput, { flex: 1, borderWidth: 0, padding: 14, paddingLeft: 0 }]} placeholder="https://zoom.us/j/..." placeholderTextColor={COLORS.neutral[400]} value={formData.zoomLink} onChangeText={text => setFormData(prev => ({ ...prev, zoomLink: text }))} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
                        </View>
                    </View>
                    <View style={{ height: 16 }} />
                </ScrollView>
                <View style={styles.modalFooter}>
                    <PrimaryButton title={formLoading ? 'Saving...' : (editingMeeting ? 'Save Changes' : 'Create Meeting')} onPress={handleSubmitForm} icon={editingMeeting ? 'save' : 'calendar'} fullWidth />
                </View>
            </View>
        </Modal>
    );

    const renderPostponeModal = () => (
        <Modal visible={showPostpone} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPostpone(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowPostpone(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={24} color={COLORS.neutral[600]} /></TouchableOpacity>
                    <Text style={styles.modalTitle}>Reschedule Meeting</Text>
                    <View style={{ width: 40 }} />
                </View>
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {postponeMeeting && (
                        <View style={styles.postponeMeetingInfo}>
                            <Ionicons name="calendar-outline" size={16} color={COLORS.warning} />
                            <Text style={styles.postponeMeetingTitle}>{postponeMeeting.sessionTitle}</Text>
                        </View>
                    )}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>New Date</Text>
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => { setShowPostponeDatePicker(v => !v); setShowPostponeTimePicker(false); }}>
                            <Ionicons name="calendar-outline" size={18} color={COLORS.warning} />
                            <Text style={styles.datePickerText}>{postponeDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                            <Ionicons name={showPostponeDatePicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                        {showPostponeDatePicker && renderCalendar(postponeDate, postponeCalMonth,
                            (day) => { const sel = new Date(postponeCalMonth.getFullYear(), postponeCalMonth.getMonth(), day); setPostponeDate(prev => { const d = new Date(prev); d.setFullYear(sel.getFullYear(), sel.getMonth(), sel.getDate()); return d; }); setShowPostponeDatePicker(false); },
                            () => setPostponeCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
                            () => setPostponeCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
                        )}
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>New Time</Text>
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => { setShowPostponeTimePicker(v => !v); setShowPostponeDatePicker(false); }}>
                            <Ionicons name="time-outline" size={18} color={COLORS.warning} />
                            <Text style={styles.datePickerText}>{postponeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                            <Ionicons name={showPostponeTimePicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                        {showPostponeTimePicker && renderTimePicker(postponeDate,
                            (h) => setPostponeDate(prev => { const d = new Date(prev); d.setHours(h); return d; }),
                            (mi) => { setPostponeDate(prev => { const d = new Date(prev); d.setMinutes(mi); return d; }); setShowPostponeTimePicker(false); },
                        )}
                    </View>
                    <View style={{ height: 16 }} />
                </ScrollView>
                <View style={styles.modalFooter}>
                    <PrimaryButton title="Confirm Reschedule" onPress={handlePostponeSubmit} icon="calendar" fullWidth />
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <Header title="My Meetings" showBack onBackPress={() => navigation.goBack()} rightContent={
                <TouchableOpacity style={styles.addButton} onPress={openCreateForm}>
                    <Ionicons name="add" size={22} color="#ffffff" />
                </TouchableOpacity>
            } />

            <View style={styles.statsBar}>
                <View style={[styles.statCard, { borderTopColor: COLORS.primary[400] }]}>
                    <View style={[styles.statIconBox, { backgroundColor: COLORS.primary[50] }]}><Ionicons name="calendar" size={18} color={COLORS.primary[500]} /></View>
                    <Text style={styles.statNumber}>{upcomingCount}</Text>
                    <Text style={styles.statText}>Upcoming</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: COLORS.secondary[400] }]}>
                    <View style={[styles.statIconBox, { backgroundColor: COLORS.secondary[50] }]}><Ionicons name="people" size={18} color={COLORS.secondary[500]} /></View>
                    <Text style={styles.statNumber}>{meetings.filter(m => m.type === 'group').length}</Text>
                    <Text style={styles.statText}>Group</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: COLORS.info }]}>
                    <View style={[styles.statIconBox, { backgroundColor: '#dbeafe' }]}><Ionicons name="person" size={18} color={COLORS.info} /></View>
                    <Text style={styles.statNumber}>{meetings.filter(m => m.type === 'personal').length}</Text>
                    <Text style={styles.statText}>Personal</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: COLORS.neutral[300] }]}>
                    <View style={[styles.statIconBox, { backgroundColor: COLORS.neutral[100] }]}><Ionicons name="archive" size={18} color={COLORS.neutral[500]} /></View>
                    <Text style={styles.statNumber}>{pastMeetings.length}</Text>
                    <Text style={styles.statText}>Past</Text>
                </View>
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {MEETING_FILTERS.map(filter => (
                        <Chip key={filter} label={filter} selected={activeFilter === filter} onPress={() => setActiveFilter(filter)} variant="outline" size="sm" style={{ marginRight: 8 }} />
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {activeFilter !== 'Past' && (
                    filteredActive.length > 0
                        ? filteredActive.map(renderMeetingCard)
                        : activeFilter !== 'All' && (
                            <View style={styles.emptyWrapper}>
                                <EmptyState icon="calendar-outline" title="No meetings found" description="No meetings match the selected filter." />
                                <TouchableOpacity style={styles.emptyCreateBtn} onPress={openCreateForm} activeOpacity={0.85}>
                                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                    <Text style={styles.emptyCreateBtnText}>Schedule a Meeting</Text>
                                </TouchableOpacity>
                            </View>
                        )
                )}
                {showPastSection && pastMeetings.length > 0 && (
                    <View style={styles.pastSection}>
                        <View style={styles.pastSectionHeader}>
                            <Ionicons name="archive-outline" size={16} color={COLORS.neutral[500]} />
                            <Text style={styles.pastSectionTitle}>Past & Completed Meetings</Text>
                            <Text style={styles.pastSectionCount}>{pastMeetings.length}</Text>
                        </View>
                        {pastMeetings.map(renderPastCard)}
                    </View>
                )}
                {meetings.length === 0 && !loading && (
                    <View style={styles.emptyWrapper}>
                        <EmptyState icon="calendar-outline" title="No meetings yet" description="Schedule your first meeting session to get started." />
                        <TouchableOpacity style={styles.emptyCreateBtn} onPress={openCreateForm} activeOpacity={0.85}>
                            <Ionicons name="add-circle-outline" size={18} color="#fff" />
                            <Text style={styles.emptyCreateBtnText}>Schedule a Meeting</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ height: 32 }} />
            </ScrollView>

            {renderDetailModal()}
            {renderFormModal()}
            {renderPostponeModal()}
            {renderActionSheet()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },
    addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary[600], alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
    statsBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 12, marginBottom: 4 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.neutral[100], ...SHADOW.sm },
    statIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
    statNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.neutral[800] },
    statText: { fontSize: 10, color: COLORS.neutral[400], marginTop: 2, fontWeight: '500' },
    filtersContainer: { paddingVertical: 12 },
    filtersContent: { paddingHorizontal: 16 },
    scrollView: { flex: 1, paddingHorizontal: 16 },
    meetingCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.neutral[100], flexDirection: 'row', overflow: 'hidden', ...SHADOW.sm },
    cardAccent: { width: 4 },
    cardInner: { flex: 1, padding: 14 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 50 },
    typeBadgeText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
    statusLive: { flexDirection: 'row', alignItems: 'center' },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 5 },
    statusLiveText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
    moreBtn: { padding: 2 },
    meetingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.neutral[800], marginBottom: 4 },
    meetingDescription: { fontSize: 13, color: COLORS.neutral[500], lineHeight: 18, marginBottom: 8 },
    meetingMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary[50], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
    metaChipText: { fontSize: 11, fontWeight: '600', color: COLORS.primary[700] },
    farmerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    farmerInfoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary[50], paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flex: 1 },
    chatFarmerBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.secondary[300], backgroundColor: COLORS.secondary[50], borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 4, marginLeft: 8 },
    chatFarmerBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.secondary[600] },
    farmerMiniAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary[100], alignItems: 'center', justifyContent: 'center', marginRight: 6 },
    farmerInfoText: { fontSize: 13, color: COLORS.secondary[700], fontWeight: '500' },
    farmerDistrict: { fontSize: 12, color: COLORS.neutral[400] },
    attendeesSection: { marginBottom: 8 },
    attendeesHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
    attendeesText: { fontSize: 12, color: COLORS.neutral[500], fontWeight: '500' },
    attendeesBarTrack: { height: 5, backgroundColor: COLORS.neutral[100], borderRadius: 3, overflow: 'hidden' },
    attendeesBarFill: { height: '100%', backgroundColor: COLORS.primary[400], borderRadius: 3 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
    tapHint: { fontSize: 11, color: COLORS.neutral[300], fontStyle: 'italic' },
    joinButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8, gap: 5 },
    joinButtonText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    pastSection: { marginTop: 4 },
    pastSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    pastSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.neutral[500], flex: 1 },
    pastSectionCount: { fontSize: 12, fontWeight: '700', color: '#fff', backgroundColor: COLORS.neutral[400], paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    pastCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.neutral[100], flexDirection: 'row', overflow: 'hidden', opacity: 0.85 },
    pastCardAccent: { width: 4 },
    pastStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, gap: 4 },
    pastStatusText: { fontSize: 11, fontWeight: '600' },
    pastMeetingTitle: { fontSize: 14, fontWeight: '600', color: COLORS.neutral[700], marginBottom: 4 },
    pastMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pastMetaText: { fontSize: 12, color: COLORS.neutral[400] },
    pastMetaDot: { color: COLORS.neutral[300], marginHorizontal: 2 },
    pastAttendeesText: { fontSize: 12, color: COLORS.neutral[400], marginTop: 4 },
    emptyWrapper: { alignItems: 'center', paddingTop: 16 },
    emptyCreateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary[600], paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8, ...SHADOW.sm },
    emptyCreateBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    actionSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    actionSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, paddingTop: 12, paddingHorizontal: 16, ...SHADOW.md },
    actionSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.neutral[200], alignSelf: 'center', marginBottom: 14 },
    actionSheetTitle: { fontSize: 14, fontWeight: '700', color: COLORS.neutral[700], marginBottom: 12, paddingHorizontal: 4 },
    actionSheetItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderRadius: 12 },
    actionSheetIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionSheetLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.neutral[800] },
    actionSheetCancel: { marginTop: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.neutral[100], alignItems: 'center' },
    actionSheetCancelText: { fontSize: 15, fontWeight: '700', color: COLORS.neutral[600] },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100] },
    modalCloseBtn: { width: 40, alignItems: 'flex-start' },
    modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.neutral[800] },
    editLink: { fontSize: 14, fontWeight: '700', color: COLORS.primary[600] },
    modalContent: { flex: 1, padding: 16 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.neutral[100] },
    detailBand: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 14, padding: 14, marginBottom: 4, borderWidth: 1 },
    detailTypeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    detailTypeLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 },
    detailTitle: { fontSize: 16, fontWeight: '700', color: COLORS.neutral[800], flexShrink: 1 },
    detailStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
    detailStatusText: { fontSize: 12, fontWeight: '700' },
    detailSection: { marginTop: 20 },
    detailSectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.neutral[400], letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 },
    detailBodyText: { fontSize: 14, color: COLORS.neutral[600], lineHeight: 22 },
    detailInfoGrid: { gap: 12 },
    detailInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailInfoIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    detailInfoLabel: { fontSize: 11, color: COLORS.neutral[400], fontWeight: '600', textTransform: 'uppercase' },
    detailInfoValue: { fontSize: 14, fontWeight: '600', color: COLORS.neutral[800], marginTop: 2 },
    detailFarmerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary[50], borderRadius: 12, padding: 12, gap: 12 },
    detailFarmerAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary[100], alignItems: 'center', justifyContent: 'center' },
    detailFarmerName: { fontSize: 15, fontWeight: '700', color: COLORS.neutral[800] },
    detailFarmerDistrict: { fontSize: 12, color: COLORS.neutral[400], marginTop: 2 },
    detailChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: COLORS.secondary[300], backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    detailChatBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary[600] },
    registeredList: { gap: 8, marginTop: 8 },
    registeredItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.neutral[50], borderRadius: 10 },
    registeredAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary[100], alignItems: 'center', justifyContent: 'center' },
    registeredName: { fontSize: 14, fontWeight: '600', color: COLORS.neutral[800] },
    registeredDistrict: { fontSize: 12, color: COLORS.neutral[400] },
    noRegistrationsText: { fontSize: 13, color: COLORS.neutral[400], marginTop: 8, textAlign: 'center' },
    linkCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primary[50], borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.primary[100] },
    linkText: { flex: 1, fontSize: 13, color: COLORS.primary[700], fontWeight: '500' },
    detailFooter: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.neutral[100] },
    detailFooterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12 },
    detailFooterBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    formGroup: { marginBottom: 20 },
    formLabel: { fontSize: 12, fontWeight: '700', color: COLORS.neutral[500], letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
    formInput: { backgroundColor: COLORS.neutral[50], borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.neutral[800], borderWidth: 1, borderColor: COLORS.neutral[200] },
    formTextarea: { minHeight: 100 },
    typeSelector: { flexDirection: 'row', gap: 12 },
    typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.neutral[200] },
    typeOptionActive: { borderColor: COLORS.primary[400], backgroundColor: COLORS.primary[50] },
    typeOptionText: { fontSize: 14, fontWeight: '500', color: COLORS.neutral[500], marginLeft: 8 },
    durationSelector: { flexDirection: 'row', gap: 12 },
    durationOption: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.neutral[200] },
    durationOptionActive: { borderColor: COLORS.primary[400], backgroundColor: COLORS.primary[50] },
    durationText: { fontSize: 16, fontWeight: '600', color: COLORS.neutral[500] },
    durationTextActive: { color: COLORS.primary[600] },
    datePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.neutral[50], borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.neutral[200] },
    datePickerText: { fontSize: 14, color: COLORS.neutral[800], marginLeft: 8 },
    linkInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.neutral[50], borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.neutral[200] },
    postponeMeetingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef3c7', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#fde68a' },
    postponeMeetingTitle: { fontSize: 14, fontWeight: '600', color: COLORS.neutral[700], flex: 1 },
    calendarPanel: { marginTop: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLORS.neutral[200], padding: 12 },
    calendarNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    calendarNavBtn: { padding: 6 },
    calendarMonthLabel: { fontSize: 14, fontWeight: '600', color: COLORS.neutral[800] },
    calendarRow: { flexDirection: 'row', marginBottom: 4 },
    calendarDayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: COLORS.neutral[400], paddingVertical: 4 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calendarCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    calendarCellSelected: { backgroundColor: COLORS.primary[500] },
    calendarDayText: { fontSize: 13, color: COLORS.neutral[700] },
    calendarDayTextSelected: { color: '#fff', fontWeight: '700' },
    calendarDayPast: { color: COLORS.neutral[300] },
    timePanel: { marginTop: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLORS.neutral[200], padding: 12 },
    timePanelLabel: { fontSize: 11, fontWeight: '700', color: COLORS.neutral[500], marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    minuteRow: { flexDirection: 'row', gap: 8 },
    timeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.neutral[200], marginRight: 8, backgroundColor: COLORS.neutral[50] },
    timeChipSelected: { borderColor: COLORS.primary[500], backgroundColor: COLORS.primary[500] },
    timeChipText: { fontSize: 14, fontWeight: '600', color: COLORS.neutral[600] },
    timeChipTextSelected: { color: '#fff' },
});

export default ExpertMeetings;
