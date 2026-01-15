import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../components';
import { COLORS } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/validators';
import meetingsData from '../../data/meetings.json';

type ParamList = {
    MeetingDetails: { meetingId: string };
};

const MeetingDetails: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'MeetingDetails'>>();
    const { meetingId } = route.params;
    const { t, i18n } = useTranslation();

    const [reminderSet, setReminderSet] = useState(false);

    const meeting = meetingsData.upcomingSessions.find(m => m.id === meetingId);

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

    const handleSetReminder = () => {
        setReminderSet(true);
        Alert.alert(
            t('meetings.reminder_set'),
            'You will be notified 15 minutes before the meeting'
        );
    };

    const handleJoinMeeting = () => {
        Alert.alert(
            t('meetings.join_meeting'),
            'Opening meeting link...',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Join', onPress: () => console.log('Joining meeting') },
            ]
        );
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
                                disabled={reminderSet}
                                icon={reminderSet ? 'checkmark' : 'notifications-outline'}
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
        marginBottom: 16,
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
