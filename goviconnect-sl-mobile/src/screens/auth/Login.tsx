import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';
import { PrimaryButton, InputField } from '../../components';
import { useApp } from '../../context';
import { validateEmail } from '../../utils/validators';

const Login: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();
    const { login, isLoading } = useApp();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        const success = await login(email, password);
        if (success) {
            navigation.replace('MainTabs');
        }
    };

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
                <View className="flex-1 px-6 pt-16 pb-8">
                    {/* Header */}
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-primary-100 rounded-2xl items-center justify-center mb-6">
                            <Ionicons name="leaf" size={40} color={COLORS.primary[500]} />
                        </View>

                        <Text className="text-2xl font-bold text-neutral-800 text-center mb-2">
                            {t('auth.login_title')}
                        </Text>

                        <Text className="text-sm text-neutral-500 text-center">
                            {t('auth.login_subtitle')}
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="mb-6">
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

                        {/* Forgot Password */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            className="self-end mb-6"
                        >
                            <Text className="text-primary-600 font-medium">
                                {t('auth.forgot_password')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <PrimaryButton
                        title={t('auth.login')}
                        onPress={handleLogin}
                        loading={isLoading}
                        fullWidth
                        size="lg"
                    />

                    {/* Divider */}
                    <View className="flex-row items-center my-8">
                        <View className="flex-1 h-px bg-neutral-200" />
                        <Text className="mx-4 text-neutral-400 text-sm">or</Text>
                        <View className="flex-1 h-px bg-neutral-200" />
                    </View>

                    {/* Social Login (Placeholder) */}
                    <View className="flex-row justify-center space-x-4 mb-8">
                        <TouchableOpacity
                            className="w-14 h-14 bg-neutral-100 rounded-xl items-center justify-center"
                            style={{ marginRight: 16 }}
                        >
                            <Ionicons name="logo-google" size={24} color={COLORS.neutral[700]} />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-14 h-14 bg-neutral-100 rounded-xl items-center justify-center">
                            <Ionicons name="logo-facebook" size={24} color={COLORS.neutral[700]} />
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View className="flex-row justify-center">
                        <Text className="text-neutral-500">
                            {t('auth.dont_have_account')}{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-primary-600 font-semibold">
                                {t('auth.sign_up')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;
