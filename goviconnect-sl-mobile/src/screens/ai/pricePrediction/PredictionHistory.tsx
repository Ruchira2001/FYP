import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
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
            className="bg-white rounded-xl p-4 mb-3 border border-neutral-100"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            <View className="flex-row items-start">
                <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-3">
                    <Text className="text-2xl">{getCropIcon(item.crop)}</Text>
                </View>

                <View className="flex-1">
                    <Text className="text-base font-semibold text-neutral-800">
                        {i18n.language === 'si' ? item.cropSi : item.crop}
                        {item.variety && ` (${item.variety})`}
                    </Text>
                    <Text className="text-xs text-neutral-400 mt-0.5">
                        {item.landSize} {item.landUnit}
                        {item.district && ` • ${item.district}`}
                    </Text>

                    <View className="flex-row items-center mt-2">
                        <Text className="text-sm font-medium text-orange-500">
                            Rs. {item.priceLow}
                        </Text>
                        <Ionicons name="arrow-forward" size={12} color={COLORS.neutral[400]} style={{ marginHorizontal: 4 }} />
                        <Text className="text-sm font-medium text-green-500">
                            Rs. {item.priceHigh}
                        </Text>
                        <Text className="text-xs text-neutral-400 ml-1">{t('ai.per_kg')}</Text>
                    </View>
                </View>

                <View className="items-end">
                    <Text className="text-xs text-neutral-400">
                        {formatDateTime(item.createdAt, i18n.language)}
                    </Text>
                    {item.synced ? (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="cloud-done" size={12} color={COLORS.success} />
                        </View>
                    ) : (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="cloud-offline" size={12} color={COLORS.warning} />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-neutral-50">
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
                    contentContainerStyle={{ padding: 16 }}
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

export default PredictionHistory;
