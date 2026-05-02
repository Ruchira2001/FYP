import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { aiAPI } from '../../../services/api';
import { saveDiagnosisResult, DiagnosisResult } from '../../../services/storage';
import { queueService } from '../../../services/queueService';
import { useConnectionStatus } from '../../../services/netinfo';
import { generateId } from '../../../utils/validators';
import { useApp } from '../../../context';

type ParamList = {
    CropDoctorResult: { imageUri: string };
};

const CropDoctorResult: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'CropDoctorResult'>>();
    const { imageUri } = route.params;
    const { t, i18n } = useTranslation();
    const { isConnected } = useConnectionStatus();
    const { logout } = useApp();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<{ message: string; isAuth: boolean } | null>(null);

    useEffect(() => {
        analyzeImage();
    }, []);

    const analyzeCropImage = async (uri: string) => {
        const formData = new FormData();
        const filename = uri.split('/').pop() ?? 'crop.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        formData.append('image', { uri, name: filename, type: mimeType } as any);
        const response = await aiAPI.cropDiagnosis(formData);
        // Unrecognized: { success, unrecognized: true, data: prediction }
        // Recognized:   { success, data: DiagnosisResult (MongoDB doc) }
        if (response.data?.unrecognized) return response.data.data;
        return response.data?.data ?? response.data;
    };

    const analyzeImage = async () => {
        setLoading(true);
        try {
            if (isConnected) {
                const result = await analyzeCropImage(imageUri);
                setResult(result);
            } else {
                // Queue for later
                await queueService.addToQueue('analyze_crop', { imageUri });
                setResult({
                    diseaseName: 'Pending Analysis',
                    diseaseNameSi: 'විශ්ලේෂණය පොරොත්තුවෙන්',
                    confidence: 0,
                    treatments: ['Analysis will be available when online'],
                    treatmentsSi: ['ඔන්ලයින් වූ විට විශ්ලේෂණය ලබා ගත හැකිය'],
                    preventionTips: [],
                    preventionTipsSi: [],
                });
            }
        } catch (err: any) {
            console.error('Analysis error:', err);
            const status = err?.response?.status;
            if (status === 401) {
                setError({ message: 'Your session has expired. Please log in again.', isAuth: true });
            } else if (status === 403) {
                setError({ message: 'You are not authorised to use this feature.', isAuth: false });
            } else if (!isConnected || err?.code === 'ECONNABORTED' || !err?.response) {
                setError({ message: 'Cannot reach the server. Check your connection and try again.', isAuth: false });
            } else {
                setError({ message: 'Analysis failed. Please try again.', isAuth: false });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;

        const diagnosisResult: DiagnosisResult = {
            id: generateId(),
            imageUri,
            diseaseName: result.diseaseName,
            diseaseNameSi: result.diseaseNameSi,
            confidence: result.confidence,
            treatments: result.treatments,
            treatmentsSi: result.treatmentsSi,
            preventionTips: result.preventionTips,
            preventionTipsSi: result.preventionTipsSi,
            recommendedChemicals: result.recommendedChemicals || [],
            recommendedChemicalsSi: result.recommendedChemicalsSi || [],
            createdAt: new Date().toISOString(),
            synced: isConnected,
        };

        await saveDiagnosisResult(diagnosisResult);
        setSaved(true);
    };

    const handleAskExpert = () => {
        navigation.navigate('ChatsList', {
            attachDiagnosis: {
                imageUri,
                result,
            }
        });
    };

    const selectedChemicals: string[] =
        ((i18n.language === 'si' ? result?.recommendedChemicalsSi : result?.recommendedChemicals) ||
            result?.recommendedChemicals ||
            []) as string[];

    const handleNearbyShops = () => {
        navigation.navigate('NearbyShopsMap', {
            diseaseName: result?.diseaseName,
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header
                    title={t('ai.crop_doctor')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <View style={styles.loaderCircle}>
                        <ActivityIndicator size="large" color={COLORS.primary[500]} />
                    </View>
                    <Text style={styles.loadingTitle}>
                        {t('ai.analyzing')}
                    </Text>
                    <Text style={styles.loadingSubtitle}>Please wait...</Text>
                </View>
            </View>
        );
    }

    // Error screen (auth or server error)
    if (error) {
        return (
            <View style={styles.container}>
                <Header
                    title={t('ai.crop_doctor')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <View style={[styles.loaderCircle, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="alert-circle" size={48} color="#DC2626" />
                    </View>
                    <Text style={[styles.loadingTitle, { color: '#991B1B', textAlign: 'center', paddingHorizontal: 24 }]}>
                        {error.isAuth ? 'Session Expired' : 'Analysis Failed'}
                    </Text>
                    <Text style={[styles.loadingSubtitle, { textAlign: 'center', paddingHorizontal: 32, marginTop: 8 }]}>
                        {error.message}
                    </Text>
                    <View style={{ marginTop: 32, paddingHorizontal: 32, width: '100%', gap: 12 }}>
                        {error.isAuth ? (
                            <PrimaryButton
                                title="Log In Again"
                                onPress={async () => {
                                    await logout();
                                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                                }}
                                icon="log-in-outline"
                                fullWidth
                            />
                        ) : (
                            <PrimaryButton
                                title="Try Again"
                                onPress={() => {
                                    setError(null);
                                    setLoading(true);
                                    analyzeImage();
                                }}
                                icon="refresh-outline"
                                fullWidth
                            />
                        )}
                        <PrimaryButton
                            title="Go Back"
                            onPress={() => navigation.goBack()}
                            icon="arrow-back-outline"
                            fullWidth
                        />
                    </View>
                </View>
            </View>
        );
    }

    // Unrecognized image screen
    if (result?.unrecognized) {
        const isServiceDown = result?.class === 'ServiceUnavailable';
        return (
            <View style={styles.container}>
                <Header
                    title={t('ai.diagnosis_result')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <View style={[styles.loaderCircle, { backgroundColor: isServiceDown ? '#FEE2E2' : '#FFF3CD' }]}>
                        <Ionicons
                            name={isServiceDown ? 'cloud-offline' : 'alert-circle'}
                            size={48}
                            color={isServiceDown ? '#DC2626' : '#F59E0B'}
                        />
                    </View>
                    <Text style={[styles.loadingTitle, { color: isServiceDown ? '#991B1B' : '#92400E', textAlign: 'center', paddingHorizontal: 24 }]}>
                        {isServiceDown
                            ? (i18n.language === 'si' ? 'සේවාව නොලැබේ' : 'Analysis Service Unavailable')
                            : (i18n.language === 'si' ? 'රූපය හඳුනා ගැනීමට නොහැකි විය' : 'Image Not Recognized')}
                    </Text>
                    <Text style={[styles.loadingSubtitle, { textAlign: 'center', paddingHorizontal: 32, marginTop: 8 }]}>
                        {isServiceDown
                            ? (i18n.language === 'si'
                                ? 'රෝග විශ්ලේෂණ සේවාව තාවකාලිකව නොලැබේ. කරුණාකර මිනිත්තු කිහිපයකින් නැවත උත්සාහ කරන්න.'
                                : 'The analysis service is temporarily unavailable. Please try again in a few minutes.')
                            : (i18n.language === 'si'
                                ? 'මෙම ආකෘතිය හඳුනා ගන්නේ: වී (දුඹුරු ලප, කොළ පිපිරීම) සහ තක්කාලි (බැක්ටීරියා ලප, මුල් දාහය, පසු දාහය) රෝග පමණි. ආසාදිත කොළ හෝ ඵලයේ පැහැදිලි, ආලෝකයෙන් ගත් ඡායාරූපයක් ඉදිරිපත් කරන්න.'
                                : 'This AI recognizes: Rice (Brown Spot, Leaf Blast) and Tomato (Bacterial Spot, Early Blight, Late Blight). Please upload a clear, well-lit photo of a diseased leaf or fruit from one of these crops.')}
                    </Text>
                    <View style={{ marginTop: 32, paddingHorizontal: 32, width: '100%', gap: 12 }}>
                        <PrimaryButton
                            title={i18n.language === 'si' ? 'නැවත උත්සාහ කරන්න' : 'Try Again'}
                            onPress={() => navigation.goBack()}
                            icon="camera-outline"
                            fullWidth
                        />
                        <PrimaryButton
                            title={i18n.language === 'si' ? 'විශේෂඥයෙකුගෙන් අසන්න' : 'Ask an Expert'}
                            onPress={handleAskExpert}
                            icon="chatbubble-outline"
                            variant="outline"
                            fullWidth
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title={t('ai.diagnosis_result')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image */}
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="cover"
                />

                <View style={styles.content}>
                    {/* Disease Name */}
                    <View style={styles.card}>
                        <Text style={styles.label}>
                            {t('ai.disease_name')}
                        </Text>
                        <Text style={styles.diseaseName}>
                            {i18n.language === 'si' ? result?.diseaseNameSi : result?.diseaseName}
                        </Text>

                        {result?.confidence > 0 && (
                            <View style={styles.confidenceContainer}>
                                <Text style={styles.confidenceLabel}>{t('ai.confidence')}:</Text>
                                <View style={styles.confidenceBarBg}>
                                    <View
                                        style={[
                                            styles.confidenceBarFill,
                                            { width: `${result.confidence * 100}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.confidenceValue}>
                                    {Math.round(result.confidence * 100)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Treatments */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="medical" size={20} color={COLORS.success} />
                            <Text style={styles.cardTitle}>
                                {t('ai.treatment_tips')}
                            </Text>
                        </View>

                        {(i18n.language === 'si' ? result?.treatmentsSi : result?.treatments)?.map((tip: string, index: number) => (
                            <View key={index} style={styles.listItem}>
                                <View style={styles.numberBadge}>
                                    <Text style={styles.numberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.listText}>{tip}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Prevention */}
                    {result?.preventionTips?.length > 0 && (
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="shield-checkmark" size={20} color={COLORS.info} />
                                <Text style={styles.infoCardTitle}>
                                    {t('ai.prevention_tips')}
                                </Text>
                            </View>

                            {(i18n.language === 'si' ? result?.preventionTipsSi : result?.preventionTips)?.map((tip: string, index: number) => (
                                <View key={index} style={styles.listItem}>
                                    <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                                    <Text style={styles.infoListText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Recommended Chemicals */}
                    {selectedChemicals.length > 0 && (
                        <View style={styles.chemicalCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="flask" size={20} color={COLORS.warning} />
                                <Text style={styles.chemicalCardTitle}>Recommended Chemicals</Text>
                            </View>

                            {selectedChemicals.map((chemical: string, index: number) => (
                                <View key={`${chemical}-${index}`} style={styles.listItem}>
                                    <Ionicons name="radio-button-on" size={12} color={COLORS.warning} style={{ marginTop: 5 }} />
                                    <Text style={styles.chemicalListText}>{chemical}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title={saved ? t('learnhub.saved') : t('ai.save_result')}
                                onPress={handleSave}
                                disabled={saved}
                                icon={saved ? 'checkmark' : 'bookmark-outline'}
                                variant="outline"
                                fullWidth
                            />
                        </View>
                    </View>

                    <View style={styles.actionsContainer}>
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title="Nearby Agro Shops"
                                onPress={handleNearbyShops}
                                icon="map-outline"
                                variant="outline"
                                fullWidth
                            />
                        </View>
                        <View style={styles.spacer} />
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title={t('ai.ask_expert')}
                                onPress={handleAskExpert}
                                icon="chatbubble-outline"
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderCircle: {
        width: 96,
        height: 96,
        backgroundColor: COLORS.primary[100],
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[700],
        marginBottom: 8,
    },
    loadingSubtitle: {
        fontSize: 14,
        color: COLORS.neutral[400],
    },
    scrollView: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 192,
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    label: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    diseaseName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.error,
    },
    confidenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    confidenceLabel: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginRight: 8,
    },
    confidenceBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 4,
        overflow: 'hidden',
    },
    confidenceBarFill: {
        height: '100%',
        backgroundColor: COLORS.success,
        borderRadius: 4,
    },
    confidenceValue: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.neutral[600],
        marginLeft: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginLeft: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    numberBadge: {
        width: 24,
        height: 24,
        backgroundColor: '#dcfce7', // green-100
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    numberText: {
        color: '#16a34a', // green-600
        fontSize: 12,
        fontWeight: 'bold',
    },
    listText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.neutral[700],
    },
    infoCard: {
        backgroundColor: '#eff6ff', // blue-50
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    infoCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e40af', // blue-800
        marginLeft: 8,
    },
    infoListText: {
        flex: 1,
        fontSize: 14,
        color: '#1d4ed8', // blue-700
        marginLeft: 8,
    },
    chemicalCard: {
        backgroundColor: '#fff7ed',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fdba74',
    },
    chemicalCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9a3412',
        marginLeft: 8,
    },
    chemicalListText: {
        flex: 1,
        fontSize: 14,
        color: '#7c2d12',
        marginLeft: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        marginTop: 4,
        marginBottom: 8,
    },
    actionButtonWrapper: {
        flex: 1,
    },
    spacer: {
        width: 8,
    },
});

export default CropDoctorResult;
