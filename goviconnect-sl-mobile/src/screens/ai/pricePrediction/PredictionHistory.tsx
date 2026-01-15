import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { getPredictionHistory, PredictionResult } from '../../../services/storage';
import { formatDateTime } from '../../../utils/validators';
import cropsData from '../../../data/crops.json';

const PredictionHistory: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [history, setHistory] = useState<PredictionResult[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const data = await getPredictionHistory();
        setHistory(data);
    };

    const getCropIcon = (cropName: string) => {
        const crop = cropsData.crops.find(c =>
            c.name.toLowerCase() === cropName.toLowerCase() ||
            c.id === cropName.toLowerCase()
        );
        return crop?.icon || '🌱';
    };

    const renderItem = ({ item }: { item: PredictionResult }) => (
        <TouchableOpacity
            style={styles.card}
            // Add handler later if we want to view past result details
            onPress={() => { /* navigation.navigate('PriceResult', { ...item }); */ }}
        >
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{getCropIcon(item.crop)}</Text>
                </View>

                <View style={styles.mainInfo}>
                    <Text style={styles.title}>
                        {i18n.language === 'si' ? item.cropSi : item.crop}
                        {item.variety && ` (${item.variety})`}
                    </Text>
                    <Text style={styles.subtitle}>
                        {item.landSize} {item.landUnit}
                        {item.district && ` • ${item.district}`}
                    </Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLow}>
                            Rs. {item.priceLow}
                        </Text>
                        <Ionicons name="arrow-forward" size={12} color={COLORS.neutral[400]} style={{ marginHorizontal: 4 }} />
                        <Text style={styles.priceHigh}>
                            Rs. {item.priceHigh}
                        </Text>
                        <Text style={styles.unit}>{t('ai.per_kg')}</Text>
                    </View>
                </View>

                <View style={styles.metaInfo}>
                    <Text style={styles.date}>
                        {formatDateTime(item.createdAt, i18n.language)}
                    </Text>
                    {item.synced ? (
                        <View style={styles.syncIcon}>
                            <Ionicons name="cloud-done" size={12} color={COLORS.success} />
                        </View>
                    ) : (
                        <View style={styles.syncIcon}>
                            <Ionicons name="cloud-offline" size={12} color={COLORS.warning} />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title={t('ai.prediction_history')}
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
                    icon="analytics"
                    title={t('ai.no_history')}
                    description="Your price predictions will appear here"
                    actionLabel={t('ai.price_prediction')}
                    onAction={() => navigation.navigate('PriceForm')}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#dbeafe', // blue-100
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 24,
    },
    mainInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    priceLow: {
        fontSize: 14,
        fontWeight: '500',
        color: '#f97316', // orange-500
    },
    priceHigh: {
        fontSize: 14,
        fontWeight: '500',
        color: '#22c55e', // green-500
    },
    unit: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginLeft: 4,
    },
    metaInfo: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    date: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    syncIcon: {
        marginTop: 4,
    },
});

export default PredictionHistory;
