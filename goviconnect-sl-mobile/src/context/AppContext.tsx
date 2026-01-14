import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    getSettings,
    saveSettings,
    getUser,
    saveUser,
    isOnboardingComplete,
    setOnboardingComplete,
    isLoggedIn,
    setAuthToken,
    logout as logoutStorage,
    AppSettings,
    User,
    defaultSettings,
} from '../services/storage';
import { initI18n, setStoredLanguage } from '../i18n';
import { initNetInfo } from '../services/netinfo';

interface AppContextType {
    // Auth
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: Partial<User>) => Promise<boolean>;
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
            const [storedSettings, storedUser, onboardingComplete, loggedIn] = await Promise.all([
                getSettings(),
                getUser(),
                isOnboardingComplete(),
                isLoggedIn(),
            ]);

            setSettings(storedSettings);
            setUser(storedUser);
            setHasCompletedOnboarding(onboardingComplete);
            setIsAuthenticated(loggedIn);
        } catch (error) {
            console.error('Error initializing app:', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful login
            const mockUser: User = {
                id: 'user_1',
                name: 'Saman Perera',
                email: email,
                phone: '0771234567',
                district: 'Kandy',
                crops: ['tea', 'paddy', 'tomato'],
            };

            await saveUser(mockUser);
            await setAuthToken('mock_token_' + Date.now());

            setUser(mockUser);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: Partial<User>): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newUser: User = {
                id: 'user_' + Date.now(),
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                district: userData.district || '',
                crops: userData.crops || [],
            };

            await saveUser(newUser);
            await setAuthToken('mock_token_' + Date.now());

            setUser(newUser);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await logoutStorage();
            setUser(null);
            setIsAuthenticated(false);
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
                login,
                register,
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
        </AppContext.Provider>
    );
};
