import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="language" size={40} color={COLORS.primary[500]} />
                    </View>

                    <Text style={styles.title}>
                        {t('onboarding.select_language')}
                    </Text>

                    <Text style={styles.subtitle}>
                        {t('onboarding.language_note')}
                    </Text>
                </View>

                {/* Language Options */}
                <View>
                    {languages.map((lang) => {
                        const isSelected = selectedLanguage === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleLanguageSelect(lang.code)}
                                style={[
                                    styles.languageOption,
                                    isSelected ? styles.languageOptionSelected : styles.languageOptionDefault,
                                ]}
                            >
                                <View style={[
                                    styles.langCode,
                                    isSelected ? styles.langCodeSelected : styles.langCodeDefault
                                ]}>
                                    <Text style={[
                                        styles.langCodeText,
                                        isSelected ? styles.langCodeTextSelected : styles.langCodeTextDefault
                                    ]}>
                                        {lang.code.toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.langInfo}>
                                    <Text style={[
                                        styles.langNativeName,
                                        isSelected && { color: COLORS.primary[700] }
                                    ]}>
                                        {lang.nativeName}
                                    </Text>
                                    <Text style={styles.langName}>{lang.name}</Text>
                                </View>

                                {isSelected && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 64,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.primary[100],
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.neutral[500],
        textAlign: 'center',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 16,
    },
    languageOptionSelected: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[50],
        shadowColor: COLORS.primary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    languageOptionDefault: {
        borderColor: COLORS.neutral[200],
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    langCode: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    langCodeSelected: {
        backgroundColor: COLORS.primary[500],
    },
    langCodeDefault: {
        backgroundColor: COLORS.neutral[100],
    },
    langCodeText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    langCodeTextSelected: {
        color: '#ffffff',
    },
    langCodeTextDefault: {
        color: COLORS.neutral[500],
    },
    langInfo: {
        flex: 1,
    },
    langNativeName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    langName: {
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    checkmark: {
        width: 24,
        height: 24,
        backgroundColor: COLORS.primary[500],
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 48,
    },
});

export default LanguageSelect;
