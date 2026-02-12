import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../../../utils/constants';
import { PrimaryButton, InputField, Header } from '../../../components';
import { useShop } from '../../../context/ShopContext';

const { width } = Dimensions.get('window');

const ShopLogin: React.FC = () => {
    const navigation = useNavigation<any>();
    const { login } = useShop();
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            // Mock login success
            await new Promise(resolve => setTimeout(resolve, 1500));

            await login({
                id: 'S' + Math.floor(Math.random() * 1000),
                name: 'Colombo Shop',
                email: email,
                location: 'Colombo',
                type: 'Business'
            });

            // Navigation is handled by auth state change in navigator
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Header title="" showBack onBackPress={() => navigation.goBack()} transparent />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerSection}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconEmoji}>🏪</Text>
                        </View>
                        <Text style={styles.title}>Shop Owner Login</Text>
                        <Text style={styles.subtitle}>Source the best produce for your shop</Text>
                    </View>

                    <View style={styles.formSection}>
                        <InputField
                            label="Email Address"
                            placeholder="shop@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon="mail-outline"
                        />

                        <InputField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                        />

                        <View style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </View>

                        <View style={{ marginBottom: 24 }}>
                            <PrimaryButton
                                title="Login as Shop Owner"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.loginButton}
                            />
                        </View>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <Text style={styles.registerLink}>Register Shop</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.info + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.neutral[500],
        textAlign: 'center',
        maxWidth: '80%',
    },
    formSection: {
        width: '100%',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: COLORS.info,
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: COLORS.info,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: COLORS.neutral[500],
        fontSize: 14,
    },
    registerLink: {
        color: COLORS.info,
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default ShopLogin;
