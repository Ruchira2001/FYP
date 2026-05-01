import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { aiAPI } from '../../../services/api';
import { savePredictionResult, PredictionResult } from '../../../services/storage';
import { queueService } from '../../../services/queueService';
import { useConnectionStatus } from '../../../services/netinfo';
import { generateId } from '../../../utils/validators';
import cropsData from '../../../data/crops.json';

// Typical yield per acre (kg) for Sri Lanka — DOA/HARTI reference values
const YIELD_PER_ACRE: Record<string, number> = {
    tea:      1500,  // green leaf
    paddy:    2000,
    tomato:   8000,
    chili:    1500,
    potato:   6000,
    carrot:   8000,
    cabbage:  10000,
    beans:    2500,
    mango:    3000,
    banana:   8000,
    coconut:  1750,  // ~50 nuts/tree × 70 trees/acre × avg 0.5 kg
    cinnamon: 300,
    pepper:   500,
    ginger:   4000,
    turmeric: 5000,
};

const LAND_UNIT_TO_ACRES: Record<string, number> = {
    acres:    1,
    hectares: 2.47105,
    perches:  0.00625,
};

/** Returns estimated yield in kg based on crop, land size, and unit. */
function estimateYieldKg(cropId: string, landSize: number, landUnit: string): number | null {
    const yieldPerAcre = YIELD_PER_ACRE[cropId.toLowerCase()];
    const factor = LAND_UNIT_TO_ACRES[landUnit.toLowerCase()];
    if (!yieldPerAcre || !factor) return null;
    return Math.round(landSize * factor * yieldPerAcre);
}

type ParamList = {
    PriceResult: {
        crop: string;
        variety?: string;
        landSize: number;
        landUnit: string;
        district?: string;
        season?: string;
        expectedYield?: string;
    };
};

const PriceResult: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'PriceResult'>>();
    const params = route.params;
    const { t, i18n } = useTranslation();
    const { isConnected } = useConnectionStatus();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    const crop = cropsData.crops.find(c => c.id === params.crop);

    const estYieldKg = params.expectedYield
        ? parseInt(params.expectedYield, 10) || null
        : estimateYieldKg(params.crop, params.landSize, params.landUnit);

    useEffect(() => {
        getPrediction();
    }, []);

    const getPrediction = async () => {
        setLoading(true);
        try {
            if (isConnected) {
                const response = await aiAPI.pricePrediction({
                    crop: params.crop,
                    landSize: params.landSize,
                    landUnit: params.landUnit,
                    district: params.district || '',
                    season: params.season,
                });
                const data = response.data.data || response.data;
                setResult(data);
            } else {
                // Queue for later
                await queueService.addToQueue('predict_price', params);
                setResult({
                    priceLow: 0,
                    priceHigh: 0,
                    summary: 'Prediction will be available when online',
                    summarySi: 'ඔන්ලයින් වූ විට පුරෝකථනය ලබා ගත හැකිය',
                });
            }
        } catch (error) {
            console.error('Prediction error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;

        const predictionResult: PredictionResult = {
            id: generateId(),
            crop: crop?.name || params.crop,
            cropSi: crop?.nameSi || params.crop,
            variety: params.variety,
            landSize: params.landSize,
            landUnit: params.landUnit,
            district: params.district,
            season: params.season,
            expectedYield: params.expectedYield,
            priceLow: result.priceLow,
            priceHigh: result.priceHigh,
            summary: result.summary,
            summarySi: result.summarySi,
            createdAt: new Date().toISOString(),
            synced: isConnected,
        };

        await savePredictionResult(predictionResult);
        setSaved(true);
    };

    const handleAskExpert = () => {
        navigation.navigate('ChatsList', {
            attachPrediction: {
                crop: params.crop,
                result,
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header
                    title={t('ai.price_prediction')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <View style={styles.loaderCircle}>
                        <ActivityIndicator size="large" color={COLORS.info} />
                    </View>
                    <Text style={styles.loadingTitle}>
                        {t('ai.predicting')}
                    </Text>
                    <Text style={styles.loadingSubtitle}>Analyzing market data...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title={t('ai.price_result')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Crop Header */}
                <View style={styles.headerBanner}>
                    <View style={styles.headerContent}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>{crop?.icon}</Text>
                        </View>
                        <View>
                            <Text style={styles.cropName}>
                                {i18n.language === 'si' ? crop?.nameSi : crop?.name}
                            </Text>
                            {params.variety && (
                                <Text style={styles.headerText}>Variety: {params.variety}</Text>
                            )}
                            <Text style={styles.headerText}>
                                {params.landSize} {params.landUnit}
                                {params.district && ` • ${params.district}`}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Price Range */}
                    <View style={styles.card}>
                        <Text style={styles.rangeLabel}>
                            {t('ai.price_range')}
                        </Text>

                        <View style={styles.priceRow}>
                            <View style={styles.priceItem}>
                                <Text style={styles.priceLabel}>{t('ai.low_estimate')}</Text>
                                <Text style={styles.lowPrice}>
                                    Rs. {result?.priceLow?.toLocaleString() || '---'}
                                </Text>
                            </View>

                            <View style={styles.arrowContainer}>
                                <Ionicons name="arrow-forward" size={24} color={COLORS.neutral[300]} />
                            </View>

                            <View style={styles.priceItem}>
                                <Text style={styles.priceLabel}>{t('ai.high_estimate')}</Text>
                                <Text style={styles.highPrice}>
                                    Rs. {result?.priceHigh?.toLocaleString() || '---'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.unitText}>
                            {t('ai.per_kg')}
                        </Text>

                        {/* Estimated Yield & Revenue */}
                        {estYieldKg != null && (
                            <View style={styles.yieldContainer}>
                                <View style={styles.yieldDivider} />
                                <View style={styles.yieldRow}>
                                    <View style={styles.yieldItem}>
                                        <Ionicons name="leaf-outline" size={16} color={COLORS.success} />
                                        <Text style={styles.yieldLabel}>
                                            {i18n.language === 'si' ? 'ඇස්.අස්වනු' : 'Est. Yield'}
                                        </Text>
                                        <Text style={styles.yieldValue}>
                                            {estYieldKg.toLocaleString()} kg
                                        </Text>
                                    </View>
                                    <View style={styles.yieldSeparator} />
                                    <View style={styles.yieldItem}>
                                        <Ionicons name="cash-outline" size={16} color={COLORS.info} />
                                        <Text style={styles.yieldLabel}>
                                            {i18n.language === 'si' ? 'ඇස්.ආදායම' : 'Est. Revenue'}
                                        </Text>
                                        <Text style={styles.yieldValue}>
                                            {result?.priceLow && result?.priceHigh
                                                ? `Rs. ${(estYieldKg * result.priceLow).toLocaleString()} – ${(estYieldKg * result.priceHigh).toLocaleString()}`
                                                : '---'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Summary */}
                    <View style={styles.summaryCard}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="analytics" size={20} color={COLORS.info} />
                            <Text style={styles.summaryTitle}>
                                {t('ai.summary')}
                            </Text>
                        </View>
                        <Text style={styles.summaryText}>
                            {i18n.language === 'si' ? result?.summarySi : result?.summary}
                        </Text>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoCardGreen}>
                            <Ionicons name="trending-up" size={20} color={COLORS.success} />
                            <Text style={styles.infoCardLabelGreen}>Best selling period</Text>
                            <Text style={styles.infoCardValueGreen}>Peak Season</Text>
                        </View>
                        <View style={styles.infoSpacer} />
                        <View style={styles.infoCardOrange}>
                            <Ionicons name="information-circle" size={20} color={COLORS.warning} />
                            <Text style={styles.infoCardLabelOrange}>Market condition</Text>
                            <Text style={styles.infoCardValueOrange}>Moderate demand</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <View style={styles.actionButtonWrapper}>
                            <PrimaryButton
                                title={saved ? t('learnhub.saved') : t('ai.save_prediction')}
                                onPress={handleSave}
                                disabled={saved}
                                icon={saved ? 'checkmark' : 'bookmark-outline'}
                                variant="outline"
                                fullWidth
                            />
                        </View>
                        <View style={styles.actionSpacer} />
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
        backgroundColor: '#dbeafe', // blue-100
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
    headerBanner: {
        backgroundColor: '#3b82f6', // blue-500
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 30,
    },
    cropName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerText: {
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    rangeLabel: {
        fontSize: 14,
        color: COLORS.neutral[400],
        textAlign: 'center',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceItem: {
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
    },
    lowPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f97316', // orange-500
    },
    highPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#22c55e', // green-500
    },
    arrowContainer: {
        marginHorizontal: 16,
        alignItems: 'center',
    },
    unitText: {
        textAlign: 'center',
        color: COLORS.neutral[400],
        fontSize: 14,
        marginTop: 8,
    },
    yieldContainer: {
        marginTop: 16,
    },
    yieldDivider: {
        height: 1,
        backgroundColor: COLORS.neutral[100],
        marginBottom: 12,
    },
    yieldRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    yieldItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    yieldSeparator: {
        width: 1,
        backgroundColor: COLORS.neutral[100],
        marginHorizontal: 8,
    },
    yieldLabel: {
        fontSize: 11,
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
        marginTop: 2,
    },
    yieldValue: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.neutral[700],
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#eff6ff', // blue-50
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e40af', // blue-800
        marginLeft: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#1d4ed8', // blue-700
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    infoCardGreen: {
        flex: 1,
        backgroundColor: '#f0fdf4', // green-50
        borderRadius: 12,
        padding: 12,
    },
    infoCardLabelGreen: {
        fontSize: 12,
        color: '#15803d', // green-700
        marginTop: 4,
    },
    infoCardValueGreen: {
        fontSize: 14,
        fontWeight: '500',
        color: '#166534', // green-800
    },
    infoSpacer: {
        width: 8,
    },
    infoCardOrange: {
        flex: 1,
        backgroundColor: '#fff7ed', // orange-50
        borderRadius: 12,
        padding: 12,
    },
    infoCardLabelOrange: {
        fontSize: 12,
        color: '#c2410c', // orange-700
        marginTop: 4,
    },
    infoCardValueOrange: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9a3412', // orange-800
    },
    actionsContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    actionButtonWrapper: {
        flex: 1,
    },
    actionSpacer: {
        width: 8,
    },
});

export default PriceResult;
