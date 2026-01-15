import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

            <View style={styles.modalContent}>
                {/* Handle */}
                <View style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.closeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={24} color={COLORS.neutral[600]} />
                    </TouchableOpacity>

                    <Text style={styles.title}>
                        {t('onboarding.select_language')}
                    </Text>

                    <View style={{ width: 40 }} />
                </View>

                {/* Language Options */}
                <View style={styles.optionsContainer}>
                    {languages.map((lang) => {
                        const isSelected = selectedLanguage === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleLanguageSelect(lang.code)}
                                style={[
                                    styles.option,
                                    isSelected ? styles.optionSelected : styles.optionDefault
                                ]}
                            >
                                <View
                                    style={[
                                        styles.iconContainer,
                                        isSelected ? styles.iconContainerSelected : styles.iconContainerDefault
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.langCode,
                                            isSelected ? styles.langCodeSelected : styles.langCodeDefault
                                        ]}
                                    >
                                        {lang.code.toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.textContainer}>
                                    <Text
                                        style={[
                                            styles.nativeName,
                                            isSelected ? styles.nativeNameSelected : styles.nativeNameDefault
                                        ]}
                                    >
                                        {lang.nativeName}
                                    </Text>
                                    <Text style={styles.englishName}>{lang.name}</Text>
                                </View>

                                {isSelected && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    <Text style={styles.note}>
                        {t('onboarding.language_note')}
                    </Text>
                </View>

                {/* Confirm Button */}
                <View style={styles.buttonContainer}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.neutral[300],
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    closeButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    optionsContainer: {
        padding: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 12,
    },
    optionSelected: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[50],
    },
    optionDefault: {
        borderColor: COLORS.neutral[200],
        backgroundColor: '#ffffff',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconContainerSelected: {
        backgroundColor: COLORS.primary[500],
    },
    iconContainerDefault: {
        backgroundColor: COLORS.neutral[100],
    },
    langCode: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    langCodeSelected: {
        color: '#ffffff',
    },
    langCodeDefault: {
        color: COLORS.neutral[500],
    },
    textContainer: {
        flex: 1,
    },
    nativeName: {
        fontSize: 18,
        fontWeight: '600',
    },
    nativeNameSelected: {
        color: COLORS.primary[700],
    },
    nativeNameDefault: {
        color: COLORS.neutral[800],
    },
    englishName: {
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
    note: {
        fontSize: 14,
        color: COLORS.neutral[400],
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
});

export default LanguageModal;
