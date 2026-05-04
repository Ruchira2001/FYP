import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, KeyboardAvoidingView, Platform, Image, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { formatTime, generateId } from '../../../utils/validators';
import { chatAPI } from '../../../services/api';
import { getSocket } from '../../../services/socketService';

interface ChatMessage {
    id: string;
    senderId: string;
    senderType: 'expert' | 'farmer';
    content: string;
    type: 'text' | 'image' | 'diagnosis' | 'prediction';
    attachmentData?: any;
    timestamp: string;
    synced?: boolean;
}

const ExpertChatDetail: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();
    const flatListRef = useRef<FlatList>(null);

    const chatId = route.params?.chatId || route.params?.id;
    const farmerName = route.params?.farmerName || 'Farmer';
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [uploadingAttachment, setUploadingAttachment] = useState(false);

    const mapMessage = (m: any): ChatMessage => ({
        id: m._id || m.id,
        senderId: m.sender?._id || m.senderId || '',
        senderType: m.senderType === 'expert' ? 'expert' : 'farmer',
        content: m.content || '',
        type: m.type || 'text',
        attachmentData: m.attachmentData,
        timestamp: m.createdAt || m.timestamp,
        synced: m.synced !== false,
    });

    useEffect(() => {
        loadMessages();

        // Mark chat as read to clear expert's unread badge
        if (chatId) chatAPI.markChatRead(chatId).catch(() => {});

        // Join socket room to receive real-time messages from farmer
        const socket = getSocket();
        if (socket && chatId) {
            socket.emit('join_chat', chatId);

            const handleNewMessage = (data: any) => {
                if (data.chatId !== chatId) return;
                const incoming = mapMessage(data.message);
                setMessages(prev => {
                    if (prev.some(msg => msg.id === incoming.id)) return prev;
                    const pendingIndex = prev.findIndex(msg =>
                        msg.senderType === incoming.senderType &&
                        msg.type === incoming.type &&
                        (incoming.type === 'image' || msg.content === incoming.content) &&
                        msg.id.startsWith('local-')
                    );
                    if (pendingIndex !== -1) {
                        const next = [...prev];
                        next[pendingIndex] = incoming;
                        return next;
                    }
                    return [...prev, incoming];
                });
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            };

            socket.on('new_message', handleNewMessage);

            return () => {
                socket.emit('leave_chat', chatId);
                socket.off('new_message', handleNewMessage);
            };
        }
    }, [chatId]);

    const loadMessages = async () => {
        try {
            if (!chatId) return;
            const res = await chatAPI.getMessages(chatId);
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setMessages(data.map(mapMessage));
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
        } catch (e) {
            console.error('Failed to load expert chat messages:', e);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const newMessage: ChatMessage = {
            id: `local-${generateId()}`,
            senderId: 'expert-1',
            senderType: 'expert',
            content: inputText.trim(),
            type: 'text',
            timestamp: new Date().toISOString(),
            synced: false,
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            if (chatId) {
                const res = await chatAPI.sendMessage(chatId, { content: newMessage.content, type: 'text' });
                const saved = res.data?.data ? mapMessage(res.data.data) : null;
                if (saved) {
                    setMessages(prev => prev.map(msg => msg.id === newMessage.id ? saved : msg));
                }
            }
        } catch (e) {
            console.error('Failed to send message:', e);
        }
    };

    const sendImageAttachment = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!chatId) return;
        const uri = asset.uri;
        const fileName = asset.fileName || `chat_image_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        const pendingMessage: ChatMessage = {
            id: `local-${generateId()}`,
            senderId: 'expert-1',
            senderType: 'expert',
            content: uri,
            type: 'image',
            attachmentData: { url: uri, fileName, mimeType },
            timestamp: new Date().toISOString(),
            synced: false,
        };

        setMessages(prev => [...prev, pendingMessage]);
        setUploadingAttachment(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const formData = new FormData();
            formData.append('image', {
                uri,
                name: fileName,
                type: mimeType,
            } as any);

            const res = await chatAPI.sendImageMessage(chatId, formData);
            const saved = res.data?.data ? mapMessage(res.data.data) : null;
            if (saved) {
                setMessages(prev => prev.map(msg => msg.id === pendingMessage.id ? saved : msg));
            }
        } catch (e) {
            console.error('Failed to upload expert chat image:', e);
            Alert.alert('Upload failed', 'Could not send this image. Please try again.');
        } finally {
            setUploadingAttachment(false);
        }
    };

    const handleAttachImage = () => {
        Alert.alert('Send Image', 'Choose an image source.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Camera',
                onPress: async () => {
                    const permission = await ImagePicker.requestCameraPermissionsAsync();
                    if (!permission.granted) {
                        Alert.alert('Permission needed', 'Please allow camera access to send images.');
                        return;
                    }
                    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
                    if (!result.canceled && result.assets?.[0]) await sendImageAttachment(result.assets[0]);
                },
            },
            {
                text: 'Gallery',
                onPress: async () => {
                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permission.granted) {
                        Alert.alert('Permission needed', 'Please allow photo library access to send images.');
                        return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
                    if (!result.canceled && result.assets?.[0]) await sendImageAttachment(result.assets[0]);
                },
            },
        ]);
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isExpert = item.senderType === 'expert';

        return (
            <View style={[
                styles.messageContainer,
                isExpert ? styles.expertMessage : styles.farmerMessage,
            ]}>
                {!isExpert && (
                    <View style={styles.farmerAvatar}>
                        <Text style={{ fontSize: 14 }}>👨‍🌾</Text>
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isExpert ? styles.expertBubble : styles.farmerBubble,
                ]}>
                    {item.type === 'image' && item.content ? (
                        <Image source={{ uri: item.content }} style={styles.imageAttachment} resizeMode="cover" />
                    ) : item.type === 'image' ? (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image" size={32} color={COLORS.neutral[400]} />
                            <Text style={styles.imagePlaceholderText}>Photo attached</Text>
                        </View>
                    ) : (
                        <Text style={[
                            styles.messageText,
                            isExpert ? styles.expertMessageText : styles.farmerMessageText,
                        ]}>
                            {item.content}
                        </Text>
                    )}
                    {item.type === 'image' && !item.synced && (
                        <Text style={[styles.uploadStatus, isExpert ? styles.expertTimeText : styles.farmerTimeText]}>
                            Uploading...
                        </Text>
                    )}
                    <Text style={[
                        styles.messageTime,
                        isExpert ? styles.expertTimeText : styles.farmerTimeText,
                    ]}>
                        {formatTime(item.timestamp)}
                        {isExpert && (
                            <Text> ✓✓</Text>
                        )}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            <Header
                title={farmerName}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Farmer Info Bar */}
            <View style={styles.farmerInfoBar}>
                <View style={styles.farmerInfoItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.neutral[400]} />
                    <Text style={styles.farmerInfoText}>Kandy</Text>
                </View>
                <View style={styles.farmerInfoDot} />
                <View style={styles.farmerInfoItem}>
                    <Ionicons name="leaf-outline" size={14} color={COLORS.neutral[400]} />
                    <Text style={styles.farmerInfoText}>Tomato, Chili</Text>
                </View>
                <View style={styles.onlineIndicator}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Online</Text>
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
            />

            {/* Input Bar */}
            <View style={styles.inputBar}>
                <TouchableOpacity style={styles.attachButton} onPress={handleAttachImage} disabled={uploadingAttachment}>
                    <Ionicons name="add-circle" size={28} color={COLORS.primary[500]} />
                </TouchableOpacity>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type your response..."
                        placeholderTextColor={COLORS.neutral[400]}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : {}]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={inputText.trim() ? '#ffffff' : COLORS.neutral[400]}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    farmerInfoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    farmerInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    farmerInfoText: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginLeft: 4,
    },
    farmerInfoDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.neutral[300],
        marginHorizontal: 8,
    },
    onlineIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 4,
    },
    onlineText: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '500',
    },
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-end',
    },
    expertMessage: {
        justifyContent: 'flex-end',
    },
    farmerMessage: {
        justifyContent: 'flex-start',
    },
    farmerAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 16,
        padding: 12,
    },
    expertBubble: {
        backgroundColor: COLORS.primary[500],
        borderBottomRightRadius: 4,
        marginLeft: 'auto',
    },
    farmerBubble: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    expertMessageText: {
        color: '#ffffff',
    },
    farmerMessageText: {
        color: COLORS.neutral[800],
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'right',
    },
    expertTimeText: {
        color: 'rgba(255,255,255,0.7)',
    },
    farmerTimeText: {
        color: COLORS.neutral[400],
    },
    imagePlaceholder: {
        width: 180,
        height: 120,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageAttachment: {
        width: 200,
        height: 150,
        borderRadius: 12,
        backgroundColor: COLORS.neutral[100],
    },
    imagePlaceholderText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 4,
    },
    uploadStatus: {
        fontSize: 11,
        marginTop: 6,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    attachButton: {
        paddingHorizontal: 4,
        paddingBottom: 6,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    textInput: {
        fontSize: 14,
        color: COLORS.neutral[800],
        maxHeight: 80,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonActive: {
        backgroundColor: COLORS.primary[500],
        ...SHADOW.md,
        shadowColor: COLORS.primary[500],
    },
});

export default ExpertChatDetail;
