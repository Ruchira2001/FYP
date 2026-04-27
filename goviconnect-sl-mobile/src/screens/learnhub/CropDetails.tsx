import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, Chip } from '../../components';
import { COLORS } from '../../utils/constants';
import { learnhubAPI } from '../../services/api';
import cropsData from '../../data/crops.json';

type ParamList = {
    CropDetails: { cropId: string };
};

type Tab = 'overview' | 'diseases' | 'treatment' | 'practices' | 'media';

const CropDetails: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'CropDetails'>>();
    const { cropId } = route.params;
    const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isSaved, setIsSaved] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [guide, setGuide] = useState<any>(null);

    const crop = cropsData.crops.find(c => c.id === cropId);

    useEffect(() => {
        loadGuide();
    }, []);

    const loadGuide = async () => {
        try {
            const res = await learnhubAPI.getGuideById(cropId);
            const data = res.data.data;
            setGuide(data);
            setIsLiked(data?.isLiked || false);
            setLikeCount(data?.likes || 0);
        } catch (e) {
            console.error('Failed to load guide:', e);
        }
        // Check saved status
        try {
            const savedRes = await learnhubAPI.getSavedGuides();
            const saved = Array.isArray(savedRes.data.data) ? savedRes.data.data : [];
            setIsSaved(saved.some((s: any) => (s._id || s.guideId) === cropId));
        } catch {}
    };

    const handleSave = async () => {
        try {
            if (isSaved) {
                await learnhubAPI.unsaveGuide(cropId);
                setIsSaved(false);
            } else {
                await learnhubAPI.saveGuide(cropId);
                setIsSaved(true);
            }
        } catch (e) {
            console.error('Save toggle error:', e);
        }
    };

    const handleDownload = async () => {
        setIsDownloaded(!isDownloaded);
    };

    const handleLike = async () => {
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        try {
            const res = await learnhubAPI.reactToGuide(cropId);
            setIsLiked(res.data.isLiked);
            setLikeCount(res.data.likeCount);
        } catch {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikeCount(prev => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
        }
    };

    const tabs: { id: Tab; labelKey: string }[] = [
        { id: 'overview', labelKey: 'learnhub.overview' },
        { id: 'diseases', labelKey: 'learnhub.diseases' },
        { id: 'treatment', labelKey: 'learnhub.treatment' },
        { id: 'practices', labelKey: 'learnhub.best_practices' },
        { id: 'media', labelKey: 'learnhub.media' },
    ];

    const renderOverview = () => (
        <View style={styles.tabContent}>
            <Text style={styles.overviewText}>
                {i18n.language === 'si' ? guide?.overview.contentSi : guide?.overview.content}
            </Text>

            <View style={styles.overviewGrid}>
                <View style={styles.overviewItem}>
                    <Text style={styles.label}>Climate</Text>
                    <Text style={styles.value}>
                        {i18n.language === 'si' ? guide?.overview.climateSi : guide?.overview.climate}
                    </Text>
                </View>

                <View style={styles.overviewItem}>
                    <Text style={styles.label}>Soil</Text>
                    <Text style={styles.value}>
                        {i18n.language === 'si' ? guide?.overview.soilSi : guide?.overview.soil}
                    </Text>
                </View>

                <View style={[styles.overviewItem, { width: '100%' }]}>
                    <Text style={styles.label}>Season</Text>
                    <Text style={styles.value}>
                        {i18n.language === 'si' ? guide?.overview.seasonSi : guide?.overview.season}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderDiseases = () => (
        <View style={styles.tabContent}>
            {guide?.diseases?.map((disease, index) => (
                <View
                    key={index}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                            {i18n.language === 'si' ? disease.nameSi : disease.name}
                        </Text>
                        <View style={[
                            styles.badge,
                            disease.severity === 'critical' ? styles.badgeCritical :
                                disease.severity === 'high' ? styles.badgeHigh : styles.badgeMedium
                        ]}>
                            <Text style={[
                                styles.badgeText,
                                disease.severity === 'critical' ? styles.textCritical :
                                    disease.severity === 'high' ? styles.textHigh : styles.textMedium
                            ]}>
                                {disease.severity}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.cardContent}>
                        {i18n.language === 'si' ? disease.symptomsSi : disease.symptoms}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderTreatment = () => (
        <View style={styles.tabContent}>
            {guide?.treatments?.map((treatment, index) => (
                <View key={index} style={styles.treatmentContainer}>
                    <Text style={[styles.cardTitle, { marginBottom: 8 }]}>
                        {treatment.disease}
                    </Text>
                    {(i18n.language === 'si' ? treatment.methodsSi : treatment.methods)?.map((method, mIndex) => (
                        <View key={mIndex} style={styles.methodRow}>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} style={{ marginTop: 2 }} />
                            <Text style={styles.methodText}>{method}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );

    const renderPractices = () => (
        <View style={styles.tabContent}>
            {guide?.bestPractices?.map((practice, index) => (
                <View
                    key={index}
                    style={styles.practiceCard}
                >
                    <Text style={styles.practiceTitle}>
                        {i18n.language === 'si' ? practice.titleSi : practice.title}
                    </Text>
                    <Text style={styles.practiceContent}>
                        {i18n.language === 'si' ? practice.contentSi : practice.content}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderMedia = () => (
        <View style={styles.tabContent}>
            <Text style={styles.mediaDescription}>
                Videos and images related to {crop?.name} cultivation.
            </Text>

            {guide?.media?.videos?.map((video: string, index: number) => (
                <TouchableOpacity
                    key={index}
                    style={styles.videoPlaceholder}
                    onPress={() => video && Linking.openURL(video).catch(() => {})}
                >
                    <Ionicons name="play-circle" size={48} color={COLORS.primary[400]} />
                    <Text style={styles.videoText} numberOfLines={2}>{video}</Text>
                </TouchableOpacity>
            ))}

            {guide?.media?.images && guide.media.images.length > 0 && (
                <View style={styles.imageGrid}>
                    {guide.media.images.map((image: string, index: number) => (
                        <View key={index} style={styles.imageWrapper}>
                            {image ? (
                                <Image
                                    source={{ uri: image }}
                                    style={styles.imageThumbnail}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="image" size={24} color={COLORS.neutral[400]} />
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {(!guide?.media?.videos?.length && !guide?.media?.images?.length) && (
                <View style={styles.noMediaContainer}>
                    <Ionicons name="images-outline" size={48} color={COLORS.neutral[300]} />
                    <Text style={styles.noMediaText}>No media available yet</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Header
                title={i18n.language === 'si' ? guide?.titleSi || crop?.nameSi : guide?.title || crop?.name}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Hero Section */}
            <View
                style={[
                    styles.heroSection,
                    { backgroundColor: (crop?.color || COLORS.primary[500]) + '20' }
                ]}
            >
                <Text style={styles.heroEmoji}>{crop?.icon}</Text>
                <Text style={[styles.heroTitle, { color: crop?.color || COLORS.primary[600] }]}>
                    {i18n.language === 'si' ? crop?.nameSi : crop?.name}
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[
                        styles.actionButton,
                        { marginRight: 8 },
                        isSaved ? styles.actionButtonActive : styles.actionButtonInactive
                    ]}
                >
                    <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={isSaved ? 'white' : COLORS.neutral[600]}
                    />
                    <Text style={[
                        styles.actionButtonText,
                        isSaved ? styles.textWhite : styles.textNeutral
                    ]}>
                        {isSaved ? t('learnhub.saved') : t('learnhub.save')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDownload}
                    style={[
                        styles.actionButton,
                        isDownloaded ? styles.downloadButtonActive : styles.actionButtonInactive
                    ]}
                >
                    <Ionicons
                        name={isDownloaded ? 'cloud-done' : 'cloud-download-outline'}
                        size={18}
                        color={isDownloaded ? 'white' : COLORS.neutral[600]}
                    />
                    <Text style={[
                        styles.actionButtonText,
                        isDownloaded ? styles.textWhite : styles.textNeutral
                    ]}>
                        {isDownloaded ? t('learnhub.downloaded') : t('learnhub.download')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLike}
                    style={[
                        styles.actionButton,
                        isLiked ? styles.likeButtonActive : styles.actionButtonInactive
                    ]}
                >
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isLiked ? 'white' : COLORS.neutral[600]}
                    />
                    <Text style={[
                        styles.actionButtonText,
                        isLiked ? styles.textWhite : styles.textNeutral
                    ]}>
                        {likeCount > 0 ? likeCount.toString() : 'Like'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            style={[
                                styles.tab,
                                activeTab === tab.id ? styles.tabActive : styles.tabInactive
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === tab.id ? styles.textWhite : styles.textNeutral
                            ]}>
                                {t(tab.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'diseases' && renderDiseases()}
                {activeTab === 'treatment' && renderTreatment()}
                {activeTab === 'practices' && renderPractices()}
                {activeTab === 'media' && renderMedia()}
                <View style={{ height: 24 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    heroSection: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    heroEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        padding: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonActive: {
        backgroundColor: COLORS.primary[500],
    },
    downloadButtonActive: {
        backgroundColor: COLORS.success,
    },
    actionButtonInactive: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    actionButtonText: {
        marginLeft: 8,
        fontWeight: '500',
    },
    textWhite: {
        color: '#ffffff',
    },
    textNeutral: {
        color: COLORS.neutral[700],
    },
    tabsContainer: {
        marginBottom: 8,
    },
    tabsContent: {
        paddingHorizontal: 16,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 50,
    },
    tabActive: {
        backgroundColor: COLORS.primary[500],
    },
    tabInactive: {
        backgroundColor: COLORS.neutral[200],
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    contentScroll: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    overviewText: {
        fontSize: 16,
        color: COLORS.neutral[700],
        lineHeight: 24,
        marginBottom: 16,
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    overviewItem: {
        width: '50%',
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        color: COLORS.neutral[700],
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 50,
    },
    badgeCritical: { backgroundColor: '#fee2e2' },
    badgeHigh: { backgroundColor: '#ffedd5' },
    badgeMedium: { backgroundColor: '#fef9c3' },
    badgeText: { fontSize: 12, fontWeight: '500' },
    textCritical: { color: COLORS.error },
    textHigh: { color: '#ea580c' },
    textMedium: { color: '#ca8a04' },
    cardContent: {
        fontSize: 14,
        color: COLORS.neutral[600],
    },
    treatmentContainer: {
        marginBottom: 16,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    methodText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.neutral[700],
    },
    practiceCard: {
        backgroundColor: COLORS.primary[50],
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    practiceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary[800],
        marginBottom: 8,
    },
    practiceContent: {
        fontSize: 14,
        color: COLORS.primary[700],
    },
    mediaDescription: {
        fontSize: 14,
        color: COLORS.neutral[500],
        marginBottom: 16,
    },
    videoPlaceholder: {
        backgroundColor: COLORS.neutral[100],
        borderRadius: 12,
        height: 160,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoText: {
        color: COLORS.neutral[500],
        marginTop: 8,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
        marginTop: 8,
    },
    imageWrapper: {
        width: '33.33%',
        padding: 4,
    },
    imagePlaceholder: {
        backgroundColor: COLORS.neutral[200],
        borderRadius: 8,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageThumbnail: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: COLORS.neutral[200],
    },
    noMediaContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noMediaText: {
        fontSize: 14,
        color: COLORS.neutral[400],
        marginTop: 12,
    },
    likeButtonActive: {
        backgroundColor: '#ef4444',
    },
});

export default CropDetails;
