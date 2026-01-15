import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components';
import { COLORS } from '../../utils/constants';
import { useApp } from '../../context';
import cropsData from '../../data/crops.json';

const Profile: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { user, logout } = useApp();

    const getCropDisplay = (cropId: string) => {
        const crop = cropsData.crops.find(c => c.id === cropId);
        return {
            name: i18n.language === 'si' ? crop?.nameSi : crop?.name,
            icon: crop?.icon,
        };
    };

    const handleLogout = () => {
        Alert.alert(
            t('profile.logout'),
            t('profile.logout_confirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Auth' }],
                        });
                    }
                },
            ]
        );
    };

    const shortcuts = [
        {
            id: 'saved',
            icon: 'bookmark',
            label: t('profile.saved_learnhub'),
            color: COLORS.primary[500],
            onPress: () => navigation.navigate('LearnHubTab', { screen: 'SavedLibrary' }),
        },
        {
            id: 'diagnosis',
            icon: 'medical',
            label: t('profile.diagnosis_history'),
            color: COLORS.error,
            onPress: () => navigation.navigate('AITab', { screen: 'DiagnosisHistory' }),
        },
        {
            id: 'prediction',
            icon: 'analytics',
            label: t('profile.prediction_history'),
            color: COLORS.info,
            onPress: () => navigation.navigate('AITab', { screen: 'PredictionHistory' }),
        },
        {
            id: 'meetings',
            icon: 'calendar',
            label: t('profile.my_meetings'),
            color: COLORS.secondary[500],
            onPress: () => navigation.navigate('MeetingsTab', { screen: 'MyMeetings' }),
        },
    ];

    const menuItems = [
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
            <Header title={t('profile.title')} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>👨‍🌾</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {user?.name || 'Farmer'}
                            </Text>
                            <Text style={styles.userDistrict}>
                                {user?.district || user?.email}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('EditProfile')}
                            style={styles.editButton}
                        >
                            <Ionicons name="pencil" size={18} color={COLORS.neutral[600]} />
                        </TouchableOpacity>
                    </View>

                    {/* My Crops */}
                    {user?.crops && user.crops.length > 0 && (
                        <View style={styles.cropsSection}>
                            <Text style={styles.sectionLabel}>
                                {t('profile.my_crops_label')}
                            </Text>
                            <View style={styles.cropsList}>
                                {user.crops.map((cropId) => {
                                    const { name, icon } = getCropDisplay(cropId);
                                    return (
                                        <View
                                            key={cropId}
                                            style={styles.cropBadge}
                                        >
                                            <Text style={styles.cropIcon}>{icon}</Text>
                                            <Text style={styles.cropName}>{name}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>

                {/* Quick Shortcuts */}
                <View style={styles.shortcutsSection}>
                    <Text style={styles.sectionTitle}>
                        {t('profile.shortcuts')}
                    </Text>
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

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <View style={styles.menuContainer}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={item.onPress}
                                style={[
                                    styles.menuItem,
                                    index < menuItems.length - 1 && styles.menuItemBorder
                                ]}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={22}
                                    color={item.color || COLORS.neutral[600]}
                                />
                                <Text
                                    style={[
                                        styles.menuLabel,
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
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50], // neutral-50
    },
    content: {
        flex: 1,
    },
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
    },
    avatarText: {
        fontSize: 30,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    userDistrict: {
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    editButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cropsSection: {
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
    },
    cropsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cropBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    cropIcon: {
        marginRight: 4,
    },
    cropName: {
        fontSize: 14,
        color: COLORS.primary[700],
    },
    shortcutsSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
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
    menuSection: {
        paddingHorizontal: 16,
        paddingBottom: 32,
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
        paddingVertical: 16,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    menuLabel: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
});

export default Profile;
