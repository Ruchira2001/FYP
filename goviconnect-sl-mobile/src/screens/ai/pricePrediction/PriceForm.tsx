import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField, Chip } from '../../../components';
import { COLORS, LAND_UNITS } from '../../../utils/constants';
import cropsData from '../../../data/crops.json';

const PriceForm: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [step, setStep] = useState(1);
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [variety, setVariety] = useState('');
    const [landSize, setLandSize] = useState('');
    const [landUnit, setLandUnit] = useState('acres');
    const [district, setDistrict] = useState('');
    const [season, setSeason] = useState('');
    const [expectedYield, setExpectedYield] = useState('');

    const getCropDisplay = (cropId: string) => {
        const crop = cropsData.crops.find(c => c.id === cropId);
        return {
            name: i18n.language === 'si' ? crop?.nameSi : crop?.name,
            icon: crop?.icon,
        };
    };

    const handleNext = () => {
        if (step === 1 && selectedCrop) {
            setStep(2);
        } else if (step === 2 && landSize) {
            setStep(3);
        }
    };

    const handlePredict = () => {
        navigation.navigate('PriceResult', {
            crop: selectedCrop,
            variety,
            landSize: parseFloat(landSize),
            landUnit,
            district,
            season,
            expectedYield,
        });
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
                {t('ai.select_crop')}
            </Text>
            <Text style={styles.stepDescription}>
                Choose the crop you want to predict prices for
            </Text>

            <View style={styles.chipContainer}>
                {cropsData.crops.map((crop) => (
                    <Chip
                        key={crop.id}
                        label={i18n.language === 'si' ? crop.nameSi : crop.name}
                        emoji={crop.icon}
                        selected={selectedCrop === crop.id}
                        onPress={() => setSelectedCrop(crop.id)}
                        variant="outline"
                        size="md"
                    />
                ))}
            </View>

            <View style={styles.inputContainer}>
                <InputField
                    label={t('ai.crop_variety')}
                    placeholder="e.g., TRI 2023, Red Lady"
                    value={variety}
                    onChangeText={setVariety}
                    icon="leaf-outline"
                />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
                {t('ai.land_size')}
            </Text>
            <Text style={styles.stepDescription}>
                Enter the size of land for this crop
            </Text>

            <InputField
                label={t('ai.land_size')}
                placeholder="Enter size"
                value={landSize}
                onChangeText={setLandSize}
                keyboardType="numeric"
                icon="resize-outline"
            />

            <Text style={styles.sectionLabel}>Unit</Text>
            <View style={styles.chipContainer}>
                {LAND_UNITS.map((unit) => (
                    <Chip
                        key={unit.id}
                        label={i18n.language === 'si' ? unit.nameSi : unit.nameEn}
                        selected={landUnit === unit.id}
                        onPress={() => setLandUnit(unit.id)}
                        variant="outline"
                        size="md"
                    />
                ))}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
                Additional Details (Optional)
            </Text>
            <Text style={styles.stepDescription}>
                More details help improve prediction accuracy
            </Text>

            <InputField
                label={t('ai.district_area')}
                placeholder="e.g., Kandy, Nuwara Eliya"
                value={district}
                onChangeText={setDistrict}
                icon="location-outline"
            />

            <InputField
                label={t('ai.season')}
                placeholder="e.g., Maha, Yala"
                value={season}
                onChangeText={setSeason}
                icon="calendar-outline"
            />

            <InputField
                label={t('ai.expected_yield')}
                placeholder="e.g., 500 kg"
                value={expectedYield}
                onChangeText={setExpectedYield}
                icon="scale-outline"
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Header
                title={t('ai.price_prediction')}
                showBack
                onBackPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Progress Steps */}
                <View style={styles.stepsIndicator}>
                    {[1, 2, 3].map((s, index) => (
                        <React.Fragment key={s}>
                            <TouchableOpacity
                                onPress={() => s < step && setStep(s)}
                                style={[
                                    styles.stepCircle,
                                    s <= step ? styles.stepCircleActive : styles.stepCircleInactive
                                ]}
                            >
                                {s < step ? (
                                    <Ionicons name="checkmark" size={18} color="white" />
                                ) : (
                                    <Text style={[
                                        styles.stepNumber,
                                        s <= step ? styles.stepNumberActive : styles.stepNumberInactive
                                    ]}>
                                        {s}
                                    </Text>
                                )}
                            </TouchableOpacity>
                            {index < 2 && (
                                <View
                                    style={[
                                        styles.stepLine,
                                        s < step ? styles.stepLineActive : styles.stepLineInactive
                                    ]}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                {/* Step Labels */}
                <View style={styles.stepLabelsContainer}>
                    <Text style={[styles.stepLabel, step >= 1 ? styles.stepLabelActive : styles.stepLabelInactive]}>
                        {t('ai.select_crop')}
                    </Text>
                    <Text style={[styles.stepLabel, step >= 2 ? styles.stepLabelActive : styles.stepLabelInactive]}>
                        {t('ai.land_size')}
                    </Text>
                    <Text style={[styles.stepLabel, step >= 3 ? styles.stepLabelActive : styles.stepLabelInactive]}>
                        Details
                    </Text>
                </View>

                {/* Form Steps */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                {/* Summary Card (on step 3) */}
                {step === 3 && selectedCrop && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Summary</Text>
                        <View style={styles.summaryContent}>
                            <Text style={styles.cropIcon}>{getCropDisplay(selectedCrop).icon}</Text>
                            <View>
                                <Text style={styles.summaryCropName}>
                                    {getCropDisplay(selectedCrop).name}
                                    {variety && ` (${variety})`}
                                </Text>
                                <Text style={styles.summaryDetails}>
                                    {landSize} {landUnit}
                                    {district && `, ${district}`}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <PrimaryButton
                    title={step === 3 ? t('ai.predict_price') : t('common.next')}
                    onPress={step === 3 ? handlePredict : handleNext}
                    disabled={
                        (step === 1 && !selectedCrop) ||
                        (step === 2 && !landSize)
                    }
                    icon={step === 3 ? 'analytics' : 'chevron-forward'}
                    iconPosition="right"
                    fullWidth
                    size="lg"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    scrollView: {
        flex: 1,
    },
    stepsIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: COLORS.primary[500],
    },
    stepCircleInactive: {
        backgroundColor: COLORS.neutral[200],
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
    },
    stepNumberActive: {
        color: '#ffffff',
    },
    stepNumberInactive: {
        color: COLORS.neutral[400],
    },
    stepLine: {
        flex: 1,
        height: 4,
        marginHorizontal: 8,
        borderRadius: 2,
    },
    stepLineActive: {
        backgroundColor: COLORS.primary[500],
    },
    stepLineInactive: {
        backgroundColor: COLORS.neutral[200],
    },
    stepLabelsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    stepLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
    },
    stepLabelActive: {
        color: COLORS.primary[600],
    },
    stepLabelInactive: {
        color: COLORS.neutral[400],
    },
    stepContainer: {
        padding: 16,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        color: COLORS.neutral[500],
        marginBottom: 16,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    inputContainer: {
        marginTop: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[600],
        marginBottom: 8,
        marginTop: 8,
    },
    summaryCard: {
        marginHorizontal: 16,
        backgroundColor: COLORS.primary[50],
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary[800],
        marginBottom: 8,
    },
    summaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cropIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    summaryCropName: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.primary[700],
    },
    summaryDetails: {
        fontSize: 14,
        color: COLORS.primary[600],
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        backgroundColor: '#ffffff',
    },
});

export default PriceForm;
