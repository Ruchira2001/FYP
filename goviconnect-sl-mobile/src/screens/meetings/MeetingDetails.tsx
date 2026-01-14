import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../components';
import { COLORS } from '../../utils/constants';
import { formatDateTime, formatDate, formatTime } from '../../utils/validators';
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
            <View className="flex-1 bg-neutral-50">
                <Header
                    title={t('meetings.meeting_details')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View className="flex-1 items-center justify-center">
                    <Text className="text-neutral-500">Meeting not found</Text>
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
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('meetings.meeting_details')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Meeting Card */}
                <View className="mx-4 mt-4 bg-primary-500 rounded-2xl p-6">
                    <View className="flex-row items-center mb-4">
                        <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center mr-4">
                            <Ionicons name="videocam" size={28} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white/80 text-sm">Expert Session</Text>
                            <Text className="text-xl font-bold text-white">
                                {i18n.language === 'si' ? meeting.titleSi : meeting.title}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-white/10 rounded-xl p-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar" size={18} color="white" />
                            <Text className="text-white ml-2">
                                {formatDate(meeting.dateTime, i18n.language)}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="time" size={18} color="white" />
                            <Text className="text-white ml-2">
                                {formatTime(meeting.dateTime, i18n.language)} ({meeting.duration} min)
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="people" size={18} color="white" />
                            <Text className="text-white ml-2">
                                {meeting.attendees}/{meeting.maxAttendees} attendees
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="p-4">
                    {/* Expert Info */}
                    <View className="bg-white rounded-xl p-4 mb-4 border border-neutral-100">
                        <Text className="text-sm text-neutral-400 uppercase mb-2">
                            {t('meetings.expert')}
                        </Text>
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-secondary-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="person" size={24} color={COLORS.secondary[600]} />
                            </View>
                            <View>
                                <Text className="text-base font-semibold text-neutral-800">
                                    {meeting.expertName}
                                </Text>
                                <Text className="text-sm text-primary-600">Agricultural Expert</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="bg-white rounded-xl p-4 mb-4 border border-neutral-100">
                        <Text className="text-sm text-neutral-400 uppercase mb-2">
                            About This Session
                        </Text>
                        <Text className="text-sm text-neutral-700 leading-5">
                            {i18n.language === 'si' ? meeting.descriptionSi : meeting.description}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row mb-4">
                        <View className="flex-1 mr-2">
                            <PrimaryButton
                                title={reminderSet ? t('meetings.reminder_set') : t('meetings.set_reminder')}
                                onPress={handleSetReminder}
                                disabled={reminderSet}
                                icon={reminderSet ? 'checkmark' : 'notifications-outline'}
                                variant="outline"
                                fullWidth
                            />
                        </View>
                        <View className="flex-1">
                            <PrimaryButton
                                title={t('meetings.join_meeting')}
                                onPress={handleJoinMeeting}
                                icon="videocam"
                                fullWidth
                            />
                        </View>
                    </View>

                    {/* Tips */}
                    <View className="bg-blue-50 rounded-xl p-4">
                        <Text className="text-blue-800 font-semibold mb-2">Tips for the session:</Text>
                        <View className="flex-row items-start mb-1">
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                            <Text className="text-blue-700 text-sm ml-2 flex-1">
                                Prepare your questions in advance
                            </Text>
                        </View>
                        <View className="flex-row items-start mb-1">
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                            <Text className="text-blue-700 text-sm ml-2 flex-1">
                                Have photos of your crops ready if needed
                            </Text>
                        </View>
                        <View className="flex-row items-start">
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                            <Text className="text-blue-700 text-sm ml-2 flex-1">
                                Join 5 minutes early to test your connection
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default MeetingDetails;
