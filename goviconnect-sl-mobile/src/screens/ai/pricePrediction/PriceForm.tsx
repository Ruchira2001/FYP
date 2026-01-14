import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
        <View className="p-4">
            <Text className="text-lg font-semibold text-neutral-800 mb-2">
                {t('ai.select_crop')}
            </Text>
            <Text className="text-sm text-neutral-500 mb-4">
                Choose the crop you want to predict prices for
            </Text>

            <View className="flex-row flex-wrap">
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

            <View className="mt-6">
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
        <View className="p-4">
            <Text className="text-lg font-semibold text-neutral-800 mb-2">
                {t('ai.land_size')}
            </Text>
            <Text className="text-sm text-neutral-500 mb-4">
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

            <Text className="text-sm font-medium text-neutral-600 mb-2">Unit</Text>
            <View className="flex-row flex-wrap mb-6">
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
        <View className="p-4">
            <Text className="text-lg font-semibold text-neutral-800 mb-2">
                Additional Details (Optional)
            </Text>
            <Text className="text-sm text-neutral-500 mb-4">
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
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('ai.price_prediction')}
                showBack
                onBackPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Progress Steps */}
                <View className="flex-row items-center px-4 py-4">
                    {[1, 2, 3].map((s, index) => (
                        <React.Fragment key={s}>
                            <TouchableOpacity
                                onPress={() => s < step && setStep(s)}
                                className={`w-10 h-10 rounded-full items-center justify-center ${s <= step ? 'bg-primary-500' : 'bg-neutral-200'
                                    }`}
                            >
                                {s < step ? (
                                    <Ionicons name="checkmark" size={18} color="white" />
                                ) : (
                                    <Text className={`text-sm font-semibold ${s <= step ? 'text-white' : 'text-neutral-400'
                                        }`}>
                                        {s}
                                    </Text>
                                )}
                            </TouchableOpacity>
                            {index < 2 && (
                                <View
                                    className={`flex-1 h-1 mx-2 rounded-full ${s < step ? 'bg-primary-500' : 'bg-neutral-200'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                {/* Step Labels */}
                <View className="flex-row px-4 mb-4">
                    <Text className={`flex-1 text-center text-xs ${step >= 1 ? 'text-primary-600' : 'text-neutral-400'}`}>
                        {t('ai.select_crop')}
                    </Text>
                    <Text className={`flex-1 text-center text-xs ${step >= 2 ? 'text-primary-600' : 'text-neutral-400'}`}>
                        {t('ai.land_size')}
                    </Text>
                    <Text className={`flex-1 text-center text-xs ${step >= 3 ? 'text-primary-600' : 'text-neutral-400'}`}>
                        Details
                    </Text>
                </View>

                {/* Form Steps */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                {/* Summary Card (on step 3) */}
                {step === 3 && selectedCrop && (
                    <View className="mx-4 bg-primary-50 rounded-xl p-4 mb-4">
                        <Text className="text-sm font-semibold text-primary-800 mb-2">Summary</Text>
                        <View className="flex-row items-center">
                            <Text className="text-2xl mr-2">{getCropDisplay(selectedCrop).icon}</Text>
                            <View>
                                <Text className="text-base font-medium text-primary-700">
                                    {getCropDisplay(selectedCrop).name}
                                    {variety && ` (${variety})`}
                                </Text>
                                <Text className="text-sm text-primary-600">
                                    {landSize} {landUnit}
                                    {district && `, ${district}`}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Action Buttons */}
            <View className="p-4 border-t border-neutral-100 bg-white">
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

export default PriceForm;
