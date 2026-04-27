import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
    ActivityIndicator, Share, Alert, Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components';
import { COLORS } from '../../utils/constants';
import { learnhubAPI } from '../../services/api';
import { saveLearnHubItem, getSavedLearnHub } from '../../services/storage';

type ParamList = {
    FarmerGuideDetails: { guide: any };
};

const FarmerGuideDetails: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'FarmerGuideDetails'>>();
    const { guide: initialGuide } = route.params;
    const { t } = useTranslation();

    const [guide, setGuide] = useState(initialGuide);
    const [isSaved, setIsSaved] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [reacting, setReacting] = useState(false);

    useEffect(() => {
        checkSavedStatus();
        checkDownloadedStatus();
    }, []);

    const checkSavedStatus = async () => {
        try {
            const res = await learnhubAPI.getSavedGuides();
            const saved = Array.isArray(res.data.data) ? res.data.data : [];
            const id = guide._id || guide.id;
            setIsSaved(saved.some((s: any) => (s._id || s.guideId || s.id) === id));
        } catch (e) {
            console.error('Check saved status error:', e);
        }
    };

    const checkDownloadedStatus = async () => {
        try {
            const downloads = await getSavedLearnHub();
            const id = guide._id || guide.id;
            setIsDownloaded(downloads.some(d => d.id === id && d.isDownloaded));
        } catch (e) {
            console.error('Check download status error:', e);
        }
    };

    const handleReaction = async () => {
        if (reacting) return;
        const id = guide._id || guide.id;
        const wasLiked = !!guide.isLiked;
        const previousCount = Number(guide.likeCount || 0);
        
        // Optimistic update
        setGuide({
            ...guide,
            isLiked: !wasLiked,
            likeCount: wasLiked ? Math.max(0, previousCount - 1) : previousCount + 1
        });
        setReacting(true);

        try {
            const res = await learnhubAPI.reactToCommunityGuide(id);
            setGuide({
                ...guide,
                isLiked: !!res.data.isLiked,
                likeCount: Number(res.data.likeCount || 0)
            });
        } catch (e) {
            setGuide({ ...guide, isLiked: wasLiked, likeCount: previousCount });
        } finally {
            setReacting(false);
        }
    };

    const handleSave = async () => {
        const id = guide._id || guide.id;
        try {
            if (isSaved) {
                await learnhubAPI.unsaveGuide(id);
                setIsSaved(false);
            } else {
                await learnhubAPI.saveGuide(id);
                setIsSaved(true);
            }
        } catch (e) {
            console.error('Save toggle error:', e);
        }
    };

    const handleDownload = async () => {
        if (isDownloaded) {
            Alert.alert('Info', 'This guide is already available offline');
            return;
        }
        try {
            const id = guide._id || guide.id;
            if (!id) {
                Alert.alert('Error', 'Cannot download: Guide ID is missing');
                return;
            }
            await saveLearnHubItem({
                id,
                title: guide.name,
                titleSi: guide.nameSi || guide.name,
                category: guide.category,
                savedAt: new Date().toISOString(),
                isDownloaded: true,
                data: guide // Store full object
            });
            setIsDownloaded(true);
            Alert.alert('Success', 'Guide downloaded for offline access');
        } catch (e) {
            console.error('Download error:', e);
            Alert.alert('Error', 'Failed to download guide');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this farmer guide on GoviConnect: ${guide.name}\n\n${guide.description}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Header 
                title={guide.name || 'Guide Details'} 
                showBack 
                onBackPress={() => navigation.goBack()} 
                rightIcon="share-social-outline"
                onRightPress={handleShare}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {guide.images && guide.images.length > 0 ? (
                    <ScrollView 
                        horizontal 
                        pagingEnabled 
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageScroll}
                    >
                        {guide.images.map((img: string, idx: number) => (
                            <Image key={idx} source={{ uri: img }} style={styles.mainImage} />
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={{ fontSize: 64 }}>🌿</Text>
                    </View>
                )}
                
                {guide.images && guide.images.length > 1 && (
                    <View style={styles.paginationDots}>
                        {guide.images.map((_: any, i: number) => (
                            <View key={i} style={styles.dot} />
                        ))}
                    </View>
                )}

                <View style={styles.contentCard}>
                    <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{guide.category || 'Farmer Guide'}</Text>
                        </View>
                        <View style={styles.authorRow}>
                            <Ionicons name="person-circle-outline" size={16} color={COLORS.neutral[400]} />
                            <Text style={styles.authorText}>{guide.userId?.name || 'Farmer'}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{guide.name}</Text>
                    <Text style={styles.description}>{guide.description || 'No description provided.'}</Text>

                    {/* Actions Bar */}
                    <View style={styles.actionsBar}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, guide.isLiked && styles.actionBtnActiveLiked]} 
                            onPress={handleReaction}
                            disabled={reacting}
                        >
                            <Ionicons 
                                name={guide.isLiked ? 'heart' : 'heart-outline'} 
                                size={20} 
                                color={guide.isLiked ? '#ef4444' : COLORS.neutral[600]} 
                            />
                            <Text style={[styles.actionBtnText, guide.isLiked && { color: '#ef4444' }]}>
                                {guide.likeCount || 0}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionBtn, isSaved && styles.actionBtnActiveSaved]} 
                            onPress={handleSave}
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

                    {/* Details Sections */}
                    {guide.climate || guide.soil || guide.season ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Growing Conditions</Text>
                            <View style={styles.detailsGrid}>
                                {guide.climate && (
                                    <View style={styles.detailItem}>
                                        <Ionicons name="thermometer-outline" size={16} color={COLORS.primary[500]} />
                                        <Text style={styles.detailLabel}>Climate</Text>
                                        <Text style={styles.detailValue}>{guide.climate}</Text>
                                    </View>
                                )}
                                {guide.soil && (
                                    <View style={styles.detailItem}>
                                        <Ionicons name="leaf-outline" size={16} color={COLORS.primary[500]} />
                                        <Text style={styles.detailLabel}>Soil</Text>
                                        <Text style={styles.detailValue}>{guide.soil}</Text>
                                    </View>
                                )}
                                {guide.season && (
                                    <View style={styles.detailItem}>
                                        <Ionicons name="calendar-outline" size={16} color={COLORS.primary[500]} />
                                        <Text style={styles.detailLabel}>Season</Text>
                                        <Text style={styles.detailValue}>{guide.season}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ) : null}

                    {guide.practices ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Best Practices</Text>
                            <Text style={styles.sectionText}>{guide.practices}</Text>
                        </View>
                    ) : null}

                    {guide.diseases || guide.treatments ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Pests & Diseases</Text>
                            {guide.diseases && (
                                <View style={styles.subSection}>
                                    <Text style={styles.subSectionTitle}>Common Pests</Text>
                                    <Text style={styles.sectionText}>{guide.diseases}</Text>
                                </View>
                            )}
                            {guide.treatments && (
                                <View style={styles.subSection}>
                                    <Text style={styles.subSectionTitle}>Recommended Treatments</Text>
                                    <Text style={styles.sectionText}>{guide.treatments}</Text>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {/* Videos Section */}
                    {((guide.videoUrls && guide.videoUrls.length > 0) || guide.videoLink) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Videos & Tutorials</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {guide.videoLink && (
                                    <TouchableOpacity style={styles.videoCard} onPress={() => Alert.alert('Play Video', 'Opening video link...')}>
                                        <View style={styles.videoThumb}>
                                            <Ionicons name="play-circle" size={40} color="#fff" />
                                        </View>
                                        <Text style={styles.videoTitle}>Tutorial Link</Text>
                                    </TouchableOpacity>
                                )}
                                {(guide.videoUrls || []).map((url: string, idx: number) => (
                                    <TouchableOpacity key={idx} style={styles.videoCard} onPress={() => Alert.alert('Play Video', 'Loading video stream...')}>
                                        <View style={[styles.videoThumb, { backgroundColor: COLORS.neutral[800] }]}>
                                            <Ionicons name="play-circle" size={40} color="#fff" />
                                        </View>
                                        <Text style={styles.videoTitle}>Video {idx + 1}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },
    scrollContent: { paddingBottom: 40 },
    imageScroll: { height: 250 },
    mainImage: { width: SCREEN_WIDTH, height: 250, resizeMode: 'cover' },
    imagePlaceholder: { 
        width: '100%', height: 250, backgroundColor: COLORS.primary[50],
        alignItems: 'center', justifyContent: 'center' 
    },
    contentCard: {
        backgroundColor: '#fff',
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    categoryText: {
        color: COLORS.primary[700],
        fontSize: 12,
        fontWeight: '700',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    authorText: {
        color: COLORS.neutral[500],
        fontSize: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.neutral[900],
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: COLORS.neutral[600],
        lineHeight: 22,
        marginBottom: 20,
    },
    actionsBar: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: COLORS.neutral[100],
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionBtnActiveLiked: { backgroundColor: '#fee2e2' },
    actionBtnActiveSaved: { backgroundColor: COLORS.primary[50] },
    actionBtnActiveDownloaded: { backgroundColor: '#f0fdf4' },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.neutral[600],
    },
    section: {
        marginBottom: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.neutral[900],
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 15,
        color: COLORS.neutral[700],
        lineHeight: 22,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    detailItem: {
        flex: 1,
        minWidth: '28%',
        backgroundColor: COLORS.neutral[50],
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 10,
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
        marginTop: 4,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.neutral[800],
        textAlign: 'center',
    },
    subSection: {
        marginTop: 12,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[500],
        marginBottom: 4,
    },
    paginationDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        position: 'absolute',
        top: 220,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 4,
        borderRadius: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    videoCard: {
        width: 140,
    },
    videoThumb: {
        width: 140,
        height: 80,
        backgroundColor: COLORS.neutral[200],
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    videoTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.neutral[700],
    },
});

export default FarmerGuideDetails;
