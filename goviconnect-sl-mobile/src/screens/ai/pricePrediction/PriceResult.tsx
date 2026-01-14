import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { predictCropPrice } from '../../../services/mockApi';
import { savePredictionResult, PredictionResult } from '../../../services/storage';
import { queueService } from '../../../services/queueService';
import { useConnectionStatus } from '../../../services/netinfo';
import { generateId, formatCurrency } from '../../../utils/validators';
import cropsData from '../../../data/crops.json';

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

    useEffect(() => {
        getPrediction();
    }, []);

    const getPrediction = async () => {
        setLoading(true);
        try {
            if (isConnected) {
                const response = await predictCropPrice(
                    params.crop,
                    params.landSize,
                    params.landUnit,
                    params.district,
                    params.season
                );
                setResult(response);
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
            <View className="flex-1 bg-neutral-50">
                <Header
                    title={t('ai.price_prediction')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View className="flex-1 items-center justify-center">
                    <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
                        <ActivityIndicator size="large" color={COLORS.info} />
                    </View>
                    <Text className="text-lg font-semibold text-neutral-700 mb-2">
                        {t('ai.predicting')}
                    </Text>
                    <Text className="text-sm text-neutral-400">Analyzing market data...</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('ai.price_result')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Crop Header */}
                <View className="bg-blue-500 px-4 py-6">
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4">
                            <Text className="text-3xl">{crop?.icon}</Text>
                        </View>
                        <View>
                            <Text className="text-2xl font-bold text-white">
                                {i18n.language === 'si' ? crop?.nameSi : crop?.name}
                            </Text>
                            {params.variety && (
                                <Text className="text-white/80">Variety: {params.variety}</Text>
                            )}
                            <Text className="text-white/80">
                                {params.landSize} {params.landUnit}
                                {params.district && ` • ${params.district}`}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="p-4">
                    {/* Price Range */}
                    <View className="bg-white rounded-2xl p-6 mb-4 border border-neutral-100">
                        <Text className="text-sm text-neutral-400 text-center mb-2">
                            {t('ai.price_range')}
                        </Text>

                        <View className="flex-row items-center justify-center">
                            <View className="items-center">
                                <Text className="text-xs text-neutral-400 uppercase">{t('ai.low_estimate')}</Text>
                                <Text className="text-2xl font-bold text-orange-500">
                                    Rs. {result?.priceLow?.toLocaleString() || '---'}
                                </Text>
                            </View>

                            <View className="mx-4 items-center">
                                <Ionicons name="arrow-forward" size={24} color={COLORS.neutral[300]} />
                            </View>

                            <View className="items-center">
                                <Text className="text-xs text-neutral-400 uppercase">{t('ai.high_estimate')}</Text>
                                <Text className="text-2xl font-bold text-green-500">
                                    Rs. {result?.priceHigh?.toLocaleString() || '---'}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-center text-neutral-400 text-sm mt-2">
                            {t('ai.per_kg')}
                        </Text>
                    </View>

                    {/* Summary */}
                    <View className="bg-blue-50 rounded-2xl p-4 mb-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="analytics" size={20} color={COLORS.info} />
                            <Text className="text-base font-semibold text-blue-800 ml-2">
                                {t('ai.summary')}
                            </Text>
                        </View>
                        <Text className="text-sm text-blue-700 leading-5">
                            {i18n.language === 'si' ? result?.summarySi : result?.summary}
                        </Text>
                    </View>

                    {/* Info Cards */}
                    <View className="flex-row mb-4">
                        <View className="flex-1 bg-green-50 rounded-xl p-3 mr-2">
                            <Ionicons name="trending-up" size={20} color={COLORS.success} />
                            <Text className="text-xs text-green-700 mt-1">Best selling period</Text>
                            <Text className="text-sm font-medium text-green-800">Peak Season</Text>
                        </View>
                        <View className="flex-1 bg-orange-50 rounded-xl p-3">
                            <Ionicons name="information-circle" size={20} color={COLORS.warning} />
                            <Text className="text-xs text-orange-700 mt-1">Market condition</Text>
                            <Text className="text-sm font-medium text-orange-800">Moderate demand</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row mt-2">
                        <View className="flex-1 mr-2">
                            <PrimaryButton
                                title={saved ? t('learnhub.saved') : t('ai.save_prediction')}
                                onPress={handleSave}
                                disabled={saved}
                                icon={saved ? 'checkmark' : 'bookmark-outline'}
                                variant="outline"
                                fullWidth
                            />
                        </View>
                        <View className="flex-1">
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

export default PriceResult;
