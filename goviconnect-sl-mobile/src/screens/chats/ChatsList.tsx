import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../components';
import { COLORS } from '../../utils/constants';
import { getRelativeTime } from '../../utils/validators';
import chatsData from '../../data/chats.json';

const ChatsList: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [chats] = useState(chatsData.chats);

    const renderChat = ({ item }: { item: typeof chatsData.chats[0] }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}
            className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 flex-row items-center"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            {/* Avatar */}
            <View className="relative">
                <View className="w-14 h-14 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={28} color={COLORS.primary[600]} />
                </View>
                {item.online && (
                    <View className="absolute bottom-0 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
            </View>

            <View className="flex-1 ml-1">
                <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-semibold text-neutral-800">
                        {item.expertName}
                    </Text>
                    <Text className="text-xs text-neutral-400">
                        {getRelativeTime(item.lastMessageTime, i18n.language)}
                    </Text>
                </View>

                <Text className="text-sm text-neutral-500" numberOfLines={1}>
                    {i18n.language === 'si' ? item.lastMessageSi : item.lastMessage}
                </Text>
            </View>

            {/* Unread Badge */}
            {item.unreadCount > 0 && (
                <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center ml-2">
                    <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('chats.title')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {chats.length > 0 ? (
                <FlatList
                    data={chats}
                    renderItem={renderChat}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="chatbubbles-outline"
                    title={t('chats.no_chats')}
                    description="Start a conversation with an expert to get personalized advice"
                />
            )}
        </View>
    );
};

export default ChatsList;
