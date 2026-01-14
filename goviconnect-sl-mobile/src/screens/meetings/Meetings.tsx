import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../components';
import { COLORS, MEETING_STATUSES } from '../../utils/constants';
import { formatDateTime } from '../../utils/validators';
import meetingsData from '../../data/meetings.json';

const Meetings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [upcomingSessions] = useState(meetingsData.upcomingSessions);

    const renderSession = ({ item }: { item: typeof meetingsData.upcomingSessions[0] }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('MeetingDetails', { meetingId: item.id })}
            className="bg-white rounded-xl p-4 mb-3 border border-neutral-100"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View className="flex-row items-start">
                <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="videocam" size={24} color={COLORS.primary[600]} />
                </View>

                <View className="flex-1">
                    <Text className="text-base font-semibold text-neutral-800" numberOfLines={2}>
                        {i18n.language === 'si' ? item.titleSi : item.title}
                    </Text>
                    <Text className="text-sm text-primary-600 mt-0.5">
                        {item.expertName}
                    </Text>

                    <View className="flex-row items-center mt-2">
                        <Ionicons name="calendar-outline" size={14} color={COLORS.neutral[400]} />
                        <Text className="text-xs text-neutral-500 ml-1">
                            {formatDateTime(item.dateTime, i18n.language)}
                        </Text>
                    </View>

                    <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={14} color={COLORS.neutral[400]} />
                        <Text className="text-xs text-neutral-500 ml-1">
                            {item.duration} min
                        </Text>
                        <View className="flex-row items-center ml-4">
                            <Ionicons name="people-outline" size={14} color={COLORS.neutral[400]} />
                            <Text className="text-xs text-neutral-500 ml-1">
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
        <View className="flex-1 bg-neutral-50">
            <Header title={t('meetings.title')} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* My Meetings Quick Access */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('MyMeetings')}
                    className="mx-4 mt-4 bg-primary-500 rounded-xl p-4 flex-row items-center"
                    style={{
                        shadowColor: COLORS.primary[500],
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="calendar" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-white">
                            {t('meetings.my_meetings')}
                        </Text>
                        <Text className="text-white/80 text-sm">
                            View your booked and requested meetings
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>

                {/* Upcoming Sessions */}
                <View className="px-4 py-4">
                    <Text className="text-lg font-semibold text-neutral-800 mb-3">
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

export default Meetings;
