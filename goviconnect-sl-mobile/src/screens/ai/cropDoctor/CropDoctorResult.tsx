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

type ParamList = {
    CropDoctorResult: { imageUri: string };
};

const CropDoctorResult: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'CropDoctorResult'>>();
    const { imageUri } = route.params;
    const { t, i18n } = useTranslation();
    const { isConnected } = useConnectionStatus();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        analyzeImage();
    }, []);

    const analyzeImage = async () => {
        setLoading(true);
        try {
            if (isConnected) {
                const response = await analyzeCropImage(imageUri);
                setResult(response);
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
        } catch (error) {
            console.error('Analysis error:', error);
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
    actionsContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    actionButtonWrapper: {
        flex: 1,
    },
    spacer: {
        width: 8,
    },
});

export default CropDoctorResult;
