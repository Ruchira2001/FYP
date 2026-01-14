import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField } from '../../components';
import { COLORS } from '../../utils/constants';
import { saveMeeting, Meeting } from '../../services/storage';
import { queueService } from '../../services/queueService';
import { useConnectionStatus } from '../../services/netinfo';
import { generateId } from '../../utils/validators';

type ParamList = {
    BookMeetingFromChat: {
        chatId: string;
        expertId: string;
        expertName: string;
    };
};

const BookMeetingFromChat: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'BookMeetingFromChat'>>();
    const { expertId, expertName } = route.params;
    const { t, i18n } = useTranslation();
    const { isConnected } = useConnectionStatus();

    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [booked, setBooked] = useState(false);

    const handleBookMeeting = async () => {
        if (!topic.trim()) {
            Alert.alert('Error', 'Please enter a topic for the meeting');
            return;
        }

        setLoading(true);

        try {
            // Create meeting
            const meeting: Meeting = {
                id: generateId(),
                expertId,
                expertName,
                topic: topic.trim(),
                topicSi: topic.trim(), // In real app, would translate
                dateTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
                duration: 30,
                status: 'pending',
                notes: notes.trim() || undefined,
                reminderSet: false,
                source: 'chat_booking',
            };

            await saveMeeting(meeting);

            // Queue if offline
            if (!isConnected) {
                await queueService.addToQueue('book_meeting', meeting);
            }

            setBooked(true);
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to book meeting. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (booked) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                    <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
                </View>

                <Text className="text-2xl font-bold text-neutral-800 text-center mb-3">
                    {t('meetings.meeting_booked')}
                </Text>

                <Text className="text-base text-neutral-500 text-center mb-8 px-4">
                    Your meeting request with {expertName} has been sent. You will be notified when it's confirmed.
                </Text>

                <View className="w-full">
                    <PrimaryButton
                        title={t('meetings.my_meetings')}
                        onPress={() => navigation.navigate('MeetingsTab', { screen: 'MyMeetings' })}
                        fullWidth
                        size="lg"
                    />

                    <View className="mt-3">
                        <PrimaryButton
                            title="Back to Chat"
                            onPress={() => navigation.goBack()}
                            variant="ghost"
                            fullWidth
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('meetings.book_meeting')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Expert Info */}
                    <View className="bg-primary-500 rounded-xl p-4 mb-6 flex-row items-center">
                        <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center mr-4">
                            <Ionicons name="person" size={28} color="white" />
                        </View>
                        <View>
                            <Text className="text-white/80 text-sm">{t('meetings.expert')}</Text>
                            <Text className="text-white text-lg font-bold">{expertName}</Text>
                        </View>
                    </View>

                    {/* Form */}
                    <InputField
                        label={t('meetings.topic')}
                        placeholder="e.g., Tomato disease consultation"
                        value={topic}
                        onChangeText={setTopic}
                        icon="chatbubble-outline"
                    />

                    <InputField
                        label={t('meetings.notes')}
                        placeholder="Add any additional details..."
                        value={notes}
                        onChangeText={setNotes}
                        icon="document-text-outline"
                        multiline
                        numberOfLines={4}
                    />

                    {/* Info */}
                    <View className="bg-blue-50 rounded-xl p-4 mt-2">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={20} color={COLORS.info} style={{ marginTop: 2 }} />
                            <View className="flex-1 ml-2">
                                <Text className="text-blue-800 font-medium mb-1">Meeting Request</Text>
                                <Text className="text-blue-700 text-sm">
                                    The expert will confirm the meeting time based on their availability.
                                    You'll receive a notification once confirmed.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Book Button */}
            <View className="p-4 bg-white border-t border-neutral-100">
                <PrimaryButton
                    title={t('meetings.book_meeting')}
                    onPress={handleBookMeeting}
                    loading={loading}
                    disabled={!topic.trim()}
                    icon="calendar"
                    fullWidth
                    size="lg"
                />
            </View>
        </View>
    );
};

export default BookMeetingFromChat;
