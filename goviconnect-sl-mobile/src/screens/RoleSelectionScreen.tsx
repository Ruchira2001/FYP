import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { useExpert } from '../context/ExpertContext';
import { useShop } from '../context/ShopContext';

const RoleSelectionScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { login: loginFarmer } = useApp();
    const { login: loginExpert } = useExpert();
    const { login: loginShop } = useShop();

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
        await loginFarmer('farmer@demo.com', 'password123');
        navigation.navigate('FarmerApp');
    };

    const quickLoginExpert = async () => {
        await loginExpert('expert@demo.com', 'password');
        navigation.navigate('ExpertApp');
    };

    const quickLoginShop = async () => {
        await loginShop({
            id: 'S' + Date.now(),
            name: 'Demo Shop',
            email: 'shop@demo.com',
            location: 'Colombo',
            type: 'Business'
        });
        navigation.navigate('ShopApp');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>GoviConnect</Text>
                    </View>
                    <Text style={styles.welcomeText}>Choose your role</Text>
                    <Text style={styles.subText}>Select how you want to use the platform</Text>
                </View>

                <TouchableOpacity
                    style={styles.roleCard}
                    onPress={handleFarmerSelect}
                    activeOpacity={0.9}
                >
                    <View style={[styles.iconContainer, { backgroundColor: COLORS.primary[100] }]}>
                        <Text style={styles.emoji}>👨‍🌾</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.roleTitle}>I'm a Farmer</Text>
                        <Text style={styles.roleDescription}>Manage your crops, get expert advice & access learning resources.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.neutral[400]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.roleCard}
                    onPress={handleExpertSelect}
                    activeOpacity={0.9}
                >
                    <View style={[styles.iconContainer, { backgroundColor: COLORS.secondary[100] }]}>
                        <Text style={styles.emoji}>👨‍⚕️</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.roleTitle}>I'm an Expert</Text>
                        <Text style={styles.roleDescription}>Provide guidance, diagnose issues & support the farming community.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.neutral[400]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.roleCard}
                    onPress={handleShopSelect}
                    activeOpacity={0.9}
                >
                    <View style={[styles.iconContainer, { backgroundColor: COLORS.info + '20' }]}>
                        <Text style={styles.emoji}>🏪</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.roleTitle}>I'm a Shop Owner</Text>
                        <Text style={styles.roleDescription}>Source fresh wholesale produce for your business directly from farmers.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.neutral[400]} />
                </TouchableOpacity>

                <View style={styles.separator} />

                {/* Quick Login Buttons */}
                <View style={styles.quickLoginContainer}>
                    <Text style={styles.quickLoginTitle}>Quick Login (Demo)</Text>
                    <View style={styles.quickLoginButtons}>
                        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.primary[500] }]} onPress={quickLoginFarmer}>
                            <Text style={styles.quickBtnText}>Farmer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.secondary[500] }]} onPress={quickLoginExpert}>
                            <Text style={styles.quickBtnText}>Expert</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.info }]} onPress={quickLoginShop}>
                            <Text style={styles.quickBtnText}>Shop</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms & Privacy Policy
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoText: {
        fontSize: 32,
        color: COLORS.primary[600],
        fontFamily: 'IrishGrover_400Regular',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: COLORS.neutral[500],
        textAlign: 'center',
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.md,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emoji: {
        fontSize: 32,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    roleDescription: {
        fontSize: 13,
        color: COLORS.neutral[500],
        lineHeight: 18,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.neutral[200],
        marginVertical: 20,
    },
    quickLoginContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    quickLoginTitle: {
        fontSize: 14,
        color: COLORS.neutral[400],
        marginBottom: 12,
        fontWeight: '600',
    },
    quickLoginButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    quickBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    quickBtnText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    footer: {
        marginTop: 10,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textAlign: 'center',
    },
});

export default RoleSelectionScreen;
