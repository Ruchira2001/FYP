import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip, PrimaryButton } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { getRelativeTime } from '../../../utils/validators';
import { expertDashboardAPI } from '../../../services/api';

const STATUS_FILTERS = ['All', 'Pending', 'Verified', 'Corrected'];

const DiagnosisReviews: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [activeFilter, setActiveFilter] = useState('All');
    const [reviews, setReviews] = useState<any[]>([]);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewAction, setReviewAction] = useState<'verify' | 'correct'>('verify');

    React.useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const res = await expertDashboardAPI.getDiagnosisReviews();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setReviews(data);
        } catch (e) {
            console.error('Failed to load reviews:', e);
        }
    };

    const filteredReviews = reviews.filter(review => {
        if (activeFilter === 'Pending') return review.status === 'pending_review';
        if (activeFilter === 'Verified') return review.status === 'verified';
        if (activeFilter === 'Corrected') return review.status === 'corrected';
        return true;
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending_review':
                return { label: 'Pending Review', color: COLORS.warning, bgColor: '#fef3c7', icon: 'time' as const };
            case 'verified':
                return { label: 'Verified', color: COLORS.success, bgColor: '#dcfce7', icon: 'checkmark-circle' as const };
            case 'corrected':
                return { label: 'Corrected', color: COLORS.info, bgColor: '#dbeafe', icon: 'pencil' as const };
            default:
                return { label: 'Unknown', color: COLORS.neutral[400], bgColor: COLORS.neutral[100], icon: 'help' as const };
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return COLORS.success;
        if (confidence >= 70) return COLORS.warning;
        return COLORS.error;
    };

    const handleOpenReview = (review: typeof expertData.diagnosisReviews[0]) => {
        setSelectedReview(review);
        setReviewNotes('');
        setShowReviewModal(true);
    };

    const handleSubmitReview = () => {
        if (!selectedReview) return;

        setReviews(prev => prev.map(r => {
            if (r.id === selectedReview.id) {
                return {
                    ...r,
                    expertVerified: true,
                    expertNotes: reviewNotes,
                    expertDiagnosis: reviewAction === 'verify'
                        ? `Confirmed: ${r.aiDiagnosis}`
                        : reviewNotes,
                    status: reviewAction === 'verify' ? 'verified' : 'corrected',
                };
            }
            return r;
        }));

        setShowReviewModal(false);
        Alert.alert(
            'Review Submitted',
            reviewAction === 'verify'
                ? 'You have confirmed the AI diagnosis.'
                : 'You have corrected the AI diagnosis.',
        );
    };

    const renderReviewCard = (review: typeof expertData.diagnosisReviews[0]) => {
        const statusConfig = getStatusConfig(review.status);

        return (
            <TouchableOpacity
                key={review.id}
                style={styles.reviewCard}
                activeOpacity={0.7}
                onPress={() => review.status === 'pending_review' ? handleOpenReview(review) : null}
            >
                {/* Status Badge */}
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                    <Text style={styles.timeText}>
                        {getRelativeTime(review.submittedAt, i18n.language)}
                    </Text>
                </View>

                {/* Image & AI Diagnosis */}
                <View style={styles.diagnosisRow}>
                    <View style={styles.imagePreview}>
                        <Ionicons name="leaf" size={28} color={COLORS.primary[400]} />
                    </View>
                    <View style={styles.diagnosisInfo}>
                        <Text style={styles.cropName}>{review.cropName}</Text>
                        <Text style={styles.farmerName}>
                            <Ionicons name="person-outline" size={12} color={COLORS.neutral[400]} />
                            {' '}{review.farmerName}
                        </Text>
                        <View style={styles.aiDiagnosisRow}>
                            <Ionicons name="sparkles" size={14} color={COLORS.secondary[500]} />
                            <Text style={styles.aiDiagnosisText} numberOfLines={1}>
                                {review.aiDiagnosis}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Confidence Bar */}
                <View style={styles.confidenceSection}>
                    <View style={styles.confidenceHeader}>
                        <Text style={styles.confidenceLabel}>AI Confidence</Text>
                        <Text style={[styles.confidenceValue, { color: getConfidenceColor(review.aiConfidence) }]}>
                            {review.aiConfidence}%
                        </Text>
                    </View>
                    <View style={styles.confidenceBarBg}>
                        <View
                            style={[
                                styles.confidenceBarFill,
                                {
                                    width: `${review.aiConfidence}%`,
                                    backgroundColor: getConfidenceColor(review.aiConfidence),
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* AI Treatments */}
                <View style={styles.treatmentsSection}>
                    <Text style={styles.treatmentsTitle}>AI Suggested Treatments:</Text>
                    {review.aiTreatments.map((treatment, idx) => (
                        <View key={idx} style={styles.treatmentItem}>
                            <View style={styles.treatmentBullet} />
                            <Text style={styles.treatmentText}>{treatment}</Text>
                        </View>
                    ))}
                </View>

                {/* Expert Notes (if reviewed) */}
                {review.expertVerified && review.expertNotes && (
                    <View style={styles.expertNotesSection}>
                        <View style={styles.expertNotesHeader}>
                            <Ionicons name="shield-checkmark" size={16} color={COLORS.primary[600]} />
                            <Text style={styles.expertNotesTitle}>Expert Review</Text>
                        </View>
                        {review.expertDiagnosis && (
                            <Text style={styles.expertDiagnosisText}>{review.expertDiagnosis}</Text>
                        )}
                        <Text style={styles.expertNotesText}>{review.expertNotes}</Text>
                    </View>
                )}

                {/* Action Button */}
                {review.status === 'pending_review' && (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => handleOpenReview(review)}
                    >
                        <Ionicons name="eye" size={18} color={COLORS.primary[600]} />
                        <Text style={styles.reviewButtonText}>Review Now</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Diagnosis Reviews"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Filter Chips */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {STATUS_FILTERS.map((filter) => (
                        <Chip
                            key={filter}
                            label={filter}
                            selected={activeFilter === filter}
                            onPress={() => setActiveFilter(filter)}
                            variant="outline"
                            size="sm"
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Pending Count */}
            {activeFilter === 'All' && (
                <View style={styles.pendingCountBar}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
                    <Text style={styles.pendingCountText}>
                        {reviews.filter(r => r.status === 'pending_review').length} reviews pending
                    </Text>
                </View>
            )}

            {/* Reviews List */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {filteredReviews.length > 0 ? (
                    filteredReviews.map(renderReviewCard)
                ) : (
                    <EmptyState
                        icon="checkmark-done-outline"
                        title="No reviews found"
                        description="All caught up! No diagnosis reviews in this category."
                    />
                )}
                <View style={{ height: 24 }} />
            </ScrollView>

            {/* Review Modal */}
            <Modal
                visible={showReviewModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowReviewModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Review Diagnosis</Text>
                        <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.neutral[600]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {selectedReview && (
                            <>
                                {/* AI Diagnosis Info */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>AI Diagnosis</Text>
                                    <View style={styles.aiInfoCard}>
                                        <View style={styles.aiInfoRow}>
                                            <Ionicons name="sparkles" size={18} color={COLORS.secondary[500]} />
                                            <Text style={styles.aiInfoText}>{selectedReview.aiDiagnosis}</Text>
                                        </View>
                                        <View style={styles.aiInfoRow}>
                                            <Ionicons name="analytics" size={18} color={getConfidenceColor(selectedReview.aiConfidence)} />
                                            <Text style={styles.aiInfoText}>Confidence: {selectedReview.aiConfidence}%</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Action Selection */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Your Review</Text>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                reviewAction === 'verify' && styles.actionButtonActive,
                                            ]}
                                            onPress={() => setReviewAction('verify')}
                                        >
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={22}
                                                color={reviewAction === 'verify' ? COLORS.success : COLORS.neutral[400]}
                                            />
                                            <Text style={[
                                                styles.actionButtonText,
                                                reviewAction === 'verify' && styles.actionButtonTextActive,
                                            ]}>
                                                Verify AI Diagnosis
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                reviewAction === 'correct' && styles.actionButtonActiveCorrect,
                                            ]}
                                            onPress={() => setReviewAction('correct')}
                                        >
                                            <Ionicons
                                                name="pencil"
                                                size={22}
                                                color={reviewAction === 'correct' ? COLORS.warning : COLORS.neutral[400]}
                                            />
                                            <Text style={[
                                                styles.actionButtonText,
                                                reviewAction === 'correct' && styles.actionButtonTextActiveCorrect,
                                            ]}>
                                                Correct Diagnosis
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Notes */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>
                                        {reviewAction === 'verify' ? 'Additional Notes (Optional)' : 'Correct Diagnosis & Notes'}
                                    </Text>
                                    <TextInput
                                        style={styles.notesInput}
                                        placeholder={
                                            reviewAction === 'verify'
                                                ? 'Add any additional notes for the farmer...'
                                                : 'Enter the correct diagnosis and treatment recommendations...'
                                        }
                                        placeholderTextColor={COLORS.neutral[400]}
                                        value={reviewNotes}
                                        onChangeText={setReviewNotes}
                                        multiline
                                        numberOfLines={5}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </>
                        )}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <PrimaryButton
                            title={reviewAction === 'verify' ? 'Confirm & Verify' : 'Submit Correction'}
                            onPress={handleSubmitReview}
                            icon={reviewAction === 'verify' ? 'checkmark-circle' : 'send'}
                            fullWidth
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    filtersContainer: {
        paddingVertical: 12,
    },
    filtersContent: {
        paddingHorizontal: 16,
    },
    pendingCountBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fef3c7',
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    pendingCountText: {
        fontSize: 13,
        color: '#92400e',
        fontWeight: '500',
        marginLeft: 6,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    reviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    diagnosisRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    imagePreview: {
        width: 64,
        height: 64,
        backgroundColor: COLORS.primary[50],
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    diagnosisInfo: {
        flex: 1,
    },
    cropName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    farmerName: {
        fontSize: 13,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    aiDiagnosisRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: COLORS.secondary[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    aiDiagnosisText: {
        fontSize: 12,
        color: COLORS.secondary[700],
        fontWeight: '500',
        marginLeft: 4,
        flex: 1,
    },
    confidenceSection: {
        marginBottom: 12,
    },
    confidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    confidenceLabel: {
        fontSize: 12,
        color: COLORS.neutral[500],
    },
    confidenceValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    confidenceBarBg: {
        height: 6,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 3,
        overflow: 'hidden',
    },
    confidenceBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    treatmentsSection: {
        marginBottom: 12,
    },
    treatmentsTitle: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginBottom: 6,
    },
    treatmentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    treatmentBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary[400],
        marginTop: 5,
        marginRight: 8,
    },
    treatmentText: {
        fontSize: 13,
        color: COLORS.neutral[600],
        flex: 1,
    },
    expertNotesSection: {
        backgroundColor: COLORS.primary[50],
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary[500],
    },
    expertNotesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    expertNotesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary[700],
        marginLeft: 6,
    },
    expertDiagnosisText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    expertNotesText: {
        fontSize: 13,
        color: COLORS.neutral[600],
        lineHeight: 18,
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: COLORS.primary[50],
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    reviewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary[600],
        marginLeft: 6,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalSection: {
        marginBottom: 24,
    },
    modalSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[700],
        marginBottom: 8,
    },
    aiInfoCard: {
        backgroundColor: COLORS.neutral[50],
        borderRadius: 12,
        padding: 12,
    },
    aiInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    aiInfoText: {
        fontSize: 14,
        color: COLORS.neutral[700],
        marginLeft: 8,
        flex: 1,
    },
    actionButtons: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.neutral[200],
        marginBottom: 8,
    },
    actionButtonActive: {
        borderColor: COLORS.success,
        backgroundColor: '#dcfce720',
    },
    actionButtonActiveCorrect: {
        borderColor: COLORS.warning,
        backgroundColor: '#fef3c720',
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.neutral[500],
        marginLeft: 10,
    },
    actionButtonTextActive: {
        color: COLORS.success,
    },
    actionButtonTextActiveCorrect: {
        color: COLORS.warning,
    },
    notesInput: {
        backgroundColor: COLORS.neutral[50],
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: COLORS.neutral[800],
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        minHeight: 120,
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
});

export default DiagnosisReviews;
