import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from 'react-native';
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
            <Text style={styles.cropsLabel}>
                Select your main crops to get personalized recommendations:
            </Text>

            <View style={styles.cropsContainer}>
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
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={20} color={COLORS.neutral[700]} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {t('auth.register_title')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t('auth.register_subtitle')}
                        </Text>
                    </View>

                    {/* Progress Steps */}
                    <View style={styles.stepsContainer}>
                        {[1, 2, 3].map((s, index) => (
                            <React.Fragment key={s}>
                                <View
                                    style={[
                                        styles.stepCircle,
                                        s <= step ? styles.stepCircleActive : styles.stepCircleInactive
                                    ]}
                                >
                                    {s < step ? (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    ) : (
                                        <Text style={[
                                            styles.stepNumber,
                                            s <= step ? styles.stepNumberActive : styles.stepNumberInactive
                                        ]}>
                                            {s}
                                        </Text>
                                    )}
                                </View>
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

                    {/* Form Steps */}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {/* Action Button */}
                    <View style={styles.actionButton}>
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
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>
                            {t('auth.already_have_account')}{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>
                                {t('auth.sign_in')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 32,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
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
    cropsLabel: {
        fontSize: 14,
        color: COLORS.neutral[600],
        marginBottom: 16,
    },
    cropsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    actionButton: {
        marginTop: 24,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    loginText: {
        color: COLORS.neutral[500],
    },
    loginLink: {
        color: COLORS.primary[600],
        fontWeight: '600',
    },
});

export default Register;
