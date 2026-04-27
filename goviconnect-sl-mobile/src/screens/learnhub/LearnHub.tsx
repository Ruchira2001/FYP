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
    const [crops, setCrops] = useState<any[]>([]);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [communityGuides, setCommunityGuides] = useState<any[]>([]);
    const [myGuides, setMyGuides] = useState<any[]>([]);
    const [loadingCommunity, setLoadingCommunity] = useState(false);
    const [loadingMy, setLoadingMy] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<any | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadOfficialData();
            if (activeTab === 'community') loadCommunityGuides();
            if (activeTab === 'myguides') loadMyGuides();
        }, [activeTab])
    );

    const loadOfficialData = async () => {
        try {
            const [cropsRes, savedRes, communityRes] = await Promise.all([
                feedAPI.getCrops().catch(() => ({ data: { data: [] } })),
                learnhubAPI.getSavedGuides().catch(() => ({ data: { data: [] } })),
                learnhubAPI.getCommunityGuides({}).catch(() => ({ data: { data: [] } })),
            ]);
            setCrops(Array.isArray(cropsRes.data.data) ? cropsRes.data.data : []);
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

    const filteredCrops = crops.filter((crop: any) => {
        const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            (crop.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (crop.nameSi || '').includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        if (status === 'approved') return { bg: '#dcfce7', text: '#15803d' };
        if (status === 'rejected') return { bg: '#fee2e2', text: '#dc2626' };
        return { bg: '#fef9c3', text: '#a16207' };
    };

    const renderCropItem = ({ item }: { item: any }) => {
        const isSaved = savedIds.includes(item._id || item.id);
        return (
            <View style={styles.cropCardWrapper}>
                <CropCard
                    id={item._id || item.id}
                    name={item.name || ''}
                    nameSi={item.nameSi || ''}
                    category={item.category || ''}
                    emoji={item.icon || '🌱'}
                    color={item.color || '#22c55e'}
                    onPress={() => navigation.navigate('CropDetails', { cropId: item._id || item.id })}
                    isSaved={isSaved}
                    isDownloaded={false}
                    locale={i18n.language}
                    size="md"
                />
            </View>
        );
    };

    const renderCommunityCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.communityCard}
            activeOpacity={0.85}
            onPress={() => setSelectedGuide(item)}
        >
            {item.images && item.images.length > 0 ? (
                <Image source={{ uri: item.images[0] }} style={styles.communityCardImage} />
            ) : (
                <View style={[styles.communityCardImage, styles.communityCardImagePlaceholder]}>
                    <Text style={{ fontSize: 32 }}>🌿</Text>
                </View>
            )}
            <View style={styles.communityCardBody}>
                <Text style={styles.communityCardName} numberOfLines={1}>{item.name}</Text>
                {item.category ? (
                    <Text style={styles.communityCardCategory}>{item.category}</Text>
                ) : null}
                <Text style={styles.communityCardDesc} numberOfLines={2}>
                    {item.description || 'No description provided.'}
                </Text>
                <View style={styles.communityCardFooter}>
                    <View style={styles.communityCardAuthor}>
                        <Ionicons name="person-circle-outline" size={16} color={COLORS.neutral[400]} />
                        <Text style={styles.communityCardAuthorText} numberOfLines={1}>
                            {item.userId?.name || 'Farmer'}
                        </Text>
                    </View>
                    <View style={styles.communityCardLikes}>
                        <Ionicons name="heart" size={14} color="#ef4444" />
                        <Text style={styles.communityCardLikeText}>{item.likeCount || 0}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                        data={filteredCrops}
                        renderItem={renderCropItem}
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
                        ListFooterComponent={
                            communityGuides.length > 0 ? (
                                <View style={styles.approvedGuidesSection}>
                                    <View style={styles.approvedGuidesHeader}>
                                        <Ionicons name="people" size={18} color={COLORS.primary[600]} />
                                        <Text style={styles.approvedGuidesTitle}>
                                            Approved Farmer Guides ({communityGuides.length})
                                        </Text>
                                    </View>
                                    {communityGuides.map((item) => (
                                        <TouchableOpacity
                                            key={item._id || item.id}
                                            style={styles.communityCard}
                                            activeOpacity={0.85}
                                            onPress={() => setSelectedGuide(item)}
                                        >
                                            {item.images && item.images.length > 0 ? (
                                                <Image source={{ uri: item.images[0] }} style={styles.communityCardImage} />
                                            ) : (
                                                <View style={[styles.communityCardImage, styles.communityCardImagePlaceholder]}>
                                                    <Text style={{ fontSize: 32 }}>🌿</Text>
                                                </View>
                                            )}
                                            <View style={styles.communityCardBody}>
                                                <Text style={styles.communityCardName} numberOfLines={1}>{item.name}</Text>
                                                {item.category ? (
                                                    <Text style={styles.communityCardCategory}>{item.category}</Text>
                                                ) : null}
                                                <Text style={styles.communityCardDesc} numberOfLines={2}>
                                                    {item.description || 'No description provided.'}
                                                </Text>
                                                <View style={styles.communityCardFooter}>
                                                    <View style={styles.communityCardAuthor}>
                                                        <Ionicons name="person-circle-outline" size={16} color={COLORS.neutral[400]} />
                                                        <Text style={styles.communityCardAuthorText} numberOfLines={1}>
                                                            {item.userId?.name || 'Farmer'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.communityCardLikes}>
                                                        <Ionicons name="heart" size={14} color="#ef4444" />
                                                        <Text style={styles.communityCardLikeText}>{item.likeCount || 0}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : null
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
                            contentContainerStyle={{ padding: 16 }}
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

            <Modal
                visible={!!selectedGuide}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedGuide(null)}
            >
                <View style={styles.guideModalOverlay}>
                    <View style={styles.guideModalSheet}>
                        <View style={styles.guideModalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.guideModalTitle} numberOfLines={2}>
                                    {selectedGuide?.name || 'Guide Details'}
                                </Text>
                                <Text style={styles.guideModalMeta} numberOfLines={1}>
                                    {selectedGuide?.category || 'Farmer guide'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedGuide(null)}>
                                <Ionicons name="close" size={22} color={COLORS.neutral[600]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.guideModalContent}>
                            {selectedGuide?.images?.[0] ? (
                                <Image source={{ uri: selectedGuide.images[0] }} style={styles.guideModalImage} />
                            ) : (
                                <View style={[styles.guideModalImage, styles.guideModalImagePlaceholder]}>
                                    <Text style={{ fontSize: 44 }}>🌿</Text>
                                </View>
                            )}

                            <View style={styles.guideModalSection}>
                                <Text style={styles.guideModalLabel}>Description</Text>
                                <Text style={styles.guideModalText}>{selectedGuide?.description || 'No description provided.'}</Text>
                            </View>

                            <View style={styles.guideModalGrid}>
                                <View style={styles.guideModalItem}>
                                    <Text style={styles.guideModalLabel}>Author</Text>
                                    <Text style={styles.guideModalText}>{selectedGuide?.userId?.name || 'Farmer'}</Text>
                                </View>
                                <View style={styles.guideModalItem}>
                                    <Text style={styles.guideModalLabel}>Likes</Text>
                                    <Text style={styles.guideModalText}>{selectedGuide?.likeCount || 0}</Text>
                                </View>
                            </View>

                            {selectedGuide?.climate || selectedGuide?.soil || selectedGuide?.season ? (
                                <View style={styles.guideModalSection}>
                                    <Text style={styles.guideModalLabel}>Growing Details</Text>
                                    {selectedGuide?.climate ? <Text style={styles.guideModalDetail}>Climate: {selectedGuide.climate}</Text> : null}
                                    {selectedGuide?.soil ? <Text style={styles.guideModalDetail}>Soil: {selectedGuide.soil}</Text> : null}
                                    {selectedGuide?.season ? <Text style={styles.guideModalDetail}>Season: {selectedGuide.season}</Text> : null}
                                </View>
                            ) : null}

                            {selectedGuide?.diseases || selectedGuide?.treatments || selectedGuide?.practices ? (
                                <View style={styles.guideModalSection}>
                                    <Text style={styles.guideModalLabel}>Guide Notes</Text>
                                    {selectedGuide?.diseases ? <Text style={styles.guideModalDetail}>Diseases: {selectedGuide.diseases}</Text> : null}
                                    {selectedGuide?.treatments ? <Text style={styles.guideModalDetail}>Treatments: {selectedGuide.treatments}</Text> : null}
                                    {selectedGuide?.practices ? <Text style={styles.guideModalDetail}>Practices: {selectedGuide.practices}</Text> : null}
                                </View>
                            ) : null}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    // Community card
    communityCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginBottom: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        elevation: 2,
    },
    communityCardImage: { width: '100%', height: 140, resizeMode: 'cover' },
    communityCardImagePlaceholder: {
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.primary[50],
    },
    communityCardBody: { padding: 12 },
    communityCardName: { fontSize: 16, fontWeight: '700', color: COLORS.neutral[900] },
    communityCardCategory: { fontSize: 12, color: COLORS.primary[600], marginTop: 2, marginBottom: 4 },
    communityCardDesc: { fontSize: 13, color: COLORS.neutral[600], lineHeight: 18 },
    communityCardFooter: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 8,
    },
    communityCardAuthor: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    communityCardAuthorText: { fontSize: 12, color: COLORS.neutral[500], marginLeft: 4 },
    communityCardLikes: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    communityCardLikeText: { fontSize: 12, color: COLORS.neutral[500] },
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
