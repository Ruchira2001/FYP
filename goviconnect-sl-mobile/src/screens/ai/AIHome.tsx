import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Header, ActionCard } from '../../components';
import { COLORS } from '../../utils/constants';

const AIHome: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Header title={t('ai.title')} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* AI Crop Doctor */}
                <View style={styles.cardWrapper}>
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
                <View style={styles.cardWrapper}>
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
                <View style={styles.historyRow}>
                    <View style={styles.historyCardWrapper}>
                        <ActionCard
                            title={t('ai.diagnosis_history')}
                            icon="time"
                            iconColor={COLORS.secondary[600]}
                            iconBgColor={COLORS.secondary[50]}
                            onPress={() => navigation.navigate('DiagnosisHistory')}
                            size="sm"
                        />
                    </View>
                    <View style={styles.halfSpacer} />
                    <View style={styles.historyCardWrapper}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    content: {
        flex: 1,
        padding: 16,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    historyRow: {
        flexDirection: 'row',
        marginTop: 16,
    },
    historyCardWrapper: {
        flex: 1,
    },
    halfSpacer: {
        width: 12,
    },
});

export default AIHome;
