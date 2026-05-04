import React, { useState } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { getDiagnosisHistory, saveDiagnosisResult, DiagnosisResult } from '../../../services/storage';
import { aiAPI } from '../../../services/api';
import { useConnectionStatus } from '../../../services/netinfo';
import { formatDateTime } from '../../../utils/validators';

const DiagnosisHistory: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { isConnected } = useConnectionStatus();
    const [history, setHistory] = useState<DiagnosisResult[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
        }, [isConnected])
    );

    const loadHistory = async () => {
        const localData = await getDiagnosisHistory();
        if (!isConnected) {
            setHistory(localData);
            return;
        }

        try {
            const res = await aiAPI.getDiagnosisHistory();
            const serverData = Array.isArray(res.data.data) ? res.data.data.map(normalizeDiagnosis) : [];
            for (const item of serverData) {
                await saveDiagnosisResult(item);
            }
            const merged = await getDiagnosisHistory();
            setHistory(merged);
        } catch {
            setHistory(localData);
        }
    };

    const normalizeDiagnosis = (item: any): DiagnosisResult => ({
        id: item._id || item.id,
        serverId: item._id,
        imageUri: item.imageUrl || item.imageUri,
        diseaseName: item.diseaseName,
        diseaseNameSi: item.diseaseNameSi,
        confidence: item.confidence || 0,
        treatments: item.treatments || [],
        treatmentsSi: item.treatmentsSi || [],
        preventionTips: item.preventionTips || [],
        preventionTipsSi: item.preventionTipsSi || [],
        recommendedChemicals: item.recommendedChemicals || [],
        recommendedChemicalsSi: item.recommendedChemicalsSi || [],
        expertReviewRequested: item.expertReviewRequested || false,
        expertReviewRequestedAt: item.expertReviewRequestedAt,
        expertReviewed: item.expertReviewed || false,
        expertDiagnosis: item.expertDiagnosis,
        expertNotes: item.expertNotes,
        reviewStatus: item.reviewStatus,
        reviewedAt: item.reviewedAt,
        createdAt: item.createdAt || new Date().toISOString(),
        synced: item.synced !== false,
    });

    const renderItem = ({ item }: { item: DiagnosisResult }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DiagnosisDetail', { item })}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.imageUri }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Text style={styles.title}>
                    {i18n.language === 'si' ? item.diseaseNameSi : item.diseaseName}
                </Text>
                <Text style={styles.date}>
                    {formatDateTime(item.createdAt, i18n.language)}
                </Text>

                <View style={styles.metaRow}>
                    {item.synced ? (
                        <View style={styles.statusBadge}>
                            <Ionicons name="cloud-done" size={14} color={COLORS.success} />
                            <Text style={styles.syncedText}>Synced</Text>
                        </View>
                    ) : (
                        <View style={styles.statusBadge}>
                            <Ionicons name="cloud-offline" size={14} color={COLORS.warning} />
                            <Text style={styles.pendingText}>Pending sync</Text>
                        </View>
                    )}

                    <View style={styles.confidenceBadge}>
                        <Text style={styles.metaLabel}>Confidence: </Text>
                        <Text style={styles.metaValue}>
                            {Math.round(item.confidence * 100)}%
                        </Text>
                    </View>
                </View>

                {(item.expertReviewed || item.expertReviewRequested) && (
                    <View style={[
                        styles.reviewPanel,
                        item.expertReviewed ? styles.reviewPanelDone : styles.reviewPanelPending,
                    ]}>
                        <View style={styles.reviewHeader}>
                            <Ionicons
                                name={item.expertReviewed ? 'shield-checkmark' : 'time-outline'}
                                size={15}
                                color={item.expertReviewed ? COLORS.success : COLORS.warning}
                            />
                            <Text style={[
                                styles.reviewTitle,
                                { color: item.expertReviewed ? COLORS.success : COLORS.warning },
                            ]}>
                                {item.expertReviewed ? 'Expert reviewed' : 'Expert review requested'}
                            </Text>
                        </View>
                        {item.expertReviewed && (
                            <Text style={styles.reviewText} numberOfLines={2}>
                                {item.expertDiagnosis || item.expertNotes || 'Expert review available'}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title={t('ai.diagnosis_history')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {history.length > 0 ? (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="medical"
                    title={t('ai.no_history')}
                    description="Your crop diagnoses will appear here"
                    actionLabel={t('ai.crop_doctor')}
                    onAction={() => navigation.navigate('CropDoctorUpload')}
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
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 8,
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    date: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncedText: {
        fontSize: 12,
        color: '#16a34a', // green-600
        marginLeft: 4,
    },
    pendingText: {
        fontSize: 12,
        color: '#ca8a04', // yellow-600
        marginLeft: 4,
    },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    metaLabel: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    metaValue: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.neutral[600],
    },
    reviewPanel: {
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
    },
    reviewPanelDone: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    reviewPanelPending: {
        backgroundColor: '#fffbeb',
        borderColor: '#fde68a',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    reviewTitle: {
        fontSize: 12,
        fontWeight: '700',
    },
    reviewText: {
        marginTop: 4,
        fontSize: 12,
        color: COLORS.neutral[600],
        lineHeight: 17,
    },
});

export default DiagnosisHistory;
