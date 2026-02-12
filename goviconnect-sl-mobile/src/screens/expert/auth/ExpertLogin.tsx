import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Dimensions, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../../../utils/constants';
import { useExpert } from '../../../context/ExpertContext';

const { width } = Dimensions.get('window');

const ExpertLogin: React.FC = () => {
    const { login, isLoading } = useExpert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        const success = await login(email, password);
        if (!success) {
            setError('Invalid credentials. Please try again.');
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
                                <Ionicons name="leaf" size={40} color={COLORS.primary[600]} />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.appTitle}>GoviConnect</Text>
                    <Text style={styles.appSubtitle}>Expert Portal</Text>
                    <View style={styles.expertBadge}>
                        <Ionicons name="shield-checkmark" size={16} color={COLORS.primary[600]} />
                        <Text style={styles.expertBadgeText}>Agricultural Expert Access</Text>
                    </View>
                </View>

                {/* Login Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Welcome Back</Text>
                    <Text style={styles.formSubtitle}>Sign in to your expert account</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Email Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="expert@goviconnect.lk"
                                placeholderTextColor={COLORS.neutral[400]}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
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

                    {/* Forgot Password */}
                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Sign In</Text>
                                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: COLORS.primary[50] }]}>
                            <Ionicons name="medical" size={18} color={COLORS.primary[600]} />
                        </View>
                        <Text style={styles.infoText}>Review AI diagnoses</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: '#dbeafe' }]}>
                            <Ionicons name="chatbubbles" size={18} color={COLORS.info} />
                        </View>
                        <Text style={styles.infoText}>Chat with farmers</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: COLORS.secondary[50] }]}>
                            <Ionicons name="calendar" size={18} color={COLORS.secondary[500]} />
                        </View>
                        <Text style={styles.infoText}>Manage meetings</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footerText}>
                    For authorized agricultural experts only.{'\n'}
                    Contact admin@goviconnect.lk for access.
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
        paddingTop: 80,
        paddingBottom: 32,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoOuter: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary[200],
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary[700],
        fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    },
    appSubtitle: {
        fontSize: 16,
        color: COLORS.neutral[400],
        marginTop: 2,
        fontWeight: '500',
    },
    expertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    expertBadgeText: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.primary[600],
        marginLeft: 6,
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
        marginBottom: 16,
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
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        fontSize: 13,
        color: COLORS.primary[600],
        fontWeight: '500',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary[600],
        borderRadius: 12,
        paddingVertical: 14,
        ...SHADOW.md,
        shadowColor: COLORS.primary[600],
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginRight: 8,
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingTop: 28,
    },
    infoItem: {
        alignItems: 'center',
    },
    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 11,
        color: COLORS.neutral[500],
        fontWeight: '500',
        textAlign: 'center',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.neutral[300],
        marginTop: 28,
        lineHeight: 18,
    },
});

export default ExpertLogin;
