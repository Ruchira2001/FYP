import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
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
        const currentIndex = languages.findIndex(l => l.code === i18n.language);
        const nextIndex = (currentIndex + 1) % languages.length;
        changeLanguage(languages[nextIndex].code);
    };

    const handleLiteModeToggle = (value: boolean) => {
        updateSettings({ liteMode: value });
    };

    const handleNotificationsToggle = (value: boolean) => {
        updateSettings({ notifications: value });
    };

    const getCurrentLanguage = () => {
        const lang = languages.find(l => l.code === i18n.language);
        return lang?.nativeName || 'English';
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('settings.title')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Language */}
                    <TouchableOpacity
                        onPress={handleLanguageChange}
                        className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 flex-row items-center"
                    >
                        <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center mr-3">
                            <Ionicons name="language" size={22} color={COLORS.primary[600]} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium text-neutral-800">
                                {t('settings.language')}
                            </Text>
                        </View>
                        <Text className="text-primary-600 font-medium mr-2">
                            {getCurrentLanguage()}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                    </TouchableOpacity>

                    {/* Lite Mode */}
                    <View className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 flex-row items-center">
                        <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
                            <Ionicons name="flash" size={22} color={COLORS.warning} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium text-neutral-800">
                                {t('settings.lite_mode')}
                            </Text>
                            <Text className="text-xs text-neutral-400 mt-0.5">
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
                        className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 flex-row items-center"
                    >
                        <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mr-3">
                            <Ionicons name="cloud-download" size={22} color={COLORS.success} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium text-neutral-800">
                                {t('settings.offline_downloads')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                    </TouchableOpacity>

                    {/* Notifications */}
                    <View className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 flex-row items-center">
                        <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
                            <Ionicons name="notifications" size={22} color={COLORS.info} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium text-neutral-800">
                                {t('settings.notifications')}
                            </Text>
                            <Text className="text-xs text-neutral-400 mt-0.5">
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
                        className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 flex-row items-center"
                    >
                        <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-3">
                            <Ionicons name="trash" size={22} color={COLORS.error} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium text-neutral-800">
                                {t('settings.clear_cache')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                    </TouchableOpacity>

                    {/* App Version */}
                    <View className="mt-8 items-center">
                        <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mb-3">
                            <Ionicons name="leaf" size={32} color={COLORS.primary[500]} />
                        </View>
                        <Text className="text-primary-600 font-bold text-lg">Goviconnect SL</Text>
                        <Text className="text-neutral-400 text-sm mt-1">
                            {t('settings.app_version')}: {APP_VERSION}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Settings;
