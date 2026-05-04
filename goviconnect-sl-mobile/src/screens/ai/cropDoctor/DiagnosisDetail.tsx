import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppNotify, Header, PrimaryButton } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { DiagnosisResult, saveDiagnosisResult } from '../../../services/storage';
import { aiAPI } from '../../../services/api';
import { formatDateTime } from '../../../utils/validators';

type ParamList = {
    DiagnosisDetail: { item: DiagnosisResult };
};

const DiagnosisDetail: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'DiagnosisDetail'>>();
    const { item } = route.params;
    const { t, i18n } = useTranslation();

    const isHealthy = item.diseaseName?.toLowerCase().includes('healthy');
    const treatments = i18n.language === 'si' ? item.treatmentsSi : item.treatments;
    const preventionTips = i18n.language === 'si' ? item.preventionTipsSi : item.preventionTips;
    const recommendedChemicals = i18n.language === 'si'
        ? (item.recommendedChemicalsSi || item.recommendedChemicals || [])
        : (item.recommendedChemicals || []);
    const diseaseName = i18n.language === 'si' ? item.diseaseNameSi : item.diseaseName;
    const handleAskExpert = async () => {
        const diagnosisId = item.serverId || item.id;
        try {
            const res = await aiAPI.requestDiagnosisExpertReview(diagnosisId);
            const updated = res.data.data;
            await saveDiagnosisResult({
                ...item,
                serverId: updated._id,
                expertReviewRequested: true,
                expertReviewRequestedAt: updated.expertReviewRequestedAt,
                reviewStatus: updated.reviewStatus,
                synced: true,
            });
            AppNotify.toast('Diagnosis sent to experts for review.', 'success');
            navigation.goBack();
        } catch (err: any) {
            AppNotify.toast(err?.response?.data?.message || 'Could not send diagnosis to experts.', 'error');
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('ai.diagnosis_result')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Crop Image */}
                {item.imageUri ? (
                    <Image
                        source={{ uri: item.imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="leaf" size={48} color={COLORS.neutral[300]} />
                    </View>
                )}

                <View style={styles.content}>
                    {/* Date & Sync badge */}
                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.dateText}>
                            {formatDateTime(item.createdAt, i18n.language)}
                        </Text>
                        <View style={styles.syncBadge}>
                            <Ionicons
                                name={item.synced ? 'cloud-done' : 'cloud-offline'}
                                size={14}
                                color={item.synced ? COLORS.success : COLORS.warning}
                            />
                            <Text style={[
                                styles.syncText,
                                { color: item.synced ? COLORS.success : COLORS.warning }
                            ]}>
                                {item.synced ? 'Synced' : 'Pending sync'}
                            </Text>
                        </View>
                    </View>

                    {/* Disease name card */}
                    <View style={styles.card}>
                        <Text style={styles.label}>DISEASE</Text>
                        <Text style={[
                            styles.diseaseName,
                            isHealthy && { color: COLORS.success }
                        ]}>
                            {diseaseName}
                        </Text>

                        {item.confidence > 0 && (
                            <View style={styles.confidenceContainer}>
                                <Text style={styles.confidenceLabel}>{t('ai.confidence')}:</Text>
                                <View style={styles.confidenceBarBg}>
                                    <View
                                        style={[
                                            styles.confidenceBarFill,
                                            { width: `${item.confidence * 100}%` as any },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.confidenceValue}>
                                    {Math.round(item.confidence * 100)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Treatments */}
                    {treatments && treatments.length > 0 && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="medical" size={20} color={COLORS.success} />
                                <Text style={styles.cardTitle}>{t('ai.treatment_tips')}</Text>
                            </View>
                            {treatments.map((tip, index) => (
                                <View key={index} style={styles.listItem}>
                                    <View style={styles.numberBadge}>
                                        <Text style={styles.numberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.listText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Prevention Tips */}
                    {preventionTips && preventionTips.length > 0 && (
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="shield-checkmark" size={20} color={COLORS.info} />
                                <Text style={styles.infoCardTitle}>{t('ai.prevention_tips')}</Text>
                            </View>
                            {preventionTips.map((tip, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={16}
                                        color={COLORS.info}
                                        style={{ marginTop: 2 }}
                                    />
                                    <Text style={styles.infoListText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Recommended Chemicals */}
                    {recommendedChemicals && recommendedChemicals.length > 0 && (
                        <View style={styles.chemicalCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="flask" size={20} color={COLORS.warning} />
                                <Text style={styles.chemicalCardTitle}>Recommended Chemicals</Text>
                            </View>
                            {recommendedChemicals.map((chemical, index) => (
                                <View key={`${chemical}-${index}`} style={styles.listItem}>
                                    <Ionicons
                                        name="radio-button-on"
                                        size={14}
                                        color={COLORS.warning}
                                        style={{ marginTop: 4 }}
                                    />
                                    <Text style={styles.chemicalListText}>{chemical}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {(item.expertReviewed || item.expertReviewRequested) && (
                        <View style={[
                            styles.expertReviewCard,
                            item.expertReviewed ? styles.expertReviewDone : styles.expertReviewPending,
                        ]}>
                            <View style={styles.cardHeader}>
                                <Ionicons
                                    name={item.expertReviewed ? 'shield-checkmark' : 'time-outline'}
                                    size={20}
                                    color={item.expertReviewed ? COLORS.success : COLORS.warning}
                                />
                                <Text style={[
                                    styles.expertReviewTitle,
                                    { color: item.expertReviewed ? COLORS.success : COLORS.warning },
                                ]}>
                                    {item.expertReviewed ? 'Expert Review' : 'Expert Review Requested'}
                                </Text>
                            </View>
                            {item.expertReviewed ? (
                                <>
                                    {item.expertDiagnosis ? <Text style={styles.expertDiagnosisText}>{item.expertDiagnosis}</Text> : null}
                                    {item.expertNotes ? <Text style={styles.expertNotesText}>{item.expertNotes}</Text> : null}
                                    {item.reviewedAt ? <Text style={styles.reviewedAtText}>Reviewed {formatDateTime(item.reviewedAt, i18n.language)}</Text> : null}
                                </>
                            ) : (
                                <Text style={styles.expertNotesText}>An expert will review this diagnosis and the result will appear here.</Text>
                            )}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title="Nearby Agro Shops"
                                onPress={() =>
                                    navigation.navigate('NearbyShopsMap', {
                                        diseaseName: item.diseaseName,
                                    })
                                }
                                icon="map-outline"
                                variant="outline"
                                fullWidth
                            />
                        </View>
                        <View style={styles.verticalSpacer} />
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title={t('ai.ask_expert')}
                                onPress={handleAskExpert}
                                disabled={item.expertReviewRequested}
                                icon="chatbubble-outline"
                                fullWidth
                            />
                        </View>
                        <View style={styles.verticalSpacer} />
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title={t('ai.crop_doctor')}
                                onPress={() => navigation.navigate('CropDoctorUpload')}
                                icon="camera-outline"
                                variant="outline"
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
    scrollView: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 220,
    },
    imagePlaceholder: {
        width: '100%',
        height: 160,
        backgroundColor: COLORS.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: COLORS.neutral[400],
        flex: 1,
        marginLeft: 4,
    },
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    syncText: {
        fontSize: 12,
        fontWeight: '500',
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
        letterSpacing: 0.5,
    },
    diseaseName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.error,
    },
    confidenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
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
        backgroundColor: '#dcfce7',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    numberText: {
        color: '#16a34a',
        fontSize: 12,
        fontWeight: 'bold',
    },
    listText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.neutral[700],
        lineHeight: 20,
    },
    infoCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    infoCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e40af',
        marginLeft: 8,
    },
    infoListText: {
        flex: 1,
        fontSize: 14,
        color: '#1d4ed8',
        marginLeft: 8,
        lineHeight: 20,
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
        lineHeight: 20,
    },
    expertReviewCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    expertReviewDone: {
        backgroundColor: '#f0fdf4',
        borderColor: '#86efac',
    },
    expertReviewPending: {
        backgroundColor: '#fffbeb',
        borderColor: '#fde68a',
    },
    expertReviewTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    expertDiagnosisText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginBottom: 6,
    },
    expertNotesText: {
        fontSize: 14,
        color: COLORS.neutral[700],
        lineHeight: 20,
    },
    reviewedAtText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 8,
    },
    actionsContainer: {
        flexDirection: 'column',
        marginTop: 4,
        marginBottom: 24,
    },
    actionButtonWrapper: {
        width: '100%',
    },
    verticalSpacer: {
        height: 10,
    },
});

export default DiagnosisDetail;
