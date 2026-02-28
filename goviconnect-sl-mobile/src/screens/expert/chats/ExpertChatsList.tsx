import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { getRelativeTime } from '../../../utils/validators';
import { chatAPI } from '../../../services/api';

const CATEGORIES = ['All', 'Unread', 'Active Diagnosis', 'Recent'];

const ExpertChatsList: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [activeCategory, setActiveCategory] = useState('All');
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        try {
            const res = await chatAPI.getChats();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setChats(data.map((c: any) => ({
                id: c._id || c.id,
                farmerId: c.farmer?._id || c.farmerId,
                farmerName: c.farmer?.name || c.farmerName || 'Farmer',
                lastMessage: c.lastMessage?.content || '',
                lastMessageTime: c.lastMessage?.createdAt || c.updatedAt,
                unreadCount: c.unreadCount || 0,
                hasActiveDiagnosis: c.hasActiveDiagnosis || false,
                online: false,
            })));
        } catch (e) {
            console.error('Failed to load expert chats:', e);
        }
    };

    const filteredChats = chats.filter(chat => {
        if (activeCategory === 'Unread') return chat.unreadCount > 0;
        if (activeCategory === 'Active Diagnosis') return chat.hasActiveDiagnosis;
        return true;
    });

    const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

    const renderChat = ({ item }: { item: typeof expertData.farmerChats[0] }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ExpertChatDetail', { chatId: item.id, farmerName: item.farmerName })}
            style={styles.chatCard}
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
                        <Text style={styles.farmerName}>{item.farmerName}</Text>
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

                <Text style={styles.districtText}>
                    <Ionicons name="location-outline" size={12} color={COLORS.neutral[400]} />
                    {' '}{item.farmerDistrict}
                </Text>

                <View style={styles.messageRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {i18n.language === 'si' ? item.lastMessageSi : item.lastMessage}
                    </Text>

                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>

                {/* Farmer Crops */}
                <View style={styles.cropTagsRow}>
                    {item.farmerCrops.slice(0, 3).map((crop, idx) => (
                        <View key={idx} style={styles.cropTag}>
                            <Text style={styles.cropTagText}>{crop}</Text>
                        </View>
                    ))}
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
