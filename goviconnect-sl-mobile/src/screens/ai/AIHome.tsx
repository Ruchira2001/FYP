import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Header, ActionCard } from '../../components';
import { COLORS } from '../../utils/constants';

const AIHome: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title={t('ai.title')} />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* AI Crop Doctor */}
                <View className="mb-4">
                    <ActionCard
                        title={t('ai.crop_doctor')}
                        description={t('ai.crop_doctor_desc')}
                        icon="medical"
                        iconColor={COLORS.error}
                        iconBgColor="#fee2e2"
                        onPress={() => navigation.navigate('CropDoctorUpload')}
                        size="lg"
                    />
                </View>

                {/* AI Price Prediction */}
                <View className="mb-4">
                    <ActionCard
                        title={t('ai.price_prediction')}
                        description={t('ai.price_prediction_desc')}
                        icon="trending-up"
                        iconColor={COLORS.info}
                        iconBgColor="#dbeafe"
                        onPress={() => navigation.navigate('PriceForm')}
                        size="lg"
                    />
                </View>

                {/* Quick Access to History */}
                <View className="flex-row mt-4">
                    <View className="flex-1 mr-2">
                        <ActionCard
                            title={t('ai.diagnosis_history')}
                            icon="time"
                            iconColor={COLORS.secondary[600]}
                            iconBgColor={COLORS.secondary[50]}
                            onPress={() => navigation.navigate('DiagnosisHistory')}
                            size="sm"
                        />
                    </View>
                    <View className="flex-1">
                        <ActionCard
                            title={t('ai.prediction_history')}
                            icon="analytics"
                            iconColor={COLORS.primary[600]}
                            iconBgColor={COLORS.primary[50]}
                            onPress={() => navigation.navigate('PredictionHistory')}
                            size="sm"
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default AIHome;
