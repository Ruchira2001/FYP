import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, AppNotify } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { useExpert } from '../../../context/ExpertContext';
import { useApp } from '../../../context';
import { navigationRef } from '../../../navigation/navigationRef';

const ExpertProfile: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { expert, logout } = useExpert();
    const { switchRole } = useApp();

    const handleLogout = () => {
        AppNotify.confirm(
            'Logout',
            'Are you sure you want to logout?',
            async () => {
                await logout();
                if (navigationRef.isReady()) {
                    navigationRef.reset({ index: 0, routes: [{ name: 'Splash' }] });
                }
            },
            { confirmLabel: 'Logout', destructive: true }
        );
    };



    const handleEditProfile = () => {
        navigation.navigate('ExpertEditProfile');
    };

    // Quick shortcuts - expert-specific
    const shortcuts = [
        {
            id: 'diagnosis',
            icon: 'medical',
            label: 'Diagnosis Reviews',
            color: COLORS.error,
            onPress: () => navigation.navigate('ExpertDiagnosisReviews'),
        },
        {
            id: 'knowledge',
            icon: 'book',
            label: 'Knowledge Base',
            color: COLORS.primary[500],
            onPress: () => navigation.navigate('ExpertKnowledgeBase'),
        },
        {
            id: 'meetings',
            icon: 'calendar',
            label: 'Meeting History',
            color: COLORS.info,
            onPress: () => navigation.navigate('ExpertMeetingsTab'),
        },
        {
            id: 'farmers',
            icon: 'people',
            label: 'Farmer Directory',
            color: COLORS.secondary[500],
            onPress: () => navigation.navigate('ExpertFarmerDirectory'),
        },
    ];



    // Bottom menu items - matching farmer side exactly (Settings, Help & FAQ, Logout)
    const bottomMenuItems = [
        {
            id: 'settings',
            icon: 'settings-outline',
            label: t('profile.settings'),
            onPress: () => navigation.navigate('Settings'),
        },
        {
            id: 'help',
            icon: 'help-circle-outline',
            label: t('profile.help_faq'),
            onPress: () => navigation.navigate('HelpFAQ'),
        },
        {
            id: 'logout',
            icon: 'log-out-outline',
            label: t('profile.logout'),
            color: COLORS.error,
            onPress: handleLogout,
        },
    ];

    return (
        <View style={styles.container}>
            <Header title="My Profile" showBack onBackPress={() => navigation.goBack()} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>👨‍⚕️</Text>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="shield-checkmark" size={10} color="#ffffff" />
                            </View>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {expert?.name || 'Dr. Kamal Perera'}
                            </Text>
                            <Text style={styles.userSpecialty}>
                                {expert?.specialty || 'Plant Pathology'}
                            </Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={13} color={COLORS.neutral[400]} />
                                <Text style={styles.locationText}>
                                    {expert?.district || 'Kandy'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleEditProfile}
                            style={styles.editButton}
                        >
                            <Ionicons name="pencil" size={15} color={COLORS.neutral[600]} />
                            <Text style={styles.editButtonLabel}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Rating Row */}
                    <View style={styles.ratingSection}>
                        <View style={styles.ratingPill}>
                            <Ionicons name="star" size={14} color="#f59e0b" />
                            <Text style={styles.ratingValue}>{expert?.rating || 4.8}</Text>
                        </View>
                        <Text style={styles.ratingSubtext}>
                            • {expert?.totalConsultations || 245} consultations
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{expert?.totalConsultations || 245}</Text>
                            <Text style={styles.statLabel}>Consultations</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{expert?.farmersHelped || 189}</Text>
                            <Text style={styles.statLabel}>Farmers Helped</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{expert?.yearsExperience || 20}+</Text>
                            <Text style={styles.statLabel}>Years</Text>
                        </View>
                    </View>

                    {/* Specializations */}
                    {(expert?.specializations || ['Vegetables', 'Fruits', 'Paddy']).length > 0 && (
                        <View style={styles.specializationsSection}>
                            <Text style={styles.sectionLabel}>SPECIALIZATIONS</Text>
                            <View style={styles.chipsList}>
                                {(expert?.specializations || ['Vegetables', 'Fruits', 'Paddy']).map((spec, idx) => (
                                    <View key={idx} style={styles.specBadge}>
                                        <Ionicons name="leaf" size={12} color={COLORS.primary[600]} />
                                        <Text style={styles.specBadgeText}>{spec}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Qualifications */}
                    {(expert?.qualifications || ['PhD Plant Pathology', 'M.Sc. Agriculture', 'B.Sc. Botany']).length > 0 && (
                        <View style={styles.qualificationsSection}>
                            <Text style={styles.sectionLabel}>QUALIFICATIONS</Text>
                            <View style={styles.qualificationsList}>
                                {(expert?.qualifications || ['PhD Plant Pathology', 'M.Sc. Agriculture', 'B.Sc. Botany']).map((qual, idx) => (
                                    <View key={idx} style={styles.qualificationItem}>
                                        <Ionicons name="school" size={14} color={COLORS.secondary[600]} />
                                        <Text style={styles.qualificationText}>{qual}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Switch to Farmer Mode Card */}
                <TouchableOpacity
                    onPress={async () => {
                        console.log('--- Switch to Farmer button pressed ---');
                        AppNotify.confirm(
                            'Switch to Farmer Mode',
                            'Switch back to your farmer account?',
                            async () => {
                                const success = await switchRole('farmer');
                                if (success) {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'FarmerApp' }],
                                    });
                                } else {
                                    AppNotify.toast('Could not switch to Farmer Mode', 'error');
                                }
                            },
                            { confirmLabel: 'Switch' }
                        );
                    }}
                    style={[styles.availabilityCard, { backgroundColor: COLORS.primary[600], marginBottom: 0 }]}
                >
                    <View style={styles.availabilityContent}>
                        <View style={styles.availabilityIconContainer}>
                            <Ionicons name="swap-horizontal" size={24} color="#ffffff" />
                        </View>
                        <View style={styles.availabilityTextInfo}>
                            <Text style={styles.availabilityTitle}>Switch to Farmer Mode</Text>
                            <Text style={styles.availabilitySubtitle}>
                                Back to your farmer account & tools
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                    </View>
                </TouchableOpacity>

                {/* Availability Banner */}
                <View style={[styles.availabilityCard, { backgroundColor: COLORS.primary[600] }]}>
                    <View style={styles.availabilityContent}>
                        <View style={styles.availabilityIconContainer}>
                            <Ionicons name="pulse" size={24} color="#ffffff" />
                        </View>
                        <View style={styles.availabilityTextInfo}>
                            <Text style={styles.availabilityTitle}>Expert Dashboard</Text>
                            <Text style={styles.availabilitySubtitle}>
                                Manage requests & consultations
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                    </View>
                </View>

                {/* Quick Shortcuts */}
                <View style={styles.shortcutsSection}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <View style={styles.shortcutsGrid}>
                        {shortcuts.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={item.onPress}
                                style={styles.shortcutCard}
                            >
                                <View
                                    style={[
                                        styles.shortcutIconContainer,
                                        { backgroundColor: item.color + '20' }
                                    ]}
                                >
                                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <Text style={styles.shortcutLabel} numberOfLines={2}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Settings, Help & FAQ, Logout - matching farmer side */}
                <View style={styles.bottomMenuSection}>
                    <View style={styles.bottomMenuContainer}>
                        {bottomMenuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={item.onPress}
                                style={[
                                    styles.bottomMenuItem,
                                    index < bottomMenuItems.length - 1 && styles.bottomMenuItemBorder
                                ]}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={22}
                                    color={item.color || COLORS.neutral[600]}
                                />
                                <Text
                                    style={[
                                        styles.bottomMenuLabel,
                                        { color: item.color || COLORS.neutral[800] }
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Version */}
                <Text style={styles.versionText}>GoviConnect Expert v1.0.0</Text>

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    content: {
        flex: 1,
    },
    // ===== Profile Card =====
    profileCard: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        backgroundColor: COLORS.primary[100],
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        position: 'relative',
    },
    avatarText: {
        fontSize: 30,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    userSpecialty: {
        fontSize: 14,
        color: COLORS.primary[600],
        fontWeight: '500',
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 13,
        color: COLORS.neutral[400],
        marginLeft: 4,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[100],
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 4,
    },
    editButtonLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.neutral[600],
    },
    // ===== Rating =====
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400e',
        marginLeft: 4,
    },
    ratingSubtext: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginLeft: 8,
    },
    // ===== Stats =====
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary[600],
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.neutral[500],
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.neutral[200],
    },
    // ===== Specializations =====
    specializationsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    sectionLabel: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    chipsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    specBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    specBadgeText: {
        fontSize: 13,
        color: COLORS.primary[700],
        fontWeight: '500',
        marginLeft: 6,
    },
    // ===== Qualifications =====
    qualificationsSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    qualificationsList: {},
    qualificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    qualificationText: {
        fontSize: 14,
        color: COLORS.neutral[700],
        marginLeft: 8,
    },
    // ===== Availability Banner =====
    availabilityCard: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: COLORS.primary[600],
        borderRadius: 16,
        padding: 16,
        shadowColor: COLORS.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    availabilityContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availabilityIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    availabilityTextInfo: {
        flex: 1,
    },
    availabilityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    availabilitySubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    // ===== Quick Toggles =====
    togglesCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
        ...SHADOW.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.neutral[700],
    },
    toggleDivider: {
        height: 1,
        backgroundColor: COLORS.neutral[100],
        marginHorizontal: 16,
    },
    // ===== Shortcuts =====
    shortcutsSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
    },
    shortcutsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    shortcutCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    shortcutIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    shortcutLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
    },
    // ===== Menu =====
    menuSection: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 8,
    },
    menuContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 1,
    },
    // ===== Bottom Menu (Settings, Help, Logout - matching farmer side) =====
    bottomMenuSection: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    bottomMenuContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
    },
    bottomMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    bottomMenuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    bottomMenuLabel: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    // ===== Version =====
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.neutral[300],
        marginTop: 16,
    },
});

export default ExpertProfile;
