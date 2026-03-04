import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../../../utils/constants';
import { authAPI, saveAuthData } from '../../../services/api';
import { useShop } from '../../../context/ShopContext';

const { width } = Dimensions.get('window');

const SHOP_COLOR = '#2563eb';
const SHOP_LIGHT = '#dbeafe';
const SHOP_BG = '#eff6ff';

const ShopRegister: React.FC = () => {
    const navigation = useNavigation<any>();
    const { login } = useShop();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        // Validation
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all required fields');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const res = await authAPI.registerShop({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
                location: location.trim(),
            });

            const { token, user } = res.data;
            if (token) {
                // Auto-login after registration
                await saveAuthData(token, user, 'shop');
                // Login via context to update state
                await login(email.trim(), password);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo & Branding */}
                <View style={styles.brandingSection}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoOuter}>
                            <View style={styles.logoInner}>
                                <Ionicons name="storefront" size={36} color={SHOP_COLOR} />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.appTitle}>GoviConnect</Text>
                    <Text style={styles.appSubtitle}>Register Your Shop</Text>
                </View>

                {/* Register Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Create Account</Text>
                    <Text style={styles.formSubtitle}>Set up your shop owner account</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Shop Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Shop Name *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="storefront-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="Your shop name"
                                placeholderTextColor={COLORS.neutral[400]}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="shop@example.com"
                                placeholderTextColor={COLORS.neutral[400]}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="077 123 4567"
                                placeholderTextColor={COLORS.neutral[400]}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Location</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="Colombo"
                                placeholderTextColor={COLORS.neutral[400]}
                                value={location}
                                onChangeText={setLocation}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="Min 6 characters"
                                placeholderTextColor={COLORS.neutral[400]}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.neutral[400]}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter password"
                                placeholderTextColor={COLORS.neutral[400]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <Text style={styles.registerButtonText}>Create Account</Text>
                                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footerText}>
                    By creating an account, you agree to our{'\n'}
                    Terms of Service and Privacy Policy.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    brandingSection: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 24,
    },
    logoContainer: {
        marginBottom: 12,
    },
    logoOuter: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: SHOP_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: SHOP_BG,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#93c5fd',
    },
    appTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: SHOP_COLOR,
        fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    },
    appSubtitle: {
        fontSize: 14,
        color: COLORS.neutral[400],
        marginTop: 2,
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.md,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    formSubtitle: {
        fontSize: 14,
        color: COLORS.neutral[400],
        marginTop: 2,
        marginBottom: 24,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 13,
        color: COLORS.error,
        marginLeft: 8,
        flex: 1,
    },
    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[700],
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[50],
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: COLORS.neutral[800],
        marginLeft: 8,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SHOP_COLOR,
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 8,
        ...SHADOW.md,
        shadowColor: SHOP_COLOR,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginRight: 8,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    loginLink: {
        fontSize: 14,
        color: SHOP_COLOR,
        fontWeight: '600',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.neutral[300],
        marginTop: 24,
        lineHeight: 18,
    },
});

export default ShopRegister;
