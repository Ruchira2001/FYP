import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components';
import { COLORS, APP_VERSION } from '../../utils/constants';
import { useApp } from '../../context';
import { languages } from '../../i18n';

const Settings: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { settings, updateSettings, changeLanguage } = useApp();

    const handleLanguageChange = () => {
        navigation.navigate('LanguageModal');
    };

    const handleLiteModeToggle = (value: boolean) => {
        updateSettings({ liteMode: value });
    };

    const handleNotificationsToggle = (value: boolean) => {
        updateSettings({ notifications: value });
    };

    const getCurrentLanguage = () => {
        // Safe check to avoid undefined if i18n isn't loaded correctly yet
        const currentCode = (i18n.language || 'en').substring(0, 2);
        const lang = languages.find(l => l.code === currentCode);
        return lang?.nativeName || 'English';
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('settings.title')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.scrollContent}>
                    {/* Language */}
                    <TouchableOpacity
                        onPress={handleLanguageChange}
                        style={styles.settingCard}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: COLORS.primary[100] }]}>
                            <Ionicons name="language" size={22} color={COLORS.primary[600]} />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingTitle}>
                                {t('settings.language')}
                            </Text>
                        </View>
                        <Text style={styles.valueText}>
                            {getCurrentLanguage()}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                    </TouchableOpacity>

                    {/* Lite Mode */}
                    <View style={styles.settingCard}>
                        <View style={[styles.iconContainer, { backgroundColor: '#ffedd5' }]}>
                            <Ionicons name="flash" size={22} color={COLORS.warning} />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingTitle}>
                                {t('settings.lite_mode')}
                            </Text>
                            <Text style={styles.settingDescription}>
                                {t('settings.lite_mode_desc')}
                            </Text>
                        </View>
                        <Switch
                            value={settings.liteMode}
                            onValueChange={handleLiteModeToggle}
                            trackColor={{ false: COLORS.neutral[200], true: COLORS.primary[400] }}
                            thumbColor={settings.liteMode ? COLORS.primary[500] : COLORS.neutral[50]}
                        />
                    </View>

                    {/* Offline Downloads */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('LearnHubTab', { screen: 'OfflineDownloads' })}
                        style={styles.settingCard}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
                            <Ionicons name="cloud-download" size={22} color={COLORS.success} />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingTitle}>
                                {t('settings.offline_downloads')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                    </TouchableOpacity>

                    {/* Notifications */}
                    <View style={styles.settingCard}>
                        <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                            <Ionicons name="notifications" size={22} color={COLORS.info} />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingTitle}>
                                {t('settings.notifications')}
                            </Text>
                            <Text style={styles.settingDescription}>
                                {t('settings.notifications_desc')}
                            </Text>
                        </View>
                        <Switch
                            value={settings.notifications}
                            onValueChange={handleNotificationsToggle}
                            trackColor={{ false: COLORS.neutral[200], true: COLORS.primary[400] }}
                            thumbColor={settings.notifications ? COLORS.primary[500] : COLORS.neutral[50]}
                        />
                    </View>

                    {/* Clear Cache */}
                    <TouchableOpacity
                        style={styles.settingCard}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                            <Ionicons name="trash" size={22} color={COLORS.error} />
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingTitle}>
                                {t('settings.clear_cache')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                    </TouchableOpacity>

                    {/* App Version */}
                    <View style={styles.versionContainer}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="leaf" size={32} color={COLORS.primary[500]} />
                        </View>
                        <Text style={styles.appName}>Goviconnect SL</Text>
                        <Text style={styles.versionText}>
                            {t('settings.app_version')}: {APP_VERSION}
                        </Text>
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
    scrollContent: {
        padding: 16,
    },
    settingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.neutral[800],
    },
    settingDescription: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    valueText: {
        color: COLORS.primary[600],
        fontWeight: '500',
        marginRight: 8,
    },
    versionContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    logoContainer: {
        width: 64,
        height: 64,
        backgroundColor: COLORS.primary[100],
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    appName: {
        color: COLORS.primary[600],
        fontWeight: 'bold',
        fontSize: 18,
    },
    versionText: {
        color: COLORS.neutral[400],
        fontSize: 14,
        marginTop: 4,
    },
});

export default Settings;
