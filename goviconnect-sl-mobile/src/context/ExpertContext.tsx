import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    getSettings,
    saveSettings,
    isOnboardingComplete,
    setOnboardingComplete,
    AppSettings,
    defaultSettings,
    setItem,
    getItem,
    removeItem,
} from '../services/storage';
import { initI18n, setStoredLanguage } from '../i18n';
import { initNetInfo } from '../services/netinfo';

export interface ExpertUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    district: string;
    specialty: string;
    specialtySi: string;
    avatar?: string;
    rating: number;
    totalConsultations: number;
    farmersHelped: number;
    yearsExperience: number;
    qualifications: string[];
    specializations: string[];
}

interface ExpertContextType {
    // Auth
    isAuthenticated: boolean;
    isExpertMode: boolean;
    expert: ExpertUser | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;

    // Onboarding
    hasCompletedOnboarding: boolean;
    completeOnboarding: () => Promise<void>;

    // Settings
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    changeLanguage: (lang: string) => Promise<void>;

    // Loading
    isLoading: boolean;
    isInitialized: boolean;
}

const ExpertContext = createContext<ExpertContextType | undefined>(undefined);

export const useExpert = () => {
    const context = useContext(ExpertContext);
    if (!context) {
        throw new Error('useExpert must be used within an ExpertProvider');
    }
    return context;
};

interface ExpertProviderProps {
    children: ReactNode;
}

const EXPERT_STORAGE_KEYS = {
    EXPERT_USER: '@goviconnect_expert_user',
    EXPERT_AUTH_TOKEN: '@goviconnect_expert_auth_token',
    EXPERT_ONBOARDING: '@goviconnect_expert_onboarding',
};

export const ExpertProvider: React.FC<ExpertProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [expert, setExpert] = useState<ExpertUser | null>(null);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            await initI18n();
            initNetInfo();

            const [storedSettings, storedExpert, onboardingComplete, token] = await Promise.all([
                getSettings(),
                getItem<ExpertUser>(EXPERT_STORAGE_KEYS.EXPERT_USER),
                getItem<boolean>(EXPERT_STORAGE_KEYS.EXPERT_ONBOARDING),
                getItem<string>(EXPERT_STORAGE_KEYS.EXPERT_AUTH_TOKEN),
            ]);

            setSettings(storedSettings);
            setExpert(storedExpert);
            setHasCompletedOnboarding(onboardingComplete === true);
            setIsAuthenticated(!!token);
        } catch (error) {
            console.error('Error initializing expert app:', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockExpert: ExpertUser = {
                id: 'expert-1',
                name: 'Dr. Kamal Perera',
                email: email,
                phone: '0712345678',
                district: 'Kandy',
                specialty: 'Plant Pathology',
                specialtySi: 'ශාක රෝගවේදය',
                rating: 4.8,
                totalConsultations: 245,
                farmersHelped: 189,
                yearsExperience: 20,
                qualifications: ['PhD Plant Pathology', 'M.Sc. Agriculture', 'B.Sc. Botany'],
                specializations: ['Vegetables', 'Fruits', 'Paddy'],
            };

            await setItem(EXPERT_STORAGE_KEYS.EXPERT_USER, mockExpert);
            await setItem(EXPERT_STORAGE_KEYS.EXPERT_AUTH_TOKEN, 'expert_token_' + Date.now());

            setExpert(mockExpert);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Expert login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await removeItem(EXPERT_STORAGE_KEYS.EXPERT_AUTH_TOKEN);
            await removeItem(EXPERT_STORAGE_KEYS.EXPERT_USER);
            setExpert(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Expert logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const completeOnboarding = async (): Promise<void> => {
        await setItem(EXPERT_STORAGE_KEYS.EXPERT_ONBOARDING, true);
        setHasCompletedOnboarding(true);
    };

    const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
        const updated = { ...settings, ...newSettings };
        await saveSettings(updated);
        setSettings(updated);
    };

    const changeLanguage = async (lang: string): Promise<void> => {
        await setStoredLanguage(lang);
        await updateSettings({ language: lang });
    };

    return (
        <ExpertContext.Provider
            value={{
                isAuthenticated,
                isExpertMode: true,
                expert,
                login,
                logout,
                hasCompletedOnboarding,
                completeOnboarding,
                settings,
                updateSettings,
                changeLanguage,
                isLoading,
                isInitialized,
            }}
        >
            {children}
        </ExpertContext.Provider>
    );
};
