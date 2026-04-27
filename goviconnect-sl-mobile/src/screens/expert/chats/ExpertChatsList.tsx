import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { getRelativeTime } from '../../../utils/validators';
import { chatAPI } from '../../../services/api';
import { getSocket } from '../../../services/socketService';

const CATEGORIES = ['All', 'Unread', 'Active Diagnosis', 'Recent'];

const ExpertChatsList: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [activeCategory, setActiveCategory] = useState('All');
    const [chats, setChats] = useState<any[]>([]);

    const loadChats = useCallback(async () => {
        try {
            const res = await chatAPI.getChats();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setChats(data.map((c: any) => {
                // Participants: [{userType:'farmer',...},{userType:'expert',...}]
                const farmer = c.participants?.find((p: any) => p.userType === 'farmer');
                const unread = typeof c.unreadCount === 'object'
                    ? (Object.values(c.unreadCount)[0] as number) || 0
                    : c.unreadCount || 0;
                return {
                    id: c._id || c.id,
                    farmerId: farmer?.userId || c.farmerId,
                    farmerName: farmer?.name || c.farmerName || 'Farmer',
                    lastMessage: c.lastMessage || '',
                    lastMessageTime: c.lastMessageTime || c.updatedAt,
                    unreadCount: unread,
                    hasActiveDiagnosis: c.hasActiveDiagnosis || false,
                    online: farmer?.isOnline || false,
                };
            }));
        } catch (e) {
            console.error('Failed to load expert chats:', e);
        }
    }, []);

    useEffect(() => {
        loadChats();

        // Real-time: new chat created by farmer, or new message received
        const socket = getSocket();
        if (socket) {
            socket.on('new_chat', loadChats);
            socket.on('new_message', loadChats);
            socket.on('messages_read', loadChats);
        }
        return () => {
            if (socket) {
                socket.off('new_chat', loadChats);
                socket.off('new_message', loadChats);
                socket.off('messages_read', loadChats);
            }
        };
    }, [loadChats]);

    // Refresh when returning from ExpertChatDetail so badge clears immediately
    useFocusEffect(
        useCallback(() => {
            loadChats();
        }, [loadChats])
    );

    const filteredChats = chats.filter(chat => {
        if (activeCategory === 'Unread') return chat.unreadCount > 0;
        if (activeCategory === 'Active Diagnosis') return chat.hasActiveDiagnosis;
        return true;
    });

    const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

    const renderChat = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ExpertChatDetail', { chatId: item.id, farmerName: item.farmerName })}
            style={[styles.chatCard, item.unreadCount > 0 && styles.chatCardUnread]}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>👨‍🌾</Text>
                </View>
                {item.online && (
                    <View style={styles.onlineStatus} />
                )}
            </View>

            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.farmerName, item.unreadCount > 0 && styles.farmerNameUnread]}>{item.farmerName}</Text>
                        {item.hasActiveDiagnosis && (
                            <View style={styles.diagnosisBadge}>
                                <Ionicons name="medical" size={10} color={COLORS.error} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.timeText}>
                        {getRelativeTime(item.lastMessageTime, i18n.language)}
                    </Text>
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
                title="Farmer Chats"
                showBack
                onBackPress={() => navigation.goBack()}
                rightContent={
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{totalUnread} unread</Text>
                    </View>
                }
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
                    title="No chats found"
                    description="No farmer conversations in this category."
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    headerBadge: {
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    headerBadgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.primary[600],
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
        paddingBottom: 24,
    },
    chatCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        flexDirection: 'row',
        alignItems: 'flex-start',
        ...SHADOW.sm,
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
        width: 52,
        height: 52,
        backgroundColor: COLORS.primary[100],
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 24,
    },
    onlineStatus: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        backgroundColor: COLORS.success,
        borderRadius: 7,
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
        marginBottom: 2,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    farmerName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    farmerNameUnread: {
        color: COLORS.primary[700],
        fontWeight: '700',
    },
    diagnosisBadge: {
        marginLeft: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    districtText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginBottom: 4,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.neutral[400],
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
    cropTagsRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    cropTag: {
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 50,
        marginRight: 6,
    },
    cropTagText: {
        fontSize: 11,
        color: COLORS.primary[700],
        fontWeight: '500',
        textTransform: 'capitalize',
    },
});

export default ExpertChatsList;
