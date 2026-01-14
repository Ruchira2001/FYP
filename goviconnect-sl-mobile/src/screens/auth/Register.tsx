import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';
import { PrimaryButton, InputField, Chip } from '../../components';
import { useApp } from '../../context';
import { validateEmail, validatePhone, validatePassword } from '../../utils/validators';
import cropsData from '../../data/crops.json';

const Register: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { register, isLoading } = useApp();

    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [district, setDistrict] = useState('');
    const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!validatePhone(phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                newErrors.password = passwordValidation.errors[0];
            }
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const toggleCrop = (cropId: string) => {
        setSelectedCrops(prev =>
            prev.includes(cropId)
                ? prev.filter(c => c !== cropId)
                : [...prev, cropId]
        );
    };

    const handleRegister = async () => {
        const success = await register({
            name,
            email,
            phone,
            district,
            crops: selectedCrops,
        });

        if (success) {
            navigation.replace('MainTabs');
        }
    };

    const renderStep1 = () => (
        <View>
            <InputField
                label={t('auth.full_name')}
                placeholder="Saman Perera"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                autoCapitalize="words"
                error={errors.name}
            />

            <InputField
                label={t('auth.email')}
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
            />

            <InputField
                label={t('auth.phone')}
                placeholder="077 123 4567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                icon="call-outline"
                error={errors.phone}
            />
        </View>
    );

    const renderStep2 = () => (
        <View>
            <InputField
                label={t('auth.password')}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
            />

            <InputField
                label={t('auth.confirm_password')}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                icon="lock-closed-outline"
                error={errors.confirmPassword}
            />

            <InputField
                label={t('auth.district')}
                placeholder="Kandy"
                value={district}
                onChangeText={setDistrict}
                icon="location-outline"
                autoCapitalize="words"
            />
        </View>
    );

    const renderStep3 = () => (
        <View>
            <Text className="text-sm text-neutral-600 mb-4">
                Select your main crops to get personalized recommendations:
            </Text>

            <View className="flex-row flex-wrap">
                {cropsData.crops.map((crop) => (
                    <Chip
                        key={crop.id}
                        label={i18n.language === 'si' ? crop.nameSi : crop.name}
                        emoji={crop.icon}
                        selected={selectedCrops.includes(crop.id)}
                        onPress={() => toggleCrop(crop.id)}
                        variant="outline"
                        size="md"
                    />
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 px-6 pt-12 pb-8">
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={handleBack}
                        className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center mb-6"
                    >
                        <Ionicons name="arrow-back" size={20} color={COLORS.neutral[700]} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-neutral-800 mb-2">
                            {t('auth.register_title')}
                        </Text>
                        <Text className="text-sm text-neutral-500">
                            {t('auth.register_subtitle')}
                        </Text>
                    </View>

                    {/* Progress Steps */}
                    <View className="flex-row items-center mb-8">
                        {[1, 2, 3].map((s, index) => (
                            <React.Fragment key={s}>
                                <View
                                    className={`w-8 h-8 rounded-full items-center justify-center ${s <= step ? 'bg-primary-500' : 'bg-neutral-200'
                                        }`}
                                >
                                    {s < step ? (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    ) : (
                                        <Text className={`text-sm font-semibold ${s <= step ? 'text-white' : 'text-neutral-400'
                                            }`}>
                                            {s}
                                        </Text>
                                    )}
                                </View>
                                {index < 2 && (
                                    <View
                                        className={`flex-1 h-1 mx-2 rounded-full ${s < step ? 'bg-primary-500' : 'bg-neutral-200'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* Form Steps */}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {/* Action Button */}
                    <View className="mt-6">
                        <PrimaryButton
                            title={step === 3 ? t('auth.register') : t('common.next')}
                            onPress={step === 3 ? handleRegister : handleNext}
                            loading={isLoading}
                            icon={step === 3 ? 'checkmark' : 'chevron-forward'}
                            iconPosition="right"
                            fullWidth
                            size="lg"
                        />
                    </View>

                    {/* Login Link */}
                    <View className="flex-row justify-center mt-8">
                        <Text className="text-neutral-500">
                            {t('auth.already_have_account')}{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-primary-600 font-semibold">
                                {t('auth.sign_in')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;
