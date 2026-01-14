import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
        <View className="flex-1 bg-neutral-50">
            <Header title={t('profile.title')} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View className="mx-4 mt-4 bg-white rounded-2xl p-5 border border-neutral-100"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                >
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mr-4">
                            <Text className="text-3xl">👨‍🌾</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-neutral-800">
                                {user?.name || 'Farmer'}
                            </Text>
                            <Text className="text-sm text-neutral-500">
                                {user?.district || user?.email}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('EditProfile')}
                            className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
                        >
                            <Ionicons name="pencil" size={18} color={COLORS.neutral[600]} />
                        </TouchableOpacity>
                    </View>

                    {/* My Crops */}
                    {user?.crops && user.crops.length > 0 && (
                        <View className="mt-4 pt-4 border-t border-neutral-100">
                            <Text className="text-xs text-neutral-400 uppercase mb-2">
                                {t('profile.my_crops_label')}
                            </Text>
                            <View className="flex-row flex-wrap">
                                {user.crops.map((cropId) => {
                                    const { name, icon } = getCropDisplay(cropId);
                                    return (
                                        <View
                                            key={cropId}
                                            className="flex-row items-center bg-primary-50 rounded-full px-3 py-1.5 mr-2 mb-2"
                                        >
                                            <Text className="mr-1">{icon}</Text>
                                            <Text className="text-sm text-primary-700">{name}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>

                {/* Quick Shortcuts */}
                <View className="px-4 py-4">
                    <Text className="text-lg font-semibold text-neutral-800 mb-3">
                        {t('profile.shortcuts')}
                    </Text>
                    <View className="flex-row flex-wrap justify-between">
                        {shortcuts.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={item.onPress}
                                className="w-[48%] bg-white rounded-xl p-4 mb-3 border border-neutral-100"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 4,
                                    elevation: 1,
                                }}
                            >
                                <View
                                    className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                                    style={{ backgroundColor: item.color + '20' }}
                                >
                                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <Text className="text-sm font-medium text-neutral-700" numberOfLines={2}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Menu Items */}
                <View className="px-4 pb-8">
                    <View className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={item.onPress}
                                className={`flex-row items-center px-4 py-4 ${index < menuItems.length - 1 ? 'border-b border-neutral-100' : ''
                                    }`}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={22}
                                    color={item.color || COLORS.neutral[600]}
                                />
                                <Text
                                    className="flex-1 ml-3 text-base"
                                    style={{ color: item.color || COLORS.neutral[800] }}
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

export default Profile;
