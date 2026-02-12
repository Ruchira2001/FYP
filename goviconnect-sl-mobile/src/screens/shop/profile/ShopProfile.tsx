import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../../../context/ShopContext';
import { COLORS, SHADOW } from '../../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components';

const ShopProfile: React.FC = () => {
    const navigation = useNavigation();
    const { logout, shop } = useShop();

    const renderSettingItem = (icon: string, label: string, onPress?: () => void, color = COLORS.neutral[700]) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.neutral[50] }]}>
                <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <Text style={[styles.settingLabel, { color }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[300]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Header title="My Shop" showNotifications />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{shop?.name?.substring(0, 1) || 'S'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.shopName}>{shop?.name || 'My Shop'}</Text>
                        <Text style={styles.location}>{shop?.location || 'Location Not Set'}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{shop?.type || 'Business'}</Text>
                        </View>
                    </View>
                </View>

                {/* Wallet / Stats Card */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Active Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>Rs. 45k</Text>
                        <Text style={styles.statLabel}>Spent (Feb)</Text>
                    </View>
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionTitle}>Shop Settings</Text>
                <View style={styles.settingsGroup}>
                    {renderSettingItem('location-outline', 'Manage Addresses')}
                    {renderSettingItem('card-outline', 'Payment Methods')}
                    {renderSettingItem('people-outline', 'Linked Accounts')}
                </View>

                <Text style={styles.sectionTitle}>App Settings</Text>
                <View style={styles.settingsGroup}>
                    {renderSettingItem('notifications-outline', 'Notifications')}
                    {renderSettingItem('language-outline', 'Language / භාෂාව')}
                    {renderSettingItem('help-circle-outline', 'Help & Support')}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.2 (Shop)</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        ...SHADOW.md,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.info,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    profileInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.neutral[900],
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: COLORS.neutral[500],
        marginBottom: 8,
    },
    badge: {
        backgroundColor: COLORS.info + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.info,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        ...SHADOW.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.neutral[900],
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.neutral[500],
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.neutral[100],
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
        marginLeft: 4,
    },
    settingsGroup: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 8,
        marginBottom: 24,
        ...SHADOW.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        flex: 1,
        fontSize: 15,
        color: COLORS.neutral[700],
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.error + '10', // Light red bg
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.error,
        marginLeft: 8,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.neutral[400],
    },
});

export default ShopProfile;
