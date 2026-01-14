import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';
import { PrimaryButton } from '../../components';
import { useApp } from '../../context';
import { languages } from '../../i18n';

const LanguageSelect: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { changeLanguage, completeOnboarding } = useApp();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

    const handleLanguageSelect = async (langCode: string) => {
        setSelectedLanguage(langCode);
        try {
            await changeLanguage(langCode);
        } catch (error) {
            console.log('Language change error:', error);
        }
    };

    const handleContinue = async () => {
        try {
            await completeOnboarding();
        } catch (error) {
            console.log('Onboarding complete error:', error);
        }
        navigation.replace('Login');
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View className="flex-1 px-6 pt-16">
                {/* Header */}
                <View className="items-center mb-12">
                    <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
                        <Ionicons name="language" size={40} color={COLORS.primary[500]} />
                    </View>

                    <Text className="text-2xl font-bold text-neutral-800 text-center mb-2">
                        {t('onboarding.select_language')}
                    </Text>

                    <Text className="text-sm text-neutral-500 text-center">
                        {t('onboarding.language_note')}
                    </Text>
                </View>

                {/* Language Options */}
                <View>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => handleLanguageSelect(lang.code)}
                            className={`flex-row items-center p-5 rounded-2xl border-2 mb-4 ${selectedLanguage === lang.code
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-neutral-200 bg-white'
                                }`}
                            style={{
                                shadowColor: selectedLanguage === lang.code ? COLORS.primary[500] : '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: selectedLanguage === lang.code ? 0.1 : 0.05,
                                shadowRadius: 8,
                                elevation: selectedLanguage === lang.code ? 3 : 1,
                            }}
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
                </View>
            </View>

            {/* Continue Button */}
            <View className="px-6 pb-12">
                <PrimaryButton
                    title={t('common.confirm')}
                    onPress={handleContinue}
                    icon="arrow-forward"
                    iconPosition="right"
                    fullWidth
                    size="lg"
                />
            </View>
        </View>
    );
};

export default LanguageSelect;
