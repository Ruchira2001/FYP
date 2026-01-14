import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';
import { PrimaryButton, InputField } from '../../components';
import { validateEmail } from '../../utils/validators';

const ForgotPassword: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendReset = async () => {
        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Invalid email format');
            return;
        }

        setLoading(true);
        setError('');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSent(true);
    };

    if (sent) {
        return (
            <View className="flex-1 bg-white px-6 items-center justify-center">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                    <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
                </View>

                <Text className="text-2xl font-bold text-neutral-800 text-center mb-3">
                    Email Sent!
                </Text>

                <Text className="text-base text-neutral-500 text-center mb-8 px-4">
                    We've sent a password reset link to {email}. Please check your inbox.
                </Text>

                <PrimaryButton
                    title="Back to Login"
                    onPress={() => navigation.navigate('Login')}
                    fullWidth
                    size="lg"
                />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View className="flex-1 px-6 pt-12">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center mb-8"
                >
                    <Ionicons name="arrow-back" size={20} color={COLORS.neutral[700]} />
                </TouchableOpacity>

                {/* Header */}
                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
                        <Ionicons name="key-outline" size={40} color={COLORS.primary[500]} />
                    </View>

                    <Text className="text-2xl font-bold text-neutral-800 text-center mb-2">
                        {t('auth.forgot_title')}
                    </Text>

                    <Text className="text-sm text-neutral-500 text-center px-4">
                        {t('auth.forgot_subtitle')}
                    </Text>
                </View>

                {/* Form */}
                <InputField
                    label={t('auth.email')}
                    placeholder="example@email.com"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail-outline"
                    error={error}
                />

                {/* Send Button */}
                <PrimaryButton
                    title={t('auth.send_reset')}
                    onPress={handleSendReset}
                    loading={loading}
                    icon="paper-plane-outline"
                    fullWidth
                    size="lg"
                />

                {/* Back to Login */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="flex-row justify-center items-center mt-8"
                >
                    <Ionicons name="arrow-back" size={16} color={COLORS.primary[600]} />
                    <Text className="text-primary-600 font-medium ml-2">
                        Back to Login
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ForgotPassword;
