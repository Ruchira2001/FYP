import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { getDiagnosisHistory, DiagnosisResult } from '../../../services/storage';
import { formatDateTime } from '../../../utils/validators';

const DiagnosisHistory: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [history, setHistory] = useState<DiagnosisResult[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const data = await getDiagnosisHistory();
        setHistory(data);
    };

    const renderItem = ({ item }: { item: DiagnosisResult }) => (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 flex-row"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            <Image
                source={{ uri: item.imageUri }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
            />

            <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-neutral-800">
                    {i18n.language === 'si' ? item.diseaseNameSi : item.diseaseName}
                </Text>
                <Text className="text-xs text-neutral-400 mt-1">
                    {formatDateTime(item.createdAt, i18n.language)}
                </Text>

                <View className="flex-row items-center mt-2">
                    {item.synced ? (
                        <View className="flex-row items-center">
                            <Ionicons name="cloud-done" size={14} color={COLORS.success} />
                            <Text className="text-xs text-green-600 ml-1">Synced</Text>
                        </View>
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="cloud-offline" size={14} color={COLORS.warning} />
                            <Text className="text-xs text-yellow-600 ml-1">Pending sync</Text>
                        </View>
                    )}

                    <View className="flex-row items-center ml-4">
                        <Text className="text-xs text-neutral-400">Confidence: </Text>
                        <Text className="text-xs font-medium text-neutral-600">
                            {Math.round(item.confidence * 100)}%
                        </Text>
                    </View>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-neutral-50">
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
                    contentContainerStyle={{ padding: 16 }}
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

export default DiagnosisHistory;
