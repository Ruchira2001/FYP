import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { PredictionResult } from '../../../services/storage';
import { formatDateTime } from '../../../utils/validators';
import cropsData from '../../../data/crops.json';

// Yield reference values (same as PriceResult)
const YIELD_PER_ACRE: Record<string, number> = {
    tea: 1500, paddy: 2000, tomato: 8000, chili: 1500,
    potato: 6000, carrot: 8000, cabbage: 10000, beans: 2500,
    mango: 3000, banana: 8000, coconut: 1750, cinnamon: 300,
    pepper: 500, ginger: 4000, turmeric: 5000,
};

const LAND_UNIT_TO_ACRES: Record<string, number> = {
    acres: 1, hectares: 2.47105, perches: 0.00625,
};

function estimateYieldKg(cropId: string, landSize: number, landUnit: string): number | null {
    const ypa = YIELD_PER_ACRE[cropId.toLowerCase()];
    const factor = LAND_UNIT_TO_ACRES[landUnit.toLowerCase()];
    if (!ypa || !factor) return null;
    return Math.round(landSize * factor * ypa);
}

type ParamList = {
    PredictionDetail: { item: PredictionResult };
};

const PredictionDetail: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'PredictionDetail'>>();
    const { item } = route.params;
    const { t, i18n } = useTranslation();

    const crop = cropsData.crops.find(
        c => c.name.toLowerCase() === item.crop.toLowerCase() || c.id === item.crop.toLowerCase()
    );

    const estYieldKg = item.expectedYield
        ? parseInt(item.expectedYield, 10) || null
        : estimateYieldKg(item.crop, item.landSize, item.landUnit);

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
                            <Text style={styles.icon}>{crop?.icon ?? '🌱'}</Text>
                        </View>
                        <View style={styles.headerTextBlock}>
                            <Text style={styles.cropName}>
                                {i18n.language === 'si' ? (item.cropSi || item.crop) : item.crop}
                                {item.variety ? ` (${item.variety})` : ''}
                            </Text>
                            <Text style={styles.headerSub}>
                                {item.landSize} {item.landUnit}
                                {item.district ? ` • ${item.district}` : ''}
                                {item.season ? ` • ${item.season}` : ''}
                            </Text>
                            <Text style={styles.headerDate}>
                                {formatDateTime(item.createdAt, i18n.language)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Price Range Card */}
                    <View style={styles.card}>
                        <Text style={styles.rangeLabel}>{t('ai.price_range')}</Text>

                        <View style={styles.priceRow}>
                            <View style={styles.priceItem}>
                                <Text style={styles.priceLabel}>{t('ai.low_estimate')}</Text>
                                <Text style={styles.lowPrice}>
                                    Rs. {item.priceLow.toLocaleString()}
                                </Text>
                            </View>

                            <View style={styles.arrowContainer}>
                                <Ionicons name="arrow-forward" size={24} color={COLORS.neutral[300]} />
                            </View>

                            <View style={styles.priceItem}>
                                <Text style={styles.priceLabel}>{t('ai.high_estimate')}</Text>
                                <Text style={styles.highPrice}>
                                    Rs. {item.priceHigh.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.unitText}>{t('ai.per_kg')}</Text>

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
                                            {`Rs. ${(estYieldKg * item.priceLow).toLocaleString()} – ${(estYieldKg * item.priceHigh).toLocaleString()}`}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Summary Card */}
                    {(item.summary || item.summarySi) && (
                        <View style={styles.summaryCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="analytics" size={20} color={COLORS.info} />
                                <Text style={styles.summaryTitle}>{t('ai.summary')}</Text>
                            </View>
                            <Text style={styles.summaryText}>
                                {i18n.language === 'si' ? (item.summarySi || item.summary) : item.summary}
                            </Text>
                        </View>
                    )}

                    {/* Meta Info */}
                    <View style={styles.metaCard}>
                        <View style={styles.metaRow}>
                            <Ionicons name="calendar-outline" size={16} color={COLORS.neutral[400]} />
                            <Text style={styles.metaLabel}>
                                {i18n.language === 'si' ? 'දිනය' : 'Recorded'}
                            </Text>
                            <Text style={styles.metaValue}>
                                {formatDateTime(item.createdAt, i18n.language)}
                            </Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons
                                name={item.synced ? 'cloud-done-outline' : 'cloud-offline-outline'}
                                size={16}
                                color={item.synced ? COLORS.success : COLORS.warning}
                            />
                            <Text style={styles.metaLabel}>
                                {i18n.language === 'si' ? 'තත්ත්වය' : 'Status'}
                            </Text>
                            <Text style={[styles.metaValue, { color: item.synced ? COLORS.success : COLORS.warning }]}>
                                {item.synced
                                    ? (i18n.language === 'si' ? 'සමමුහුර්ත කළා' : 'Synced')
                                    : (i18n.language === 'si' ? 'සමමුහුර්ත නැත' : 'Not synced')}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },
    scrollView: { flex: 1 },
    headerBanner: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    headerContent: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        width: 64, height: 64,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    icon: { fontSize: 30 },
    headerTextBlock: { flex: 1 },
    cropName: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
    headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
    headerDate: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
    content: { padding: 16 },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16, padding: 24, marginBottom: 16,
        borderWidth: 1, borderColor: COLORS.neutral[100],
    },
    rangeLabel: {
        fontSize: 14, color: COLORS.neutral[400],
        textAlign: 'center', marginBottom: 8,
    },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    priceItem: { alignItems: 'center' },
    priceLabel: { fontSize: 12, color: COLORS.neutral[400], textTransform: 'uppercase' },
    lowPrice: { fontSize: 24, fontWeight: 'bold', color: '#f97316' },
    highPrice: { fontSize: 24, fontWeight: 'bold', color: '#22c55e' },
    arrowContainer: { marginHorizontal: 16 },
    unitText: { textAlign: 'center', color: COLORS.neutral[400], fontSize: 14, marginTop: 8 },
    yieldContainer: { marginTop: 16 },
    yieldDivider: { height: 1, backgroundColor: COLORS.neutral[100], marginBottom: 12 },
    yieldRow: { flexDirection: 'row', alignItems: 'stretch' },
    yieldItem: { flex: 1, alignItems: 'center', gap: 2 },
    yieldSeparator: { width: 1, backgroundColor: COLORS.neutral[100], marginHorizontal: 8 },
    yieldLabel: {
        fontSize: 11, color: COLORS.neutral[400],
        textTransform: 'uppercase', marginTop: 2,
    },
    yieldValue: {
        fontSize: 13, fontWeight: '600',
        color: COLORS.neutral[700], textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 16, padding: 16, marginBottom: 16,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    summaryTitle: {
        fontSize: 16, fontWeight: '600',
        color: '#1e40af', marginLeft: 8,
    },
    summaryText: { fontSize: 14, color: '#1d4ed8', lineHeight: 20 },
    metaCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: COLORS.neutral[100],
        gap: 10,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaLabel: { fontSize: 13, color: COLORS.neutral[500], flex: 1 },
    metaValue: { fontSize: 13, fontWeight: '500', color: COLORS.neutral[700] },
});

export default PredictionDetail;
