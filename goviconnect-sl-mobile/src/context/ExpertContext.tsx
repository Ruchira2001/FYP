import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    getSettings,
    saveSettings,
    AppSettings,
    defaultSettings,
} from '../services/storage';
import { authAPI, saveAuthData, getAuthData, clearAuthData } from '../services/api';
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
    loginError: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateExpert: (updated: Partial<ExpertUser>) => void;
    switchRole: (targetRole: 'farmer' | 'expert') => Promise<boolean>;

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

export const ExpertProvider: React.FC<ExpertProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [expert, setExpert] = useState<ExpertUser | null>(null);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        initializeApp();
    }, []);

    const formatExpert = (u: any): ExpertUser => ({
        id: u._id || u.id,
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        district: u.district || '',
        specialty: u.specialty || '',
        specialtySi: u.specialtySi || '',
        avatar: u.avatar,
        rating: u.rating || 0,
        totalConsultations: u.totalConsultations || 0,
        farmersHelped: u.farmersHelped || 0,
        yearsExperience: u.yearsExperience || 0,
        qualifications: u.qualifications || [],
        specializations: u.specializations || [],
    });

    const initializeApp = async () => {
        try {
            await initI18n();
            initNetInfo();

            const [storedSettings, authData] = await Promise.all([
                getSettings(),
                getAuthData(),
            ]);

            setSettings(storedSettings);

            // Try to restore expert session
            if (authData.token && authData.role === 'expert') {
                try {
                    const res = await authAPI.getMe();
                    setExpert(formatExpert(res.data.user));
                    setIsAuthenticated(true);
                    setHasCompletedOnboarding(true);
                } catch {
                    await clearAuthData();
                }
            }
        } catch (error) {
            console.error('Error initializing expert app:', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setLoginError(null);
        try {
            const res = await authAPI.loginExpert({ email, password });
            const { token, user: u } = res.data;
            const formatted = formatExpert(u);
            await saveAuthData(token, formatted, 'expert');
            setExpert(formatted);
            setIsAuthenticated(true);
            return true;
        } catch (error: any) {
            let msg = 'Login failed. Please try again.';
            if (error?.response?.data?.message) {
                msg = error.response.data.message;
            } else if (!error?.response) {
                msg = 'Cannot connect to server. Check your network and try again.';
            }
            setLoginError(msg);
            console.error('Expert login error:', error?.response?.data || error?.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const switchRole = async (targetRole: 'farmer' | 'expert'): Promise<boolean> => {
        setIsLoading(true);
        try {
            const res = await authAPI.switchRole(targetRole);
            if (res.data.success) {
                const { token, user: u } = res.data;
                
                // Format correctly based on role
                if (targetRole === 'expert') {
                    const formatted = formatExpert(u);
                    await saveAuthData(token, formatted, 'expert');
                    setExpert(formatted);
                } else {
                    // For farmer, we just need to save the token and let AppContext handle it
                    // but we can also clear expert state
                    await saveAuthData(token, u, 'farmer');
                    setExpert(null);
                }
                
                setIsAuthenticated(targetRole === 'expert');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Expert switch role error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateExpert = (updated: Partial<ExpertUser>): void => {
        setExpert(prev => prev ? { ...prev, ...updated } : prev);
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await clearAuthData();
            setExpert(null);
            setIsAuthenticated(false);
            setLoginError(null);
        } catch (error) {
            console.error('Expert logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const completeOnboarding = async (): Promise<void> => {
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
                loginError,
                login,
                logout,
                updateExpert,
                switchRole,
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
