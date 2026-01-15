import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';
import { PrimaryButton } from '../../components';
import { useApp } from '../../context';
import { languages } from '../../i18n';

const LanguageModal: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { changeLanguage } = useApp();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
    const [isLoading, setIsLoading] = useState(false);

    const handleLanguageSelect = (langCode: string) => {
        setSelectedLanguage(langCode);
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await changeLanguage(selectedLanguage);
            navigation.goBack();
        } catch (error) {
            console.error('Language change error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-black/50 justify-end">
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

            <View className="bg-white rounded-t-3xl">
                {/* Handle */}
                <View className="items-center pt-3 pb-2">
                    <View className="w-10 h-1 bg-neutral-300 rounded-full" />
                </View>

                {/* Header */}
                <View className="flex-row items-center justify-between px-4 pb-4 border-b border-neutral-100">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={24} color={COLORS.neutral[600]} />
                    </TouchableOpacity>

                    <Text className="text-lg font-semibold text-neutral-800">
                        {t('onboarding.select_language')}
                    </Text>

                    <View className="w-10" />
                </View>

                {/* Language Options */}
                <View className="p-4">
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => handleLanguageSelect(lang.code)}
                            className={`flex-row items-center p-4 rounded-xl border-2 mb-3 ${selectedLanguage === lang.code
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-neutral-200 bg-white'
                                }`}
                        >
                            <View
                                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${selectedLanguage === lang.code ? 'bg-primary-500' : 'bg-neutral-100'
                                    }`}
                            >
                                <Text className={`text-lg font-bold ${selectedLanguage === lang.code ? 'text-white' : 'text-neutral-500'
                                    }`}>
                                    {lang.code.toUpperCase()}
                                </Text>
                            </View>

                            <View className="flex-1">
                                <Text className={`text-lg font-semibold ${selectedLanguage === lang.code ? 'text-primary-700' : 'text-neutral-800'
                                    }`}>
                                    {lang.nativeName}
                                </Text>
                                <Text className="text-sm text-neutral-500">{lang.name}</Text>
                            </View>

                            {selectedLanguage === lang.code && (
                                <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                                    <Ionicons name="checkmark" size={16} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}

                    <Text className="text-sm text-neutral-400 text-center mt-2 mb-4">
                        {t('onboarding.language_note')}
                    </Text>
                </View>

                {/* Confirm Button */}
                <View className="px-4 pb-8">
                    <PrimaryButton
                        title={t('common.confirm')}
                        onPress={handleConfirm}
                        loading={isLoading}
                        fullWidth
                        size="lg"
                    />
                </View>
            </View>
        </View>
    );
};

export default LanguageModal;
