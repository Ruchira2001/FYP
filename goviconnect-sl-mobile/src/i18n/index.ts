import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import si from './si.json';

const LANGUAGE_KEY = '@goviconnect_language';

const resources = {
    en: { translation: en },
    si: { translation: si },
};

export const getStoredLanguage = async (): Promise<string> => {
    try {
        const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        return storedLang || 'en';
    } catch {
        return 'en';
    }
};

export const setStoredLanguage = async (lang: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
        await i18n.changeLanguage(lang);
    } catch (error) {
        console.error('Error saving language:', error);
    }
};

export const initI18n = async () => {
    const storedLanguage = await getStoredLanguage();

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: storedLanguage,
            fallbackLng: 'en',
            compatibilityJSON: 'v3',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
        });

    return i18n;
};

export const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
];

export default i18n;
