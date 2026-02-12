import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../utils/constants';

const { width } = Dimensions.get('window');

const RoleSelectionScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleFarmerSelect = () => {
        navigation.navigate('FarmerApp');
    };

    const handleExpertSelect = () => {
        navigation.navigate('ExpertApp');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.logoText}>GoviConnect</Text>
                    <Text style={styles.subtitle}>Choose your role to continue</Text>
                </View>

                <View style={styles.rolesContainer}>
                    {/* Farmer Role Card */}
                    <TouchableOpacity
                        style={styles.roleCard}
                        onPress={handleFarmerSelect}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: COLORS.primary[100] }]}>
                            <Text style={styles.emoji}>👨‍🌾</Text>
                        </View>
                        <View style={styles.roleContent}>
                            <Text style={styles.roleTitle}>I'm a Farmer</Text>
                            <Text style={styles.roleDescription}>
                                Get expert advice, diagnose crop diseases, and connect with buyers.
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.neutral[400]} />
                    </TouchableOpacity>

                    {/* Expert Role Card */}
                    <TouchableOpacity
                        style={styles.roleCard}
                        onPress={handleExpertSelect}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: COLORS.secondary[100] }]}>
                            <Text style={styles.emoji}>👨‍⚕️</Text>
                        </View>
                        <View style={styles.roleContent}>
                            <Text style={styles.roleTitle}>I'm an Expert</Text>
                            <Text style={styles.roleDescription}>
                                Provide guidance, review diagnoses, and help farmers succeed.
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.neutral[400]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms & Privacy Policy
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 18,
        color: COLORS.neutral[600],
        marginBottom: 8,
    },
    logoText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.primary[600],
        marginBottom: 12,
        fontFamily: 'IrishGrover_400Regular',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.neutral[500],
        textAlign: 'center',
    },
    rolesContainer: {
        width: '100%',
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        ...SHADOW.md,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    emoji: {
        fontSize: 32,
    },
    roleContent: {
        flex: 1,
        paddingRight: 8,
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
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textAlign: 'center',
    },
});

export default RoleSelectionScreen;
