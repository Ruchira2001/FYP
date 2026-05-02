import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../components';
import { chatAPI, expertsAPI } from '../../services/api';
import { COLORS } from '../../utils/constants';

type ExpertItem = {
    id: string;
    name: string;
    specialty?: string;
    district?: string;
    isOnline?: boolean;
};

const NewChat: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [experts, setExperts] = useState<ExpertItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [startingChatFor, setStartingChatFor] = useState<string | null>(null);

    const loadExperts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await expertsAPI.listExperts();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setExperts(
                data.map((expert: any) => ({
                    id: expert._id || expert.id,
                    name: expert.name || 'Expert',
                    specialty: expert.specialty || '',
                    district: expert.district || '',
                    isOnline: !!expert.isOnline,
                }))
            );
        } catch (error) {
            console.error('Failed to load experts:', error);
            Alert.alert('Error', 'Unable to load experts right now. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadExperts();
        }, [loadExperts])
    );

    const handleStartChat = async (expert: ExpertItem) => {
        if (startingChatFor) return;

        try {
            setStartingChatFor(expert.id);
            const res = await chatAPI.createChat({ expertId: expert.id });
            const chat = res.data?.data;
            const chatId = chat?._id || chat?.id;

            if (!chatId) {
                throw new Error('Missing chat id in response');
            }

            navigation.replace('ChatDetail', {
                chatId,
                expertName: expert.name,
            });
        } catch (error) {
            console.error('Failed to start chat:', error);
            Alert.alert('Error', 'Could not start chat with this expert. Please try again.');
        } finally {
            setStartingChatFor(null);
        }
    };

    const normalizedSearch = search.trim().toLowerCase();
    const filteredExperts = experts.filter((expert) => {
        if (!normalizedSearch) return true;
        return (
            expert.name.toLowerCase().includes(normalizedSearch) ||
            (expert.specialty || '').toLowerCase().includes(normalizedSearch) ||
            (expert.district || '').toLowerCase().includes(normalizedSearch)
        );
    });

    return (
        <View style={styles.container}>
            <Header
                title="Start New Chat"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color={COLORS.neutral[400]} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search experts by name, specialty, district"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color={COLORS.primary[600]} />
                    <Text style={styles.loaderText}>Loading experts...</Text>
                </View>
            ) : filteredExperts.length === 0 ? (
                <EmptyState
                    icon="people-outline"
                    title="No experts found"
                    description="Try changing your search to find an expert."
                />
            ) : (
                <FlatList
                    data={filteredExperts}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isStarting = startingChatFor === item.id;
                        return (
                            <TouchableOpacity
                                style={styles.card}
                                activeOpacity={0.85}
                                onPress={() => handleStartChat(item)}
                                disabled={!!startingChatFor}
                            >
                                <View style={styles.avatarWrap}>
                                    <View style={styles.avatar}>
                                        <Ionicons name="person" size={20} color={COLORS.primary[700]} />
                                    </View>
                                    {item.isOnline && <View style={styles.onlineDot} />}
                                </View>

                                <View style={styles.mainInfo}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.meta}>
                                        {item.specialty || 'Agriculture Expert'}
                                    </Text>
                                    {item.district ? <Text style={styles.meta}>{item.district}</Text> : null}
                                </View>

                                <View style={styles.actionWrap}>
                                    {isStarting ? (
                                        <ActivityIndicator size="small" color={COLORS.primary[600]} />
                                    ) : (
                                        <>
                                            <Text style={styles.actionText}>Chat</Text>
                                            <Ionicons name="chevron-forward" size={16} color={COLORS.primary[600]} />
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
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
    searchBox: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        height: 46,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: COLORS.neutral[700],
        fontSize: 14,
    },
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderText: {
        marginTop: 10,
        color: COLORS.neutral[500],
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrap: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineDot: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    mainInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.neutral[800],
    },
    meta: {
        marginTop: 2,
        fontSize: 12,
        color: COLORS.neutral[500],
    },
    actionWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        color: COLORS.primary[600],
        fontSize: 13,
        fontWeight: '700',
        marginRight: 2,
    },
});

export default NewChat;
