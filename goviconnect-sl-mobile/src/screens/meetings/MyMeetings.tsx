import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
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
                className="bg-white rounded-xl p-4 mb-3 border border-neutral-100"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                }}
            >
                <View className="flex-row items-start">
                    <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: statusConfig.color + '20' }}
                    >
                        <Ionicons
                            name={item.source === 'chat_booking' ? 'chatbubble' : 'calendar'}
                            size={24}
                            color={statusConfig.color}
                        />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-base font-semibold text-neutral-800 flex-1" numberOfLines={1}>
                                {i18n.language === 'si' ? item.topicSi : item.topic}
                            </Text>
                            <View
                                className="px-2 py-0.5 rounded-full ml-2"
                                style={{ backgroundColor: statusConfig.color + '20' }}
                            >
                                <Text className="text-xs font-medium" style={{ color: statusConfig.color }}>
                                    {i18n.language === 'si' ? statusConfig.labelSi : statusConfig.label}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-sm text-primary-600">
                            {item.expertName}
                        </Text>

                        <View className="flex-row items-center mt-2">
                            <Ionicons name="calendar-outline" size={14} color={COLORS.neutral[400]} />
                            <Text className="text-xs text-neutral-500 ml-1">
                                {formatDateTime(item.dateTime, i18n.language)}
                            </Text>
                            <Text className="text-xs text-neutral-400 ml-2">
                                • {item.duration} min
                            </Text>
                        </View>

                        {item.source === 'chat_booking' && (
                            <View className="flex-row items-center mt-1">
                                <Ionicons name="chatbubble-outline" size={12} color={COLORS.neutral[400]} />
                                <Text className="text-xs text-neutral-400 ml-1">Booked from chat</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('meetings.my_meetings')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Filters */}
            <View className="px-4 py-3">
                <View className="flex-row flex-wrap">
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
                    contentContainerStyle={{ padding: 16, paddingTop: 0 }}
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

export default MyMeetings;
