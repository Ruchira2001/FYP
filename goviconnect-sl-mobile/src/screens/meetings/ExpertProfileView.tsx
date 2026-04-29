import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components';
import { COLORS } from '../../utils/constants';
import { expertsAPI, chatAPI } from '../../services/api';

type ParamList = {
    ExpertProfileView: { expertId: string; expertName?: string };
};

const ExpertProfileView: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'ExpertProfileView'>>();
    const { expertId, expertName } = route.params;

    const [expert, setExpert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [openingChat, setOpeningChat] = useState(false);

    useEffect(() => {
        loadExpert();
    }, []);

    const loadExpert = async () => {
        try {
            const res = await expertsAPI.getExpertById(expertId);
            setExpert(res.data.data || res.data);
        } catch (e) {
            Alert.alert('Error', 'Failed to load expert profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChatWithExpert = async () => {
        if (!expertId) return;
        setOpeningChat(true);
        try {
            const res = await chatAPI.createChat({ expertId });
            const chat = res.data.data;
            const chatId = chat._id || chat.id;
            navigation.navigate('ChatDetail', {
                chatId,
                expertName: expert?.name || expertName || '',
            });
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Could not open chat.');
        } finally {
            setOpeningChat(false);
        }
    };

    const getInitials = (name: string) =>
        (name || 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

    const renderStars = (rating: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <Ionicons
                key={i}
                name={i < Math.round(rating) ? 'star' : 'star-outline'}
                size={16}
                color={i < Math.round(rating) ? '#f59e0b' : COLORS.neutral[300]}
            />
        ));

    if (loading) {
        return (
            <View style={styles.container}>
                <Header title="Expert Profile" showBack onBackPress={() => navigation.goBack()} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary[500]} />
                </View>
            </View>
        );
    }

    if (!expert) {
        return (
            <View style={styles.container}>
                <Header title="Expert Profile" showBack onBackPress={() => navigation.goBack()} />
                <View style={styles.centered}>
                    <Ionicons name="person-outline" size={48} color={COLORS.neutral[300]} />
                    <Text style={styles.errorText}>Expert not found</Text>
                </View>
            </View>
        );
    }

    const initials = getInitials(expert.name);

    return (
        <View style={styles.container}>
            <Header title="Expert Profile" showBack onBackPress={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header Card */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                        {expert.isActive !== false && <View style={styles.onlineDot} />}
                    </View>

                    {expert.isActive !== false && (
                        <View style={styles.activeBadge}>
                            <View style={styles.activeDot} />
                            <Text style={styles.activeBadgeText}>Available</Text>
                        </View>
                    )}

                    <Text style={styles.expertName}>{expert.name}</Text>
                    <Text style={styles.expertSpecialty}>{expert.specialty}</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.locationText}>{expert.district || 'Sri Lanka'}</Text>
                    </View>

                    <View style={styles.ratingRow}>
                        {renderStars(expert.rating || 0)}
                        <Text style={styles.ratingValue}>
                            {expert.rating ? expert.rating.toFixed(1) : '—'}
                        </Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{expert.yearsExperience || 0}</Text>
                        <Text style={styles.statLabel}>Yrs Exp.</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{expert.totalConsultations || 0}</Text>
                        <Text style={styles.statLabel}>Consultations</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{expert.farmersHelped || 0}</Text>
                        <Text style={styles.statLabel}>Farmers Helped</Text>
                    </View>
                </View>

                {/* About / Bio */}
                {expert.bio ? (
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="person-outline" size={18} color={COLORS.primary[500]} />
                            <Text style={styles.sectionTitle}>About</Text>
                        </View>
                        <Text style={styles.bioText}>{expert.bio}</Text>
                    </View>
                ) : null}

                {/* Qualifications */}
                {expert.qualifications && expert.qualifications.length > 0 ? (
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="school-outline" size={18} color={COLORS.primary[500]} />
                            <Text style={styles.sectionTitle}>Qualifications</Text>
                        </View>
                        {expert.qualifications.map((q: string, i: number) => (
                            <View key={i} style={styles.bulletRow}>
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary[400]} />
                                <Text style={styles.bulletText}>{q}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Specializations */}
                {expert.specializations && expert.specializations.length > 0 ? (
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="ribbon-outline" size={18} color={COLORS.primary[500]} />
                            <Text style={styles.sectionTitle}>Specializations</Text>
                        </View>
                        <View style={styles.chipsWrap}>
                            {expert.specializations.map((s: string, i: number) => (
                                <View key={i} style={styles.specChip}>
                                    <Text style={styles.specChipText}>{s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Languages */}
                {expert.languages && expert.languages.length > 0 ? (
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="language-outline" size={18} color={COLORS.primary[500]} />
                            <Text style={styles.sectionTitle}>Languages</Text>
                        </View>
                        <View style={styles.chipsWrap}>
                            {expert.languages.map((l: string, i: number) => (
                                <View key={i} style={[styles.specChip, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                                    <Text style={[styles.specChipText, { color: '#1d4ed8' }]}>{l}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom CTA Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={handleChatWithExpert}
                    disabled={openingChat}
                    activeOpacity={0.85}
                >
                    {openingChat ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                    )}
                    <Text style={styles.chatBtnText}>
                        {openingChat ? 'Opening Chat...' : 'Chat with Expert'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    errorText: { fontSize: 16, color: COLORS.neutral[500] },
    scrollContent: { paddingBottom: 20 },

    profileHeader: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    avatarCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: COLORS.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        position: 'relative',
        shadowColor: COLORS.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    avatarInitials: { fontSize: 34, fontWeight: '800', color: '#fff' },
    onlineDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22c55e',
        borderWidth: 2.5,
        borderColor: '#fff',
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
    activeBadgeText: { fontSize: 12, fontWeight: '600', color: '#15803d' },
    expertName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.neutral[900],
        marginBottom: 4,
        textAlign: 'center',
    },
    expertSpecialty: {
        fontSize: 14,
        color: COLORS.primary[600],
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    locationText: { fontSize: 13, color: COLORS.neutral[500] },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingValue: { fontSize: 14, fontWeight: '700', color: COLORS.neutral[700], marginLeft: 4 },

    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 14,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary[600] },
    statLabel: { fontSize: 11, color: COLORS.neutral[400], marginTop: 3, textAlign: 'center' },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.neutral[200],
        marginVertical: 6,
    },

    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.neutral[800] },
    bioText: { fontSize: 14, color: COLORS.neutral[600], lineHeight: 22 },

    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
    },
    bulletText: { flex: 1, fontSize: 14, color: COLORS.neutral[700], lineHeight: 20 },

    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    specChip: {
        backgroundColor: COLORS.primary[50],
        borderWidth: 1,
        borderColor: COLORS.primary[200],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    specChipText: { fontSize: 12, fontWeight: '600', color: COLORS.primary[700] },

    bottomBar: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },
    chatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.primary[600],
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: COLORS.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    chatBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default ExpertProfileView;
