import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../components';
import { COLORS } from '../../utils/constants';
import { Message, saveMessage } from '../../services/storage';
import { queueService } from '../../services/queueService';
import { useConnectionStatus } from '../../services/netinfo';
import { generateId, formatTime } from '../../utils/validators';
import chatsData from '../../data/chats.json';

type ParamList = {
    ChatDetail: { chatId: string };
};

const ChatDetail: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'ChatDetail'>>();
    const { chatId } = route.params;
    const { t, i18n } = useTranslation();
    const { isConnected } = useConnectionStatus();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [showActions, setShowActions] = useState(false);

    const chat = chatsData.chats.find(c => c.id === chatId);
    const chatMessages = (chatsData.messages as any)[chatId] || [];

    useEffect(() => {
        setMessages(chatMessages);
    }, []);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: generateId(),
            chatId,
            senderId: 'user',
            senderType: 'user',
            content: inputText.trim(),
            type: 'text',
            timestamp: new Date().toISOString(),
            synced: isConnected,
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        // Queue if offline
        if (!isConnected) {
            await queueService.addToQueue('send_message', newMessage);
        }

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd();
        }, 100);
    };

    const handleBookMeeting = () => {
        navigation.navigate('BookMeetingFromChat', {
            chatId,
            expertId: chat?.expertId,
            expertName: chat?.expertName,
        });
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.senderType === 'user';

        return (
            <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
                <View
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                            ? 'bg-primary-500 rounded-br-sm'
                            : 'bg-white border border-neutral-100 rounded-bl-sm'
                        }`}
                    style={!isUser ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 1,
                    } : undefined}
                >
                    {item.type === 'image' && (
                        <View className="w-48 h-36 bg-neutral-200 rounded-lg mb-2 items-center justify-center">
                            <Ionicons name="image" size={32} color={COLORS.neutral[400]} />
                        </View>
                    )}

                    {item.type === 'diagnosis' && (
                        <View className="bg-red-50 rounded-lg p-3 mb-2">
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="medical" size={16} color={COLORS.error} />
                                <Text className="text-red-700 font-medium ml-1">Diagnosis Result</Text>
                            </View>
                            <Text className="text-red-600 text-sm">Attached for review</Text>
                        </View>
                    )}

                    {item.type === 'prediction' && (
                        <View className="bg-blue-50 rounded-lg p-3 mb-2">
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="analytics" size={16} color={COLORS.info} />
                                <Text className="text-blue-700 font-medium ml-1">Price Prediction</Text>
                            </View>
                            <Text className="text-blue-600 text-sm">Attached for review</Text>
                        </View>
                    )}

                    <Text className={`text-base ${isUser ? 'text-white' : 'text-neutral-800'}`}>
                        {item.content}
                    </Text>

                    <View className="flex-row items-center justify-end mt-1">
                        <Text className={`text-xs ${isUser ? 'text-white/70' : 'text-neutral-400'}`}>
                            {formatTime(item.timestamp, i18n.language)}
                        </Text>
                        {isUser && (
                            <Ionicons
                                name={item.synced ? 'checkmark-done' : 'time'}
                                size={14}
                                color={isUser ? 'rgba(255,255,255,0.7)' : COLORS.neutral[400]}
                                style={{ marginLeft: 4 }}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-neutral-50"
        >
            {/* Header */}
            <View className="bg-white border-b border-neutral-100">
                <View className="flex-row items-center px-4 py-3">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-3"
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.neutral[700]} />
                    </TouchableOpacity>

                    <View className="relative">
                        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                            <Ionicons name="person" size={20} color={COLORS.primary[600]} />
                        </View>
                        {chat?.online && (
                            <View className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </View>

                    <View className="flex-1 ml-3">
                        <Text className="text-base font-semibold text-neutral-800">
                            {chat?.expertName}
                        </Text>
                        <Text className="text-xs text-neutral-400">
                            {chat?.online ? t('chats.online') : t('chats.offline')}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={handleBookMeeting} className="bg-primary-100 px-3 py-2 rounded-lg">
                        <Text className="text-primary-700 font-medium text-sm">
                            {t('chats.book_meeting_cta')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {/* Quick Actions */}
            {showActions && (
                <View className="bg-white border-t border-neutral-100 px-4 py-3 flex-row">
                    <TouchableOpacity
                        className="flex-1 bg-red-50 rounded-xl py-3 mr-2 items-center flex-row justify-center"
                        onPress={() => {
                            setShowActions(false);
                            // Add diagnosis attachment
                        }}
                    >
                        <Ionicons name="medical" size={18} color={COLORS.error} />
                        <Text className="text-red-700 font-medium ml-2 text-sm">
                            {t('chats.send_diagnosis')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-blue-50 rounded-xl py-3 items-center flex-row justify-center"
                        onPress={() => {
                            setShowActions(false);
                            // Add prediction attachment
                        }}
                    >
                        <Ionicons name="analytics" size={18} color={COLORS.info} />
                        <Text className="text-blue-700 font-medium ml-2 text-sm">
                            {t('chats.send_prediction')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Input */}
            <View className="bg-white border-t border-neutral-100 px-4 py-3 flex-row items-center">
                <TouchableOpacity
                    onPress={() => setShowActions(!showActions)}
                    className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center mr-2"
                >
                    <Ionicons
                        name={showActions ? 'close' : 'add'}
                        size={24}
                        color={COLORS.neutral[600]}
                    />
                </TouchableOpacity>

                <View className="flex-1 bg-neutral-100 rounded-xl px-4 py-2 mr-2">
                    <TextInput
                        className="text-base text-neutral-800"
                        placeholder={t('chats.type_message')}
                        placeholderTextColor={COLORS.neutral[400]}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                    className={`w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-primary-500' : 'bg-neutral-200'
                        }`}
                >
                    <Ionicons
                        name="send"
                        size={18}
                        color={inputText.trim() ? 'white' : COLORS.neutral[400]}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatDetail;
