import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../../../utils/constants';
import { useShop } from '../../../context/ShopContext';
import AppLogo from '../../../components/AppLogo';

const { width } = Dimensions.get('window');

const SHOP_COLOR = '#2563eb';
const SHOP_LIGHT = '#dbeafe';
const SHOP_BG = '#eff6ff';

const ShopLogin: React.FC = () => {
    const navigation = useNavigation<any>();
    const { login } = useShop();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
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
                    <AppLogo variant="vertical" globeSize={130} brandFontSize={34} slFontSize={13} />
                    <Text style={styles.appSubtitle}>Shop Portal</Text>
                    <View style={styles.roleBadge}>
                        <Ionicons name="cart" size={16} color={SHOP_COLOR} />
                        <Text style={styles.roleBadgeText}>Shop Owner Access</Text>
                    </View>
                </View>

                {/* Login Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Welcome Back</Text>
                    <Text style={styles.formSubtitle}>Sign in to your shop account</Text>

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
                                placeholder="shop@goviconnect.lk"
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

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Sign In</Text>
                                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Register Link */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ShopRegister')}>
                            <Text style={styles.registerLink}>Register Shop</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: SHOP_BG }]}>
                            <Ionicons name="leaf" size={18} color={SHOP_COLOR} />
                        </View>
                        <Text style={styles.infoText}>Source produce</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: SHOP_LIGHT }]}>
                            <Ionicons name="receipt" size={18} color={SHOP_COLOR} />
                        </View>
                        <Text style={styles.infoText}>Manage orders</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: COLORS.secondary[50] }]}>
                            <Ionicons name="stats-chart" size={18} color={COLORS.secondary[500]} />
                        </View>
                        <Text style={styles.infoText}>Track sales</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footerText}>
                    Connect with local farmers directly.{'\n'}
                    Fresh produce for your shop.
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
        backgroundColor: SHOP_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: SHOP_BG,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#93c5fd',
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: SHOP_COLOR,
        fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    },
    appSubtitle: {
        fontSize: 16,
        color: COLORS.neutral[400],
        marginTop: 2,
        fontWeight: '500',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: SHOP_BG,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#93c5fd',
    },
    roleBadgeText: {
        fontSize: 13,
        fontWeight: '500',
        color: SHOP_COLOR,
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
        color: SHOP_COLOR,
        fontWeight: '500',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SHOP_COLOR,
        borderRadius: 12,
        paddingVertical: 14,
        ...SHADOW.md,
        shadowColor: SHOP_COLOR,
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    registerLink: {
        fontSize: 14,
        color: SHOP_COLOR,
        fontWeight: '600',
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

export default ShopLogin;
