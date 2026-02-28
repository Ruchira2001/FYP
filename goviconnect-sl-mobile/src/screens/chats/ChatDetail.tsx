import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { Message } from '../../services/storage';
import { chatAPI } from '../../services/api';
import { queueService } from '../../services/queueService';
import { useConnectionStatus } from '../../services/netinfo';
import { generateId, formatTime } from '../../utils/validators';

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
    const [chat, setChat] = useState<any>(null);

    useEffect(() => {
        loadChat();
    }, []);

    const loadChat = async () => {
        try {
            const [chatsRes, msgsRes] = await Promise.all([
                chatAPI.getChats(),
                chatAPI.getMessages(chatId),
            ]);
            const chats = Array.isArray(chatsRes.data.data) ? chatsRes.data.data : [];
            const found = chats.find((c: any) => (c._id || c.id) === chatId);
            if (found) {
                setChat({
                    id: found._id || found.id,
                    expertId: found.expert?._id || found.expertId,
                    expertName: found.expert?.name || found.expertName || 'Expert',
                });
            }
            const msgs = Array.isArray(msgsRes.data.data) ? msgsRes.data.data : [];
            setMessages(msgs.map((m: any) => ({
                id: m._id || m.id,
                chatId: chatId,
                senderId: m.sender?._id || m.senderId || '',
                senderType: m.senderType || (m.sender?.role === 'farmer' ? 'user' : 'expert'),
                content: m.content || '',
                type: m.type || 'text',
                timestamp: m.createdAt || m.timestamp,
                synced: true,
            })));
            setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
        } catch (e) {
            console.error('Failed to load chat:', e);
        }
    };

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

        // Send via API
        try {
            await chatAPI.sendMessage(chatId, { content: inputText.trim(), type: 'text' });
        } catch {
            // Queue if offline
            if (!isConnected) {
                await queueService.addToQueue('send_message', newMessage);
            }
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

    const handleAttachment = (type: string) => {
        setShowActions(false);
        Alert.alert("Attachment", `You selected: ${type}`);
        // Implement specific logic here
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.senderType === 'user';

        return (
            <View style={[styles.messageRow, isUser ? styles.rowEnd : styles.rowStart]}>
                <View
                    style={[
                        styles.bubble,
                        isUser ? styles.bubbleUser : styles.bubbleExpert,
                        !isUser && styles.bubbleShadow
                    ]}
                >
                    {item.type === 'image' && (
                        <View style={styles.attachmentPlaceholder}>
                            <Ionicons name="image" size={32} color={COLORS.neutral[400]} />
                        </View>
                    )}

                    {item.type === 'diagnosis' && (
                        <View style={[styles.attachmentBox, styles.diagnosisBox]}>
                            <View style={styles.attachmentHeader}>
                                <Ionicons name="medical" size={16} color={COLORS.error} />
                                <Text style={styles.diagnosisTitle}>Diagnosis Result</Text>
                            </View>
                            <Text style={styles.diagnosisText}>Attached for review</Text>
                        </View>
                    )}

                    {item.type === 'prediction' && (
                        <View style={[styles.attachmentBox, styles.predictionBox]}>
                            <View style={styles.attachmentHeader}>
                                <Ionicons name="analytics" size={16} color={COLORS.info} />
                                <Text style={styles.predictionTitle}>Price Prediction</Text>
                            </View>
                            <Text style={styles.predictionText}>Attached for review</Text>
                        </View>
                    )}

                    <Text style={[styles.messageText, isUser ? styles.textUser : styles.textExpert]}>
                        {item.content}
                    </Text>

                    <View style={styles.metaRow}>
                        <Text style={[styles.timestamp, isUser ? styles.timeUser : styles.timeExpert]}>
                            {formatTime(item.timestamp, i18n.language)}
                        </Text>
                        {isUser && (
                            <Ionicons
                                name={item.synced ? 'checkmark-done' : 'time'}
                                size={14}
                                color={'rgba(255,255,255,0.7)'}
                                style={styles.statusIcon}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.neutral[700]} />
                        </TouchableOpacity>

                        <View style={styles.expertAvatarContainer}>
                            <View style={styles.expertAvatar}>
                                <Ionicons name="person" size={20} color={COLORS.primary[600]} />
                            </View>
                            {chat?.online && (
                                <View style={styles.onlineDot} />
                            )}
                        </View>

                        <View style={styles.expertInfo}>
                            <Text style={styles.expertName}>
                                {chat?.expertName}
                            </Text>
                            <Text style={styles.statusText}>
                                {chat?.online ? t('chats.online') : t('chats.offline')}
                            </Text>
                        </View>

                        <TouchableOpacity onPress={handleBookMeeting} style={styles.bookButton}>
                            <Ionicons name="calendar" size={20} color={COLORS.primary[700]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />

                {/* Input Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    {/* Quick Actions (WhatsApp style) */}
                    {showActions && (
                        <View style={styles.actionsPanel}>
                            <View style={styles.actionsGrid}>
                                <TouchableOpacity style={styles.actionItem} onPress={() => handleAttachment('Document')}>
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#5f66cd' }]}>
                                        <Ionicons name="document-text" size={24} color="white" />
                                    </View>
                                    <Text style={styles.actionLabel}>Document</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem} onPress={() => handleAttachment('Camera')}>
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#ec407a' }]}>
                                        <Ionicons name="camera" size={24} color="white" />
                                    </View>
                                    <Text style={styles.actionLabel}>Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem} onPress={() => handleAttachment('Gallery')}>
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#ab47bc' }]}>
                                        <Ionicons name="image" size={24} color="white" />
                                    </View>
                                    <Text style={styles.actionLabel}>Gallery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem} onPress={() => handleAttachment('Audio')}>
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#ff9800' }]}>
                                        <Ionicons name="musical-notes" size={24} color="white" />
                                    </View>
                                    <Text style={styles.actionLabel}>Audio</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem} onPress={() => handleAttachment('Location')}>
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#4caf50' }]}>
                                        <Ionicons name="location" size={24} color="white" />
                                    </View>
                                    <Text style={styles.actionLabel}>Location</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem} onPress={() => handleAttachment('Contact')}>
                                    <View style={[styles.actionIconCircle, { backgroundColor: '#2196f3' }]}>
                                        <Ionicons name="person" size={24} color="white" />
                                    </View>
                                    <Text style={styles.actionLabel}>Contact</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.inputArea}>
                        <TouchableOpacity
                            onPress={() => setShowActions(!showActions)}
                            style={styles.attachButton}
                        >
                            <Ionicons
                                name={showActions ? 'close' : 'add'}
                                size={24}
                                color={COLORS.neutral[600]}
                            />
                        </TouchableOpacity>

                        <View style={styles.textInputWrapper}>
                            <TextInput
                                style={styles.textInput}
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
                            style={[styles.sendButton, inputText.trim() ? styles.sendActive : styles.sendInactive]}
                        >
                            <Ionicons
                                name="send"
                                size={18}
                                color={inputText.trim() ? 'white' : COLORS.neutral[400]}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    header: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        marginRight: 12,
    },
    expertAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    expertAvatar: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.primary[100],
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        backgroundColor: '#22c55e',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    expertInfo: {
        flex: 1,
    },
    expertName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    statusText: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    bookButton: {
        backgroundColor: COLORS.primary[100],
        padding: 8,
        borderRadius: 20, // Circular/rounded
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
    },
    messagesList: {
        padding: 16,
    },
    messageRow: {
        marginBottom: 12,
        flexDirection: 'row',
    },
    rowEnd: {
        justifyContent: 'flex-end',
    },
    rowStart: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bubbleUser: {
        backgroundColor: COLORS.primary[500],
        borderBottomRightRadius: 2,
    },
    bubbleExpert: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        borderBottomLeftRadius: 2,
    },
    bubbleShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    attachmentPlaceholder: {
        width: 192,
        height: 144,
        backgroundColor: COLORS.neutral[200],
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachmentBox: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    diagnosisBox: {
        backgroundColor: '#fef2f2', // red-50
    },
    predictionBox: {
        backgroundColor: '#eff6ff', // blue-50
    },
    attachmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    diagnosisTitle: {
        color: '#b91c1c', // red-700
        fontWeight: '500',
        marginLeft: 4,
    },
    predictionTitle: {
        color: '#1d4ed8', // blue-700
        fontWeight: '500',
        marginLeft: 4,
    },
    diagnosisText: {
        color: '#dc2626', // red-600
        fontSize: 14,
    },
    predictionText: {
        color: '#2563eb', // blue-600
        fontSize: 14,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    textUser: {
        color: '#ffffff',
    },
    textExpert: {
        color: COLORS.neutral[800],
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 12,
    },
    timeUser: {
        color: 'rgba(255,255,255,0.7)',
    },
    timeExpert: {
        color: COLORS.neutral[400],
    },
    statusIcon: {
        marginLeft: 4,
    },
    // New WhatsApp-style actions
    actionsPanel: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        padding: 24,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: -12,
    },
    actionItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 12,
    },
    actionIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        color: COLORS.neutral[600],
        fontWeight: '500',
    },
    inputArea: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    attachButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    textInputWrapper: {
        flex: 1,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        minHeight: 40,
    },
    textInput: {
        fontSize: 16,
        color: COLORS.neutral[800],
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendActive: {
        backgroundColor: COLORS.primary[500],
    },
    sendInactive: {
        backgroundColor: COLORS.neutral[200],
    },
});

export default ChatDetail;
