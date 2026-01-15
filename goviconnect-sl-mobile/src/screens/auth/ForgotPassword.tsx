import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from 'react-native';
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
            <View style={styles.successContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
                </View>

                <Text style={styles.successTitle}>
                    Email Sent!
                </Text>

                <Text style={styles.successMessage}>
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
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={20} color={COLORS.neutral[700]} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="key-outline" size={40} color={COLORS.primary[500]} />
                    </View>

                    <Text style={styles.title}>
                        {t('auth.forgot_title')}
                    </Text>

                    <Text style={styles.subtitle}>
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
                    style={styles.backToLogin}
                >
                    <Ionicons name="arrow-back" size={16} color={COLORS.primary[600]} />
                    <Text style={styles.backToLoginText}>
                        Back to Login
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.primary[100],
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.neutral[500],
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    backToLogin: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    backToLoginText: {
        color: COLORS.primary[600],
        fontWeight: '500',
        marginLeft: 8,
    },
    successContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIcon: {
        width: 96,
        height: 96,
        backgroundColor: '#dcfce7',
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        textAlign: 'center',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        color: COLORS.neutral[500],
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 16,
    },
});

export default ForgotPassword;
