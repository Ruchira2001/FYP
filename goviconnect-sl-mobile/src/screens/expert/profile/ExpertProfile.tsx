import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { useExpert } from '../../../context/ExpertContext';

const ExpertProfile: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { expert, logout, settings, updateSettings, changeLanguage } = useExpert();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [availableForChat, setAvailableForChat] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => logout(),
                },
            ]
        );
    };

    const handleLanguageToggle = async () => {
        const newLang = i18n.language === 'en' ? 'si' : 'en';
        await changeLanguage(newLang);
    };

    const menuItems = [
        {
            section: 'Account',
            items: [
                {
                    icon: 'person-outline' as const,
                    label: 'Edit Profile',
                    color: COLORS.primary[600],
                    onPress: () => { },
                },
                {
                    icon: 'shield-outline' as const,
                    label: 'Qualifications',
                    color: COLORS.secondary[600],
                    subtitle: expert?.qualifications?.length ? `${expert.qualifications.length} listed` : undefined,
                    onPress: () => { },
                },
                {
                    icon: 'time-outline' as const,
                    label: 'Availability Schedule',
                    color: COLORS.info,
                    onPress: () => { },
                },
            ],
        },
        {
            section: 'Preferences',
            items: [
                {
                    icon: 'language-outline' as const,
                    label: 'Language',
                    color: COLORS.primary[600],
                    subtitle: i18n.language === 'en' ? 'English' : 'සිංහල',
                    onPress: handleLanguageToggle,
                },
            ],
        },
        {
            section: 'History',
            items: [
                {
                    icon: 'medical-outline' as const,
                    label: 'Diagnosis History',
                    color: COLORS.error,
                    onPress: () => navigation.navigate('ExpertDiagnosisReviews'),
                },
                {
                    icon: 'chatbubbles-outline' as const,
                    label: 'Chat History',
                    color: COLORS.primary[500],
                    onPress: () => navigation.navigate('ExpertChatsList'),
                },
                {
                    icon: 'calendar-outline' as const,
                    label: 'Meeting History',
                    color: COLORS.info,
                    onPress: () => navigation.navigate('ExpertMeetingsTab'),
                },
            ],
        },
        {
            section: 'Support',
            items: [
                {
                    icon: 'help-circle-outline' as const,
                    label: 'Help Center',
                    color: COLORS.neutral[600],
                    onPress: () => { },
                },
                {
                    icon: 'document-text-outline' as const,
                    label: 'Terms & Conditions',
                    color: COLORS.neutral[600],
                    onPress: () => { },
                },
                {
                    icon: 'information-circle-outline' as const,
                    label: 'About GoviConnect',
                    color: COLORS.neutral[600],
                    onPress: () => { },
                },
            ],
        },
    ];

    return (
        <View style={styles.container}>
            <Header
                showCursiveTitle
                showLanguage
                onLanguagePress={handleLanguageToggle}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={{ fontSize: 36 }}>👨‍⚕️</Text>
                        </View>
                        <View style={styles.expertVerifiedBadge}>
                            <Ionicons name="shield-checkmark" size={12} color="#ffffff" />
                        </View>
                    </View>

                    <Text style={styles.name}>{expert?.name || 'Dr. Kamal Perera'}</Text>
                    <Text style={styles.specialty}>{expert?.specialty || 'Plant Pathology'}</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.locationText}>{expert?.district || 'Kandy'}</Text>
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={18} color="#f59e0b" />
                        <Text style={styles.ratingText}>{expert?.rating || 4.8}</Text>
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
                </View>

                {/* Specializations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Specializations</Text>
                    <View style={styles.specializationChips}>
                        {(expert?.specializations || ['Vegetables', 'Fruits', 'Paddy']).map((spec, idx) => (
                            <View key={idx} style={styles.specChip}>
                                <Ionicons name="leaf" size={14} color={COLORS.primary[600]} />
                                <Text style={styles.specChipText}>{spec}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Toggles */}
                <View style={styles.togglesCard}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="notifications-outline" size={20} color={COLORS.neutral[600]} />
                            <Text style={styles.toggleLabel}>Push Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: COLORS.neutral[200], true: COLORS.primary[200] }}
                            thumbColor={notificationsEnabled ? COLORS.primary[500] : COLORS.neutral[400]}
                        />
                    </View>
                    <View style={styles.toggleDivider} />
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="chatbubble-outline" size={20} color={COLORS.neutral[600]} />
                            <Text style={styles.toggleLabel}>Available for Chat</Text>
                        </View>
                        <Switch
                            value={availableForChat}
                            onValueChange={setAvailableForChat}
                            trackColor={{ false: COLORS.neutral[200], true: COLORS.primary[200] }}
                            thumbColor={availableForChat ? COLORS.primary[500] : COLORS.neutral[400]}
                        />
                    </View>
                </View>

                {/* Menu Sections */}
                {menuItems.map((section) => (
                    <View key={section.section} style={styles.menuSection}>
                        <Text style={styles.menuSectionTitle}>{section.section}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[
                                        styles.menuItem,
                                        idx < section.items.length - 1 && styles.menuItemBorder,
                                    ]}
                                    onPress={item.onPress}
                                    activeOpacity={0.6}
                                >
                                    <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <View style={styles.menuItemContent}>
                                        <Text style={styles.menuItemLabel}>{item.label}</Text>
                                        {item.subtitle && (
                                            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <PrimaryButton
                        title="Logout"
                        variant="outline"
                        icon="log-out-outline"
                        onPress={handleLogout}
                        fullWidth
                    />
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
    scrollView: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.md,
    },
    avatarSection: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.primary[200],
    },
    expertVerifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    specialty: {
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
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
    },
    ratingText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#92400e',
        marginLeft: 4,
    },
    ratingSubtext: {
        fontSize: 12,
        color: '#92400e',
        marginLeft: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
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
    section: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.neutral[700],
        marginBottom: 10,
    },
    specializationChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    specChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        marginRight: 8,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    specChipText: {
        fontSize: 13,
        color: COLORS.primary[700],
        fontWeight: '500',
        marginLeft: 6,
    },
    togglesCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
        marginLeft: 10,
    },
    toggleDivider: {
        height: 1,
        backgroundColor: COLORS.neutral[100],
        marginHorizontal: 14,
    },
    menuSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    menuSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.neutral[400],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    menuCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
        ...SHADOW.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
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
    menuItemLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[800],
    },
    menuItemSubtitle: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 1,
    },
    logoutSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.neutral[300],
        marginTop: 16,
    },
});

export default ExpertProfile;
