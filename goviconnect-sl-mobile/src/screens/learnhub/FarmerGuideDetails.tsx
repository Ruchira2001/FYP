import React, { useEffect, useState } from 'react';
import {
    Image,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppNotify, Header } from '../../components';
import { learnhubAPI } from '../../services/api';
import { getSavedLearnHub, saveLearnHubItem } from '../../services/storage';
import { COLORS } from '../../utils/constants';
import { getCropImage } from '../../utils/cropImages';

type ParamList = {
    FarmerGuideDetails: { guide: any };
};

const FarmerGuideDetails: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'FarmerGuideDetails'>>();
    const { guide: initialGuide } = route.params;

    const [guide, setGuide] = useState(initialGuide);
    const [isSaved, setIsSaved] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [reacting, setReacting] = useState(false);

    const guideId = guide._id || guide.id;
    const guideTitle = guide.name || guide.title || 'Farmer Guide';
    const authorName = guide.userId?.name || guide.authorName || 'Farmer';
    const cropImage = getCropImage(guide.cropId, guide.name);
    const uploadedImages = [
        ...(guide.imageUrl ? [guide.imageUrl] : []),
        ...(Array.isArray(guide.images) ? guide.images : []),
    ].filter(Boolean);
    const uploadedVideos = [
        ...(Array.isArray(guide.videoUrls) ? guide.videoUrls : []),
        ...(Array.isArray(guide.videoLinks) ? guide.videoLinks : []),
        ...(guide.videoLink ? [guide.videoLink] : []),
    ].filter(Boolean);
    const mediaCount = uploadedImages.length + uploadedVideos.length;

    useEffect(() => {
        checkSavedStatus();
        checkDownloadedStatus();
    }, []);

    const checkSavedStatus = async () => {
        try {
            const res = await learnhubAPI.getSavedGuides();
            const saved = Array.isArray(res.data.data) ? res.data.data : [];
            setIsSaved(saved.some((item: any) => (item._id || item.guideId || item.id) === guideId));
        } catch (e) {
            console.error('Check saved status error:', e);
        }
    };

    const checkDownloadedStatus = async () => {
        try {
            const downloads = await getSavedLearnHub();
            setIsDownloaded(downloads.some(item => item.id === guideId && item.isDownloaded));
        } catch (e) {
            console.error('Check download status error:', e);
        }
    };

    const handleReaction = async () => {
        if (reacting || !guideId) return;
        const wasLiked = !!guide.isLiked;
        const previousCount = Number(guide.likeCount || 0);

        setGuide({
            ...guide,
            isLiked: !wasLiked,
            likeCount: wasLiked ? Math.max(0, previousCount - 1) : previousCount + 1,
        });
        setReacting(true);

        try {
            const res = await learnhubAPI.reactToCommunityGuide(guideId);
            setGuide({
                ...guide,
                isLiked: !!res.data.isLiked,
                likeCount: Number(res.data.likeCount || 0),
            });
        } catch (e) {
            setGuide({ ...guide, isLiked: wasLiked, likeCount: previousCount });
            AppNotify.toast('Could not update reaction', 'error');
        } finally {
            setReacting(false);
        }
    };

    const handleSave = async () => {
        if (!guideId) return;
        try {
            if (isSaved) {
                await learnhubAPI.unsaveGuide(guideId);
                setIsSaved(false);
                AppNotify.toast('Removed from saved guides', 'info');
            } else {
                await learnhubAPI.saveGuide(guideId);
                setIsSaved(true);
                AppNotify.toast('Guide saved successfully', 'success');
            }
        } catch (e) {
            console.error('Save toggle error:', e);
            AppNotify.toast('Could not update saved guide', 'error');
        }
    };

    const handleDownload = async () => {
        if (isDownloaded) {
            AppNotify.toast('This guide is already available offline', 'info');
            return;
        }

        try {
            if (!guideId) {
                AppNotify.toast('Cannot download: Guide ID is missing', 'error');
                return;
            }

            await saveLearnHubItem({
                id: guideId,
                title: guideTitle,
                titleSi: guide.nameSi || guideTitle,
                category: guide.category,
                savedAt: new Date().toISOString(),
                isDownloaded: true,
                data: guide,
            });
            setIsDownloaded(true);
            AppNotify.toast('Guide downloaded for offline access', 'success');
        } catch (e) {
            console.error('Download error:', e);
            AppNotify.toast('Failed to download guide', 'error');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this farmer guide on GoviConnect: ${guideTitle}\n\n${guide.description || ''}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const openVideo = (url: string) => {
        if (!url) return;
        Linking.canOpenURL(url)
            .then(supported => {
                if (supported) Linking.openURL(url);
                else AppNotify.toast('Unable to open this video URL.', 'warning');
            })
            .catch(() => AppNotify.toast('Failed to open video.', 'error'));
    };

    const renderInfoCard = (
        icon: keyof typeof Ionicons.glyphMap,
        label: string,
        value: string,
        tone: string,
    ) => (
        <View style={styles.infoCard}>
            <View style={[styles.infoIconWrap, { backgroundColor: tone + '18' }]}>
                <Ionicons name={icon} size={18} color={tone} />
            </View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );

    const renderContentSection = (
        icon: keyof typeof Ionicons.glyphMap,
        title: string,
        content?: string,
        accent = COLORS.primary[600],
    ) => {
        if (!content) return null;

        return (
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: accent + '16' }]}>
                        <Ionicons name={icon} size={18} color={accent} />
                    </View>
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <Text style={styles.sectionText}>{content}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Guide Details"
                showBack
                onBackPress={() => navigation.goBack()}
                rightContent={
                    <TouchableOpacity onPress={handleShare} style={styles.headerShareButton}>
                        <Ionicons name="share-social-outline" size={22} color={COLORS.neutral[700]} />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.hero}>
                    {cropImage ? (
                        <Image source={{ uri: cropImage }} style={styles.heroImage} />
                    ) : (
                        <LinearGradient colors={[COLORS.primary[100], '#ecfeff']} style={styles.imagePlaceholder}>
                            <Ionicons name="leaf" size={74} color={COLORS.primary[600]} />
                        </LinearGradient>
                    )}
                    <LinearGradient
                        colors={['rgba(15,23,42,0.05)', 'rgba(15,23,42,0.82)']}
                        style={styles.heroOverlay}
                    />
                    <View style={styles.heroContent}>
                        <View style={styles.heroBadgeRow}>
                            <View style={styles.heroBadge}>
                                <Ionicons name="book-outline" size={13} color={COLORS.primary[700]} />
                                <Text style={styles.heroBadgeText}>{guide.category || 'Farmer Guide'}</Text>
                            </View>
                            {mediaCount > 0 ? (
                                <View style={styles.heroBadgeDark}>
                                    <Ionicons name="images-outline" size={12} color="#fff" />
                                    <Text style={styles.heroBadgeDarkText}>{mediaCount} media</Text>
                                </View>
                            ) : null}
                        </View>
                        <Text style={styles.heroTitle} numberOfLines={2}>{guideTitle}</Text>
                        <View style={styles.heroAuthorRow}>
                            <Ionicons name="person-circle-outline" size={18} color="rgba(255,255,255,0.88)" />
                            <Text style={styles.heroAuthorText} numberOfLines={1}>Shared by {authorName}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.contentCard}>
                    {guide.cropId ? (
                        <View style={styles.cropPill}>
                            <Ionicons name="leaf-outline" size={14} color={COLORS.primary[700]} />
                            <Text style={styles.cropPillText}>{guide.cropId}</Text>
                        </View>
                    ) : null}

                    <Text style={styles.description}>{guide.description || 'No description provided.'}</Text>

                    <View style={styles.actionsBar}>
                        <TouchableOpacity
                            style={[styles.actionBtn, guide.isLiked && styles.actionBtnActiveLiked]}
                            onPress={handleReaction}
                            disabled={reacting}
                            activeOpacity={0.82}
                        >
                            <Ionicons
                                name={guide.isLiked ? 'heart' : 'heart-outline'}
                                size={20}
                                color={guide.isLiked ? '#ef4444' : COLORS.neutral[600]}
                            />
                            <Text style={[styles.actionBtnText, guide.isLiked && { color: '#ef4444' }]}>
                                {guide.likeCount || 0} Likes
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, isSaved && styles.actionBtnActiveSaved]}
                            onPress={handleSave}
                            activeOpacity={0.82}
                        >
                            <Ionicons
                                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                                size={20}
                                color={isSaved ? COLORS.primary[600] : COLORS.neutral[600]}
                            />
                            <Text style={[styles.actionBtnText, isSaved && { color: COLORS.primary[600] }]}>
                                {isSaved ? 'Saved' : 'Save'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, isDownloaded && styles.actionBtnActiveDownloaded]}
                            onPress={handleDownload}
                            activeOpacity={0.82}
                        >
                            <Ionicons
                                name={isDownloaded ? 'cloud-done' : 'cloud-download-outline'}
                                size={20}
                                color={isDownloaded ? COLORS.success : COLORS.neutral[600]}
                            />
                            <Text style={[styles.actionBtnText, isDownloaded && { color: COLORS.success }]}>
                                {isDownloaded ? 'Offline' : 'Download'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {guide.climate || guide.soil || guide.season ? (
                        <View style={styles.conditionsBlock}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: COLORS.primary[100] }]}>
                                    <Ionicons name="sparkles-outline" size={18} color={COLORS.primary[700]} />
                                </View>
                                <Text style={styles.sectionTitle}>Growing Conditions</Text>
                            </View>
                            <View style={styles.detailsGrid}>
                                {guide.climate ? renderInfoCard('partly-sunny-outline', 'Climate', guide.climate, COLORS.info) : null}
                                {guide.soil ? renderInfoCard('earth-outline', 'Soil', guide.soil, COLORS.primary[600]) : null}
                                {guide.season ? renderInfoCard('calendar-outline', 'Season', guide.season, COLORS.warning) : null}
                            </View>
                        </View>
                    ) : null}

                    {renderContentSection('checkmark-circle-outline', 'Best Practices', guide.practices, COLORS.primary[600])}

                    {guide.diseases || guide.treatments ? (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: '#fef2f2' }]}>
                                    <Ionicons name="bug-outline" size={18} color={COLORS.error} />
                                </View>
                                <Text style={styles.sectionTitle}>Pests & Diseases</Text>
                            </View>
                            {guide.diseases ? (
                                <View style={styles.subSection}>
                                    <Text style={styles.subSectionTitle}>Common Pests</Text>
                                    <Text style={styles.sectionText}>{guide.diseases}</Text>
                                </View>
                            ) : null}
                            {guide.treatments ? (
                                <View style={styles.subSection}>
                                    <Text style={styles.subSectionTitle}>Recommended Treatments</Text>
                                    <Text style={styles.sectionText}>{guide.treatments}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    {mediaCount > 0 ? (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: COLORS.secondary[100] }]}>
                                    <Ionicons name="images-outline" size={18} color={COLORS.secondary[600]} />
                                </View>
                                <Text style={styles.sectionTitle}>Media Gallery</Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.mediaScroller}
                            >
                                {uploadedImages.map((img: string, idx: number) => (
                                    <View key={`img-${idx}`} style={styles.mediaCard}>
                                        <Image source={{ uri: img }} style={styles.mediaThumb} resizeMode="cover" />
                                        <View style={styles.mediaLabelRow}>
                                            <Ionicons name="image-outline" size={12} color={COLORS.neutral[500]} />
                                            <Text style={styles.mediaLabel}>Photo {idx + 1}</Text>
                                        </View>
                                    </View>
                                ))}

                                {uploadedVideos.map((url: string, idx: number) => (
                                    <TouchableOpacity
                                        key={`video-${idx}`}
                                        style={styles.mediaCard}
                                        onPress={() => openVideo(url)}
                                        activeOpacity={0.82}
                                    >
                                        <View style={[styles.mediaThumb, url.includes('youtube') ? styles.youtubeMediaThumb : styles.videoMediaThumb]}>
                                            <View style={styles.playButton}>
                                                <Ionicons name="play" size={22} color="#fff" />
                                            </View>
                                        </View>
                                        <View style={styles.mediaLabelRow}>
                                            <Ionicons name={url.includes('youtube') ? 'logo-youtube' : 'videocam-outline'} size={12} color="#ef4444" />
                                            <Text style={styles.mediaLabel} numberOfLines={1}>Video {idx + 1}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef7f1',
    },
    headerShareButton: {
        padding: 8,
        borderRadius: 14,
        backgroundColor: COLORS.neutral[100],
    },
    scrollContent: {
        paddingBottom: 34,
    },
    hero: {
        height: 310,
        backgroundColor: COLORS.primary[50],
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    heroContent: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 34,
    },
    heroBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.93)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    heroBadgeText: {
        color: COLORS.primary[700],
        fontSize: 12,
        fontWeight: '800',
    },
    heroBadgeDark: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(15,23,42,0.68)',
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderRadius: 999,
    },
    heroBadgeDarkText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },
    heroTitle: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '900',
        lineHeight: 35,
        marginBottom: 10,
    },
    heroAuthorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heroAuthorText: {
        color: 'rgba(255,255,255,0.88)',
        fontSize: 13,
        fontWeight: '700',
    },
    contentCard: {
        backgroundColor: '#fff',
        marginTop: -22,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 10,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    cropPill: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.primary[50],
        borderWidth: 1,
        borderColor: COLORS.primary[100],
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        marginBottom: 12,
    },
    cropPillText: {
        fontSize: 12,
        color: COLORS.primary[700],
        fontWeight: '800',
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 15,
        color: COLORS.neutral[700],
        lineHeight: 23,
        marginBottom: 18,
    },
    actionsBar: {
        flexDirection: 'row',
        gap: 9,
        marginBottom: 18,
    },
    actionBtn: {
        flex: 1,
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: COLORS.neutral[50],
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    actionBtnActiveLiked: {
        backgroundColor: '#fff1f2',
        borderColor: '#fecdd3',
    },
    actionBtnActiveSaved: {
        backgroundColor: COLORS.primary[50],
        borderColor: COLORS.primary[100],
    },
    actionBtnActiveDownloaded: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.neutral[600],
    },
    conditionsBlock: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    sectionIcon: {
        width: 34,
        height: 34,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '900',
        color: COLORS.neutral[900],
    },
    sectionText: {
        fontSize: 15,
        color: COLORS.neutral[700],
        lineHeight: 23,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    infoCard: {
        flexGrow: 1,
        flexBasis: '30%',
        minWidth: 96,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    infoIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 9,
    },
    infoLabel: {
        fontSize: 10,
        color: COLORS.neutral[500],
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.neutral[800],
        lineHeight: 18,
    },
    subSection: {
        backgroundColor: COLORS.neutral[50],
        borderRadius: 15,
        padding: 12,
        marginTop: 10,
    },
    subSectionTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: COLORS.neutral[600],
        marginBottom: 5,
    },
    mediaScroller: {
        gap: 12,
        paddingRight: 6,
    },
    mediaCard: {
        width: 146,
    },
    mediaThumb: {
        width: 146,
        height: 104,
        borderRadius: 16,
        marginBottom: 8,
        overflow: 'hidden',
    },
    videoMediaThumb: {
        backgroundColor: COLORS.neutral[800],
        alignItems: 'center',
        justifyContent: 'center',
    },
    youtubeMediaThumb: {
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    mediaLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    mediaLabel: {
        flex: 1,
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.neutral[600],
    },
});

export default FarmerGuideDetails;
