import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, Linking, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../components';
import { COLORS } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/validators';
import { meetingAPI, chatAPI } from '../../services/api';

type ParamList = {
    MeetingDetails: { meetingId: string };
};

const MeetingDetails: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'MeetingDetails'>>();
    const { meetingId } = route.params;
    const { t, i18n } = useTranslation();

    const [reminderSet, setReminderSet] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [togglingReminder, setTogglingReminder] = useState(false);
    const [openingChat, setOpeningChat] = useState(false);

    useEffect(() => {
        loadMeeting();
    }, []);

    const loadMeeting = async () => {
        try {
            const res = await meetingAPI.getSessionById(meetingId);
            const m = res.data.data;
            setMeeting({
                id: m._id || m.id,
                expertId: m.expert?._id || m.expertId || m.expertId?.toString() || '',
                title: m.topic || m.title || '',
                titleSi: m.topicSi || m.titleSi || m.topic || '',
                expertName: m.expert?.name || m.expertName || '',
                expertSpecialty: m.expert?.specialty || '',
                dateTime: m.dateTime || m.createdAt,
                duration: m.duration || 60,
                description: m.description || '',
                descriptionSi: m.descriptionSi || m.description || '',
                attendees: m.attendees?.length || m.attendees || 0,
                maxAttendees: m.maxAttendees || 50,
                meetingLink: m.meetingLink,
                reminderSet: m.reminderSet || false,
            });
            setIsRegistered(m.isRegistered || false);
            setReminderSet(m.isRegistered || false); // reminder ≈ registered for group sessions
        } catch (e) {
            console.error('Failed to load meeting:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header title={t('meetings.meeting_details')} showBack onBackPress={() => navigation.goBack()} />
                <View style={styles.errorContainer}><Text>Loading...</Text></View>
            </View>
        );
    }

    if (!meeting) {
        return (
            <View style={styles.container}>
                <Header
                    title={t('meetings.meeting_details')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Meeting not found</Text>
                </View>
            </View>
        );
    }

    // Setting reminder for a group session = register for the session
    // This makes it appear in the farmer's MyMeetings (pending)
    const handleSetReminder = async () => {
        setTogglingReminder(true);
        try {
            if (!isRegistered) {
                // Register for the session → it will appear in MyMeetings as pending
                await meetingAPI.registerForSession(meeting.id);
                setIsRegistered(true);
                setReminderSet(true);
                setMeeting((prev: any) => ({ ...prev, attendees: prev.attendees + 1 }));
                Alert.alert(
                    '🔔 Reminder Set',
                    'You are registered for this session. It will appear in My Meetings.'
                );
            } else {
                // Already registered — just toggle reminder indicator locally
                const newVal = !reminderSet;
                setReminderSet(newVal);
                Alert.alert(
                    newVal ? '🔔 Reminder On' : '🔕 Reminder Off',
                    newVal ? 'You will be reminded before the session.' : 'Reminder removed.'
                );
            }
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Could not set reminder.');
        } finally {
            setTogglingReminder(false);
        }
    };

    const handleJoinMeeting = () => {
        if (!meeting.meetingLink) {
            Alert.alert('Error', 'No meeting link available yet.');
            return;
        }
        Linking.openURL(meeting.meetingLink).catch(() =>
            Alert.alert('Error', 'Cannot open meeting link.')
        );
    };

    const handleChatWithExpert = async () => {
        if (!meeting.expertId) {
            Alert.alert('Error', 'Expert information not available.');
            return;
        }
        setOpeningChat(true);
        try {
            const res = await chatAPI.createChat({ expertId: meeting.expertId });
            const chat = res.data.data;
            navigation.navigate('ChatDetail', {
                chatId: chat._id || chat.id,
                expertName: meeting.expertName,
            });
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Could not open chat.');
        } finally {
            setOpeningChat(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('meetings.meeting_details')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Meeting Card */}
                <View style={styles.meetingCardBanner}>
                    <View style={styles.bannerHeader}>
                        <View style={styles.bannerIconContainer}>
                            <Ionicons name="videocam" size={28} color="white" />
                        </View>
                        <View style={styles.bannerTextContainer}>
                            <Text style={styles.bannerSubtitle}>Expert Session</Text>
                            <Text style={styles.bannerTitle}>
                                {i18n.language === 'si' ? meeting.titleSi : meeting.title}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bannerDetails}>
                        <View style={styles.bannerInfoRow}>
                            <Ionicons name="calendar" size={18} color="white" />
                            <Text style={styles.bannerInfoText}>
                                {formatDate(meeting.dateTime, i18n.language)}
                            </Text>
                        </View>
                        <View style={styles.bannerInfoRow}>
                            <Ionicons name="time" size={18} color="white" />
                            <Text style={styles.bannerInfoText}>
                                {formatTime(meeting.dateTime, i18n.language)} ({meeting.duration} min)
                            </Text>
                        </View>
                        <View style={styles.bannerInfoRowFinal}>
                            <Ionicons name="people" size={18} color="white" />
                            <Text style={styles.bannerInfoText}>
                                {meeting.attendees}/{meeting.maxAttendees} attendees
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Expert Info */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>
                            {t('meetings.expert')}
                        </Text>
                        <View style={styles.expertRow}>
                            <View style={styles.expertIconContainer}>
                                <Ionicons name="person" size={24} color={COLORS.secondary[600]} />
                            </View>
                            <View>
                                <Text style={styles.expertName}>
                                    {meeting.expertName}
                                </Text>
                                <Text style={styles.expertRole}>Agricultural Expert</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>
                            About This Session
                        </Text>
                        <Text style={styles.descriptionText}>
                            {i18n.language === 'si' ? meeting.descriptionSi : meeting.description}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title={reminderSet ? t('meetings.reminder_set') : t('meetings.set_reminder')}
                                onPress={handleSetReminder}
                                disabled={togglingReminder}
                                icon={togglingReminder ? undefined : reminderSet ? 'notifications' : 'notifications-outline'}
                                variant="outline"
                                fullWidth
                            />
                        </View>
                        <View style={styles.spacer} />
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title={t('meetings.join_meeting')}
                                onPress={handleJoinMeeting}
                                icon="videocam"
                                fullWidth
                            />
                        </View>
                    </View>

                    {/* Chat with Expert */}
                    <TouchableOpacity
                        style={styles.chatExpertBtn}
                        onPress={handleChatWithExpert}
                        disabled={openingChat}
                    >
                        {openingChat
                            ? <ActivityIndicator size="small" color={COLORS.secondary[600]} />
                            : <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.secondary[600]} />
                        }
                        <Text style={styles.chatExpertBtnText}>Chat with Expert</Text>
                    </TouchableOpacity>

                    {/* Tips */}
                    <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>Tips for the session:</Text>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                            <Text style={styles.tipText}>
                                Prepare your questions in advance
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                            <Text style={styles.tipText}>
                                Have photos of your crops ready if needed
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                            <Text style={styles.tipText}>
                                Join 5 minutes early to test your connection
                            </Text>
                        </View>
                    </View>
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
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: COLORS.neutral[500],
    },
    scrollView: {
        flex: 1,
    },
    meetingCardBanner: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: COLORS.primary[500],
        borderRadius: 16,
        padding: 24,
    },
    bannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    bannerIconContainer: {
        width: 56,
        height: 56,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    bannerTextContainer: {
        flex: 1,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    bannerDetails: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
    },
    bannerInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    bannerInfoRowFinal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerInfoText: {
        color: '#ffffff',
        marginLeft: 8,
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    sectionLabel: {
        fontSize: 14,
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    expertRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expertIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.secondary[100],
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    expertName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    expertRole: {
        fontSize: 14,
        color: COLORS.primary[600],
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.neutral[700],
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    chatExpertBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.secondary[300],
        backgroundColor: COLORS.secondary[50],
        borderRadius: 10,
        paddingVertical: 12,
        marginBottom: 16,
        gap: 6,
    },
    chatExpertBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.secondary[600],
    },
    actionButtonWrapper: {
        flex: 1,
    },
    spacer: {
        width: 8,
    },
    tipsContainer: {
        backgroundColor: '#eff6ff', // blue-50
        borderRadius: 12,
        padding: 16,
    },
    tipsTitle: {
        color: '#1e40af', // blue-800
        fontWeight: '600',
        marginBottom: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    tipText: {
        color: '#1d4ed8', // blue-700
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
});

export default MeetingDetails;
