import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../components';
import { COLORS } from '../../utils/constants';
import { getRelativeTime } from '../../utils/validators';
import { chatAPI } from '../../services/api';
import { getSocket } from '../../services/socketService';

const CATEGORIES = ['All', 'Unread', 'Experts', 'Groups'];

const ChatsList: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [activeCategory, setActiveCategory] = useState('All');
    const [chats, setChats] = useState<any[]>([]);
    const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

    const loadChats = useCallback(async () => {
        try {
            const res = await chatAPI.getChats();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setChats(data.map((c: any) => {
                // Backend resolves unreadCount per-user but may return as Map object
                const unread = typeof c.unreadCount === 'object' && c.unreadCount !== null
                    ? (Object.values(c.unreadCount)[0] as number) || 0
                    : (c.unreadCount as number) || 0;
                // Extract expert from participants array or legacy fields
                const expertParticipant = c.participants?.find((p: any) => p.userType === 'expert');
                return {
                    id: c._id || c.id,
                    expertId: expertParticipant?.userId || c.expertId,
                    expertName: expertParticipant?.name || c.expertName || 'Expert',
                    lastMessage: c.lastMessage || '',
                    lastMessageTime: c.lastMessageTime || c.updatedAt || new Date().toISOString(),
                    unreadCount: unread,
                    online: c.online || false,
                };
            }));
        } catch (e) {
            console.error('Failed to load chats:', e);
        }
    }, []);

    // Refresh every time the screen comes into focus (handles returning from ChatDetail after reading)
    useFocusEffect(
        useCallback(() => {
            loadChats();
        }, [loadChats])
    );

    // Real-time: update badge when new message arrives or messages are read
    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            socket.on('new_message', loadChats);
            socket.on('messages_read', loadChats);
            socket.on('chat_deleted', loadChats);
        }
        return () => {
            if (socket) {
                socket.off('new_message', loadChats);
                socket.off('messages_read', loadChats);
                socket.off('chat_deleted', loadChats);
            }
        };
    }, [loadChats]);

    const filteredChats = chats.filter(chat => {
        if (activeCategory === 'Unread') return chat.unreadCount > 0;
        // For demo, assuming all current chats are 'Experts'. 
        // In a real app, you'd filter by type.
        return true;
    });

    const handleNewChat = () => {
        navigation.navigate('NewChat');
    };

    const confirmDeleteChat = (chat: any) => {
        Alert.alert(
            'Delete Conversation?',
            `Are you sure you want to delete your conversation with ${chat.expertName}?\n\nThis action will permanently remove all messages and cannot be undone.`,
            [
                { text: 'Keep Chat', style: 'cancel' },
                {
                    text: 'Delete Conversation',
                    style: 'destructive',
                    onPress: () => handleDeleteChat(chat.id),
                },
            ]
        );
    };

    const handleDeleteChat = async (chatId: string) => {
        if (deletingChatId) return;

        try {
            setDeletingChatId(chatId);
            await chatAPI.deleteChat(chatId);
            setChats(prev => prev.filter(chat => chat.id !== chatId));
        } catch (e) {
            console.error('Failed to delete chat:', e);
            Alert.alert('Error', 'Could not delete chat. Please try again.');
        } finally {
            setDeletingChatId(null);
        }
    };

    const renderChat = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ChatDetail', {
                chatId: item.id,
                expertName: item.expertName,
            })}
            style={[styles.chatCard, item.unreadCount > 0 && styles.chatCardUnread]}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={28} color={COLORS.primary[600]} />
                </View>
                {item.online && (
                    <View style={styles.onlineStatus} />
                )}
            </View>

            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.expertName, item.unreadCount > 0 && styles.expertNameUnread]}>
                        {item.expertName}
                    </Text>
                    <View style={styles.chatHeaderRight}>
                        <Text style={styles.timeText}>
                            {getRelativeTime(item.lastMessageTime, i18n.language)}
                        </Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => confirmDeleteChat(item)}
                            disabled={deletingChatId === item.id}
                        >
                            {deletingChatId === item.id ? (
                                <ActivityIndicator size="small" color={COLORS.error} />
                            ) : (
                                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.messageRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage || 'No messages yet'}
                    </Text>

                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title={t('chats.title')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                    {CATEGORIES.map((cat) => (
                        <Chip
                            key={cat}
                            label={cat}
                            selected={activeCategory === cat}
                            onPress={() => setActiveCategory(cat)}
                            variant="outline"
                            size="sm"
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            {filteredChats.length > 0 ? (
                <FlatList
                    data={filteredChats}
                    renderItem={renderChat}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="chatbubbles-outline"
                    title={t('chats.no_chats')}
                    description="No conversations found in this category."
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={handleNewChat}>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.fabText}>New Chat</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50], // neutral-50
    },
    categoriesContainer: {
        paddingVertical: 12,
    },
    categoriesContent: {
        paddingHorizontal: 16,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 80, // for FAB
    },
    chatCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    chatCardUnread: {
        borderColor: COLORS.primary[200],
        backgroundColor: COLORS.primary[50],
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        backgroundColor: COLORS.primary[100],
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        backgroundColor: '#22c55e', // green-500
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    chatHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expertName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    expertNameUnread: {
        color: COLORS.primary[700],
        fontWeight: '700',
    },
    timeText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginRight: 8,
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.neutral[500],
        flex: 1,
        marginRight: 8,
    },
    unreadBadge: {
        backgroundColor: COLORS.primary[500],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        height: 52,
        borderRadius: 26,
        paddingHorizontal: 16,
        backgroundColor: COLORS.primary[600],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default ChatsList;
