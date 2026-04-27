import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TextInput, FlatList, TouchableOpacity, Modal,
    StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, Chip, CropCard, EmptyState } from '../../components';
import { COLORS, CROP_CATEGORIES } from '../../utils/constants';
import { learnhubAPI, feedAPI } from '../../services/api';

type TabType = 'official' | 'community' | 'myguides';

const LearnHub: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab] = useState<TabType>('official');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [communityGuides, setCommunityGuides] = useState<any[]>([]);
    const [myGuides, setMyGuides] = useState<any[]>([]);
    const [loadingCommunity, setLoadingCommunity] = useState(false);
    const [loadingMy, setLoadingMy] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<any | null>(null);
    const [reactingGuideIds, setReactingGuideIds] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadOfficialData();
            if (activeTab === 'community') loadCommunityGuides();
            if (activeTab === 'myguides') loadMyGuides();
        }, [activeTab])
    );

    const loadOfficialData = async () => {
        try {
            const [savedRes, communityRes] = await Promise.all([
                learnhubAPI.getSavedGuides().catch(() => ({ data: { data: [] } })),
                learnhubAPI.getCommunityGuides({}).catch(() => ({ data: { data: [] } })),
            ]);
            const saved = Array.isArray(savedRes.data.data) ? savedRes.data.data : [];
            setSavedIds(saved.map((s: any) => s._id || s.id || s.guideId));
            const approvedGuides = Array.isArray(communityRes.data.data) ? communityRes.data.data : [];
            setCommunityGuides(approvedGuides);
        } catch (e) {
            console.error('LearnHub load error:', e);
        }
    };

    const loadCommunityGuides = async () => {
        setLoadingCommunity(true);
        try {
            const res = await learnhubAPI.getCommunityGuides({});
            setCommunityGuides(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) {
            console.error('Community guides error:', e);
        } finally {
            setLoadingCommunity(false);
        }
    };

    const loadMyGuides = async () => {
        setLoadingMy(true);
        try {
            const res = await learnhubAPI.getUserGuides();
            setMyGuides(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (e) {
            console.error('My guides error:', e);
        } finally {
            setLoadingMy(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'community' && communityGuides.length === 0) loadCommunityGuides();
        if (tab === 'myguides' && myGuides.length === 0) loadMyGuides();
    };

    const patchGuide = (guideId: string, patch: (guide: any) => any) => {
        setCommunityGuides((prev) => prev.map((guide) => {
            const id = guide._id || guide.id;
            return id === guideId ? patch(guide) : guide;
        }));

        setSelectedGuide((prev) => {
            if (!prev) return prev;
            const id = prev._id || prev.id;
            return id === guideId ? patch(prev) : prev;
        });
    };

    const handleGuideReaction = async (guideId: string) => {
        if (!guideId || reactingGuideIds.includes(guideId)) return;

        const current = communityGuides.find((guide) => (guide._id || guide.id) === guideId);
        if (!current) return;

        const wasLiked = !!current.isLiked;
        const previousCount = Number(current.likeCount || 0);
        const optimisticCount = wasLiked ? Math.max(0, previousCount - 1) : previousCount + 1;

        patchGuide(guideId, (guide) => ({ ...guide, isLiked: !wasLiked, likeCount: optimisticCount }));
        setReactingGuideIds((prev) => [...prev, guideId]);

        try {
            const res = await learnhubAPI.reactToCommunityGuide(guideId);
            patchGuide(guideId, (guide) => ({
                ...guide,
                isLiked: !!res.data.isLiked,
                likeCount: Number(res.data.likeCount || 0),
            }));
        } catch {
            patchGuide(guideId, (guide) => ({ ...guide, isLiked: wasLiked, likeCount: previousCount }));
        } finally {
            setReactingGuideIds((prev) => prev.filter((id) => id !== guideId));
        }
    };

    const filteredCommunityGuides = communityGuides.filter((guide: any) => {
        const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            (guide.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (guide.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        if (status === 'approved') return { bg: '#dcfce7', text: '#15803d' };
        if (status === 'rejected') return { bg: '#fee2e2', text: '#dc2626' };
        return { bg: '#fef9c3', text: '#a16207' };
    };


    const renderFarmerGuideCard = (item: any) => {
        const guideId = item._id || item.id;
        const isReacting = reactingGuideIds.includes(guideId);
        const isLiked = !!item.isLiked;

        return (
            <TouchableOpacity
                key={guideId}
                style={styles.farmerGuideTile}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('FarmerGuideDetails', { guide: item })}
            >
                {item.images && item.images.length > 0 ? (
                    <Image source={{ uri: item.images[0] }} style={styles.farmerGuideThumb} />
                ) : (
                    <View style={[styles.farmerGuideThumb, styles.farmerGuideThumbPlaceholder]}>
                        <Text style={{ fontSize: 28 }}>🌿</Text>
                    </View>
                )}

                <View style={styles.farmerGuideTopRow}>
                    <Text style={styles.farmerGuideCategory} numberOfLines={1}>{item.category || 'Guide'}</Text>
                    <TouchableOpacity
                        onPress={() => handleGuideReaction(guideId)}
                        disabled={isReacting}
                        style={styles.farmerGuideReactBtn}
                    >
                        <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={16} color={isLiked ? '#ef4444' : COLORS.neutral[500]} />
                        <Text style={styles.farmerGuideReactCount}>{item.likeCount || 0}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.farmerGuideTitle} numberOfLines={1}>{item.name || 'Farmer Guide'}</Text>
                <Text style={styles.farmerGuideDesc} numberOfLines={2}>{item.description || 'No description provided.'}</Text>

                <View style={styles.farmerGuideAuthorRow}>
                    <Ionicons name="person-circle-outline" size={15} color={COLORS.neutral[400]} />
                    <Text style={styles.farmerGuideAuthorText} numberOfLines={1}>{item.userId?.name || 'Farmer'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderCommunityCard = ({ item }: { item: any }) => renderFarmerGuideCard(item);

    const renderMyGuideCard = ({ item }: { item: any }) => {
        const sc = getStatusColor(item.status);
        return (
            <View style={styles.myGuideCard}>
                <View style={styles.myGuideCardLeft}>
                    {item.images && item.images.length > 0 ? (
                        <Image source={{ uri: item.images[0] }} style={styles.myGuideThumb} />
                    ) : (
                        <View style={[styles.myGuideThumb, styles.myGuideThumbPlaceholder]}>
                            <Text style={{ fontSize: 24 }}>🌱</Text>
                        </View>
                    )}
                </View>
                <View style={styles.myGuideCardBody}>
                    <Text style={styles.myGuideCardName} numberOfLines={1}>{item.name}</Text>
                    {item.category ? (
                        <Text style={styles.myGuideCardCategory}>{item.category}</Text>
                    ) : null}
                    <Text style={styles.myGuideCardDesc} numberOfLines={2}>
                        {item.description || 'No description.'}
                    </Text>
                    <View style={[styles.myGuideStatusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.myGuideStatusText, { color: sc.text }]}>
                            {(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title={t('learnhub.title')} showBack onBackPress={() => navigation.goBack()} />

            {/* Tabs */}
            <View style={styles.tabRow}>
                {([
                    { key: 'official', label: 'Official' },
                    { key: 'community', label: 'Community' },
                    { key: 'myguides', label: 'My Guides' },
                ] as { key: TabType; label: string }[]).map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                        onPress={() => handleTabChange(tab.key)}
                    >
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── OFFICIAL TAB ── */}
            {activeTab === 'official' && (
                <>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t('learnhub.search_placeholder')}
                                placeholderTextColor={COLORS.neutral[400]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color={COLORS.neutral[400]} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Category Chips */}
                    <View style={styles.categoriesContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                            {CROP_CATEGORIES.map((category) => (
                                <Chip
                                    key={category.id}
                                    label={i18n.language === 'si' ? category.nameSi : category.nameEn}
                                    selected={selectedCategory === category.id}
                                    onPress={() => setSelectedCategory(category.id)}
                                    variant="outline"
                                    size="md"
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* Quick Links */}
                    <View style={styles.quickLinksContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SavedLibrary')}
                            style={[styles.quickLink, { backgroundColor: COLORS.primary[50], marginRight: 12 }]}
                        >
                            <Ionicons name="bookmark" size={18} color={COLORS.primary[600]} />
                            <Text style={[styles.quickLinkText, { color: COLORS.primary[700] }]}>
                                {t('learnhub.saved_library')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('OfflineDownloads')}
                            style={[styles.quickLink, { backgroundColor: '#f0fdf4' }]}
                        >
                            <Ionicons name="cloud-download" size={18} color={COLORS.success} />
                            <Text style={[styles.quickLinkText, { color: '#15803d' }]}>
                                {t('learnhub.offline_downloads')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={filteredCommunityGuides}
                        renderItem={renderCommunityCard}
                        keyExtractor={(item) => item._id || item.id}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                variant="search"
                                title={t('empty_states.no_results')}
                                description={t('empty_states.no_results_desc')}
                            />
                        }
                    />
                </>
            )}

            {/* ── COMMUNITY TAB ── */}
            {activeTab === 'community' && (
                <View style={{ flex: 1 }}>
                    {loadingCommunity ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={COLORS.primary[500]} />
                        </View>
                    ) : communityGuides.length === 0 ? (
                        <EmptyState
                            icon="people-outline"
                            title="No Community Guides Yet"
                            description="Approved farmer-submitted guides will appear here."
                        />
                    ) : (
                        <FlatList
                            data={communityGuides}
                            renderItem={renderCommunityCard}
                            keyExtractor={(item) => item._id || item.id}
                            numColumns={2}
                            contentContainerStyle={{ padding: 16 }}
                            columnWrapperStyle={styles.columnWrapper}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            )}

            {/* ── MY GUIDES TAB ── */}
            {activeTab === 'myguides' && (
                <View style={{ flex: 1 }}>
                    {loadingMy ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={COLORS.primary[500]} />
                        </View>
                    ) : (
                        <FlatList
                            data={myGuides}
                            renderItem={renderMyGuideCard}
                            keyExtractor={(item) => item._id || item.id}
                            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <EmptyState
                                    icon="document-text-outline"
                                    title="No Guides Yet"
                                    description="Submit your first crop guide using the button below."
                                />
                            }
                        />
                    )}
                    {/* FAB */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => navigation.navigate('AddCropGuide')}
                    >
                        <Ionicons name="add" size={26} color="#fff" />
                        <Text style={styles.fabText}>Add Guide</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[200],
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabItemActive: {
        borderBottomColor: COLORS.primary[600],
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[500],
    },
    tabLabelActive: {
        color: COLORS.primary[700],
        fontWeight: '700',
    },
    searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.neutral[800] },
    categoriesContainer: { marginBottom: 8 },
    categoriesContent: { paddingHorizontal: 16, paddingBottom: 8 },
    quickLinksContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
    quickLink: {
        flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    },
    quickLinkText: { fontWeight: '500', marginLeft: 8, fontSize: 14 },
    listContent: { padding: 16 },
    columnWrapper: { justifyContent: 'space-between' },
    cropCardWrapper: { width: '48%', marginBottom: 16 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    farmerGuideTile: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    farmerGuideThumb: {
        width: '100%',
        height: 96,
        borderRadius: 12,
        resizeMode: 'cover',
        marginBottom: 8,
    },
    farmerGuideThumbPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary[50],
    },
    farmerGuideTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
        gap: 8,
    },
    farmerGuideCategory: {
        fontSize: 11,
        color: COLORS.primary[700],
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        overflow: 'hidden',
        flex: 1,
    },
    farmerGuideReactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: COLORS.neutral[100],
    },
    farmerGuideReactCount: {
        fontSize: 11,
        color: COLORS.neutral[600],
        fontWeight: '600',
    },
    farmerGuideTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.neutral[900],
        marginBottom: 4,
    },
    farmerGuideDesc: {
        fontSize: 12,
        color: COLORS.neutral[600],
        lineHeight: 16,
        marginBottom: 8,
        minHeight: 32,
    },
    farmerGuideAuthorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    farmerGuideAuthorText: {
        fontSize: 11,
        color: COLORS.neutral[500],
        flex: 1,
    },
    approvedGuidesSection: {
        marginTop: 8,
        marginBottom: 8,
    },
    approvedGuidesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    approvedGuidesTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.neutral[900],
    },
    approvedGuidesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    guideModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'flex-end',
    },
    guideModalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
        maxHeight: '88%',
    },
    guideModalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
    },
    guideModalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.neutral[900],
    },
    guideModalMeta: {
        marginTop: 4,
        fontSize: 12,
        color: COLORS.primary[600],
        fontWeight: '600',
    },
    guideModalContent: {
        paddingBottom: 10,
    },
    guideModalImage: {
        width: '100%',
        height: 180,
        borderRadius: 18,
        marginBottom: 14,
        resizeMode: 'cover',
    },
    guideModalImagePlaceholder: {
        backgroundColor: COLORS.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    guideModalSection: {
        marginBottom: 14,
    },
    guideModalLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    guideModalText: {
        fontSize: 14,
        lineHeight: 21,
        color: COLORS.neutral[700],
    },
    guideModalGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },
    guideModalItem: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
        borderRadius: 14,
        padding: 12,
    },
    guideModalReactionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    guideModalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    guideModalActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.neutral[100],
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
    },
    guideModalActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.neutral[600],
    },
    guideModalDetail: {
        fontSize: 14,
        color: COLORS.neutral[700],
        marginBottom: 4,
    },
    // My Guide card
    myGuideCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        elevation: 1,
    },
    myGuideCardLeft: { padding: 12 },
    myGuideThumb: { width: 72, height: 72, borderRadius: 10, resizeMode: 'cover' },
    myGuideThumbPlaceholder: {
        backgroundColor: COLORS.primary[50],
        alignItems: 'center', justifyContent: 'center',
    },
    myGuideCardBody: { flex: 1, padding: 12 },
    myGuideCardName: { fontSize: 15, fontWeight: '700', color: COLORS.neutral[900] },
    myGuideCardCategory: { fontSize: 12, color: COLORS.primary[600], marginTop: 1, marginBottom: 4 },
    myGuideCardDesc: { fontSize: 13, color: COLORS.neutral[600], lineHeight: 18 },
    myGuideStatusBadge: {
        alignSelf: 'flex-start', borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
    },
    myGuideStatusText: { fontSize: 11, fontWeight: '600' },
    // FAB
    fab: {
        position: 'absolute', bottom: 24, right: 20,
        backgroundColor: COLORS.primary[600],
        borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center', elevation: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2, shadowRadius: 6,
    },
    fabText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 },
});

export default LearnHub;
