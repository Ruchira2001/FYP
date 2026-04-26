import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    getSettings,
    saveSettings,
    saveUser,
    isOnboardingComplete,
    setOnboardingComplete,
    AppSettings,
    User,
    defaultSettings,
} from '../services/storage';
import { authAPI, saveAuthData, getAuthData, clearAuthData } from '../services/api';
import { initI18n, setStoredLanguage } from '../i18n';
import { initNetInfo } from '../services/netinfo';

interface AppContextType {
    // Auth
    isAuthenticated: boolean;
    user: User | null;
    loginError: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (updated: Partial<User>) => void;

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Initialize i18n
            await initI18n();

            // Initialize network monitoring
            initNetInfo();

            // Load stored data
            const [storedSettings, onboardingComplete, authData] = await Promise.all([
                getSettings(),
                isOnboardingComplete(),
                getAuthData(),
            ]);

            setSettings(storedSettings);
            setHasCompletedOnboarding(onboardingComplete);

            // Try to restore session using saved token
            if (authData.token && authData.role === 'farmer') {
                try {
                    const res = await authAPI.getMe();
                    const u = res.data.user;
                    const formatted: User = {
                        id: u._id,
                        name: u.name,
                        email: u.email,
                        phone: u.phone || '',
                        district: u.district || '',
                        crops: u.crops || [],
                        avatar: u.avatar,
                    };
                    setUser(formatted);
                    setIsAuthenticated(true);
                } catch {
                    // Token expired/invalid - clear auth data
                    await clearAuthData();
                }
            }
        } catch (error) {
            console.error('Error initializing app:', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setLoginError(null);
        try {
            const res = await authAPI.loginFarmer({ email, password });
            const { token, user: u } = res.data;
            const formatted: User = {
                id: u._id,
                name: u.name,
                email: u.email,
                phone: u.phone || '',
                district: u.district || '',
                crops: u.crops || [],
                avatar: u.avatar,
            };
            await saveAuthData(token, formatted, 'farmer');
            await saveUser(formatted);
            setUser(formatted);
            setIsAuthenticated(true);
            return true;
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Login failed. Please try again.';
            setLoginError(msg);
            console.error('Login error:', msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
        setIsLoading(true);
        setLoginError(null);
        try {
            const payload: any = {
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                password: userData.password,
                crops: userData.crops || [],
            };
            // Only include district if the user selected one (avoids Mongoose enum error on empty string)
            if (userData.district) {
                payload.district = userData.district;
            }
            const res = await authAPI.registerFarmer(payload);
            const { token, user: u } = res.data;
            const formatted: User = {
                id: u._id,
                name: u.name,
                email: u.email,
                phone: u.phone || '',
                district: u.district || '',
                crops: u.crops || [],
                avatar: u.avatar,
            };
            await saveAuthData(token, formatted, 'farmer');
            await saveUser(formatted);
            setUser(formatted);
            setIsAuthenticated(true);
            return true;
        } catch (error: any) {
            let msg = 'Registration failed. Please try again.';
            if (error?.response?.data?.message) {
                msg = error.response.data.message;
            } else if (!error?.response) {
                msg = 'Cannot connect to server. Check your network and try again.';
            }
            setLoginError(msg);
            console.error('Register error:', error?.response?.data || error?.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (updated: Partial<User>): void => {
        setUser(prev => prev ? { ...prev, ...updated } : prev);
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
            setLoginError(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const completeOnboarding = async (): Promise<void> => {
        await setOnboardingComplete();
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
        <AppContext.Provider
            value={{
                isAuthenticated,
                user,
                loginError,
                login,
                register,
                logout,
                updateUser,
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
        </AppContext.Provider>
    );
};
