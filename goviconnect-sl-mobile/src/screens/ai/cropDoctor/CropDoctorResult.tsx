import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { analyzeCropImage } from '../../../services/mockApi';
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
            <View className="flex-1 bg-neutral-50">
                <Header
                    title={t('ai.crop_doctor')}
                    showBack
                    onBackPress={() => navigation.goBack()}
                />
                <View className="flex-1 items-center justify-center">
                    <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
                        <ActivityIndicator size="large" color={COLORS.primary[500]} />
                    </View>
                    <Text className="text-lg font-semibold text-neutral-700 mb-2">
                        {t('ai.analyzing')}
                    </Text>
                    <Text className="text-sm text-neutral-400">Please wait...</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('ai.diagnosis_result')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Image */}
                <Image
                    source={{ uri: imageUri }}
                    className="w-full h-48"
                    resizeMode="cover"
                />

                <View className="p-4">
                    {/* Disease Name */}
                    <View className="bg-white rounded-2xl p-4 mb-4 border border-neutral-100">
                        <Text className="text-xs text-neutral-400 uppercase mb-1">
                            {t('ai.disease_name')}
                        </Text>
                        <Text className="text-xl font-bold text-red-600">
                            {i18n.language === 'si' ? result?.diseaseNameSi : result?.diseaseName}
                        </Text>

                        {result?.confidence > 0 && (
                            <View className="flex-row items-center mt-2">
                                <Text className="text-xs text-neutral-400 mr-2">{t('ai.confidence')}:</Text>
                                <View className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${result.confidence * 100}%` }}
                                    />
                                </View>
                                <Text className="text-xs font-medium text-neutral-600 ml-2">
                                    {Math.round(result.confidence * 100)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Treatments */}
                    <View className="bg-white rounded-2xl p-4 mb-4 border border-neutral-100">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="medical" size={20} color={COLORS.success} />
                            <Text className="text-base font-semibold text-neutral-800 ml-2">
                                {t('ai.treatment_tips')}
                            </Text>
                        </View>

                        {(i18n.language === 'si' ? result?.treatmentsSi : result?.treatments)?.map((tip: string, index: number) => (
                            <View key={index} className="flex-row items-start mb-2">
                                <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-2">
                                    <Text className="text-green-600 text-xs font-bold">{index + 1}</Text>
                                </View>
                                <Text className="flex-1 text-sm text-neutral-700">{tip}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Prevention */}
                    {result?.preventionTips?.length > 0 && (
                        <View className="bg-blue-50 rounded-2xl p-4 mb-4">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="shield-checkmark" size={20} color={COLORS.info} />
                                <Text className="text-base font-semibold text-blue-800 ml-2">
                                    {t('ai.prevention_tips')}
                                </Text>
                            </View>

                            {(i18n.language === 'si' ? result?.preventionTipsSi : result?.preventionTips)?.map((tip: string, index: number) => (
                                <View key={index} className="flex-row items-start mb-2">
                                    <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                                    <Text className="flex-1 text-sm text-blue-700 ml-2">{tip}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row mt-2">
                        <View className="flex-1 mr-2">
                            <PrimaryButton
                                title={saved ? t('learnhub.saved') : t('ai.save_result')}
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

export default CropDoctorResult;
