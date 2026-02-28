import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOW } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { useExpert } from '../context/ExpertContext';
import { useShop } from '../context/ShopContext';

const { width } = Dimensions.get('window');

interface RoleCardProps {
    emoji: string;
    title: string;
    description: string;
    gradientColors: [string, string];
    accentColor: string;
    onPress: () => void;
    delay: number;
}

const RoleCard: React.FC<RoleCardProps> = ({
    emoji,
    title,
    description,
    gradientColors,
    accentColor,
    onPress,
    delay,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY }],
            }}
        >
            <TouchableOpacity
                style={styles.roleCard}
                onPress={onPress}
                activeOpacity={0.85}
            >
                <View style={styles.roleCardInner}>
                    {/* Accent strip on left */}
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.accentStrip}
                    />

                    <View style={styles.roleCardContent}>
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: accentColor + '15' },
                            ]}
                        >
                            <Text style={styles.emoji}>{emoji}</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.roleTitle}>{title}</Text>
                            <Text style={styles.roleDescription}>
                                {description}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.arrowContainer,
                                { backgroundColor: accentColor + '10' },
                            ]}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={accentColor}
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const RoleSelectionScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { login: loginFarmer } = useApp();
    const { login: loginExpert } = useExpert();
    const { login: loginShop } = useShop();

    // Header animations
    const logoScale = useRef(new Animated.Value(0.6)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        // Logo animation
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Title animation
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(titleTranslateY, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 200);
    }, []);

    const handleFarmerSelect = () => {
        navigation.navigate('FarmerApp');
    };

    const handleExpertSelect = () => {
        navigation.navigate('ExpertApp');
    };

    const handleShopSelect = () => {
        navigation.navigate('ShopApp');
    };

    // Quick Login Handlers
    const quickLoginFarmer = async () => {
        const success = await loginFarmer('farmer@goviconnect.lk', 'farmer123');
        if (success) navigation.navigate('FarmerApp');
    };

    const quickLoginExpert = async () => {
        const success = await loginExpert('expert@goviconnect.lk', 'expert123');
        if (success) navigation.navigate('ExpertApp');
    };

    const quickLoginShop = async () => {
        const success = await loginShop('shop@goviconnect.lk', 'shop123');
        if (success) navigation.navigate('ShopApp');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAFDFB" />

            {/* Background decorative circles */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Logo & Header */}
                <View style={styles.header}>
                    <Animated.View
                        style={[
                            styles.logoWrapper,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={[COLORS.primary[500], COLORS.primary[700]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoGradient}
                        >
                            <Ionicons name="leaf" size={36} color="#ffffff" />
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: titleOpacity,
                            transform: [{ translateY: titleTranslateY }],
                            alignItems: 'center',
                        }}
                    >
                        <Text style={styles.appName}>
                            Govi<Text style={styles.appNameAccent}>Connect</Text>
                        </Text>
                        <Text style={styles.appTagline}>Sri Lanka</Text>
                        <View style={styles.dividerDot}>
                            <View style={styles.dot} />
                            <View style={[styles.dotLine, { backgroundColor: COLORS.primary[300] }]} />
                            <View style={styles.dot} />
                        </View>
                        <Text style={styles.chooseRoleText}>
                            Choose your role to continue
                        </Text>
                    </Animated.View>
                </View>

                {/* Role Cards */}
                <View style={styles.cardsContainer}>
                    <RoleCard
                        emoji="👨‍🌾"
                        title="I'm a Farmer"
                        description="Manage crops, get expert advice & access learning resources."
                        gradientColors={[COLORS.primary[400], COLORS.primary[600]]}
                        accentColor={COLORS.primary[600]}
                        onPress={handleFarmerSelect}
                        delay={300}
                    />

                    <RoleCard
                        emoji="👨‍⚕️"
                        title="I'm an Expert"
                        description="Provide guidance, diagnose issues & support the farming community."
                        gradientColors={[COLORS.secondary[400], COLORS.secondary[600]]}
                        accentColor={COLORS.secondary[600]}
                        onPress={handleExpertSelect}
                        delay={450}
                    />

                    <RoleCard
                        emoji="🏪"
                        title="I'm a Shop Owner"
                        description="Source fresh wholesale produce directly from farmers."
                        gradientColors={['#60a5fa', '#2563eb']}
                        accentColor="#2563eb"
                        onPress={handleShopSelect}
                        delay={600}
                    />
                </View>

                {/* Separator */}
                <View style={styles.separator}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>QUICK ACCESS</Text>
                    <View style={styles.separatorLine} />
                </View>

                {/* Quick Login Buttons */}
                <View style={styles.quickLoginContainer}>
                    <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={quickLoginFarmer}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.primary[400], COLORS.primary[600]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.quickBtnGradient}
                        >
                            <Text style={styles.quickBtnEmoji}>🌾</Text>
                            <Text style={styles.quickBtnText}>Farmer</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={quickLoginExpert}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.secondary[400], COLORS.secondary[600]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.quickBtnGradient}
                        >
                            <Text style={styles.quickBtnEmoji}>🔬</Text>
                            <Text style={styles.quickBtnText}>Expert</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={quickLoginShop}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#60a5fa', '#2563eb']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.quickBtnGradient}
                        >
                            <Text style={styles.quickBtnEmoji}>🛒</Text>
                            <Text style={styles.quickBtnText}>Shop</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.footerLink}>Terms</Text> &{' '}
                        <Text style={styles.footerLink}>Privacy Policy</Text>
                    </Text>
                    <Text style={styles.versionText}>v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFDFB',
    },
    // Background decorations
    bgCircle1: {
        position: 'absolute',
        top: -80,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: COLORS.primary[100],
        opacity: 0.5,
    },
    bgCircle2: {
        position: 'absolute',
        bottom: -40,
        left: -50,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: COLORS.secondary[100],
        opacity: 0.3,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    // Header / Logo
    header: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 32,
    },
    logoWrapper: {
        marginBottom: 16,
        ...SHADOW.lg,
    },
    logoGradient: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.neutral[800],
        letterSpacing: -0.5,
    },
    appNameAccent: {
        color: COLORS.primary[600],
    },
    appTagline: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary[500],
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    dividerDot: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 12,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: COLORS.primary[400],
    },
    dotLine: {
        width: 40,
        height: 1.5,
        marginHorizontal: 8,
    },
    chooseRoleText: {
        fontSize: 16,
        color: COLORS.neutral[500],
        fontWeight: '500',
    },
    // Role Cards
    cardsContainer: {
        marginBottom: 8,
    },
    roleCard: {
        marginBottom: 14,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        ...SHADOW.md,
    },
    roleCardInner: {
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 16,
    },
    accentStrip: {
        width: 5,
    },
    roleCardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingLeft: 14,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    emoji: {
        fontSize: 28,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    roleTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginBottom: 3,
    },
    roleDescription: {
        fontSize: 12.5,
        color: COLORS.neutral[500],
        lineHeight: 17,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Separator
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.neutral[200],
    },
    separatorText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.neutral[400],
        letterSpacing: 1.5,
        marginHorizontal: 14,
    },
    // Quick Login
    quickLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    quickBtn: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 12,
        overflow: 'hidden',
        ...SHADOW.sm,
    },
    quickBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    quickBtnEmoji: {
        fontSize: 14,
        marginRight: 5,
    },
    quickBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 12.5,
    },
    // Footer
    footer: {
        alignItems: 'center',
        paddingBottom: 12,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textAlign: 'center',
        lineHeight: 18,
    },
    footerLink: {
        color: COLORS.primary[600],
        fontWeight: '600',
    },
    versionText: {
        fontSize: 11,
        color: COLORS.neutral[300],
        marginTop: 6,
    },
});

export default RoleSelectionScreen;
