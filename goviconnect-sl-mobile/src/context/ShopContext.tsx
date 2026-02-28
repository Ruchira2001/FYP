import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, saveAuthData, getAuthData, clearAuthData } from '../services/api';

export interface ShopProfile {
    id: string;
    name: string;
    email: string;
    location: string;
    type: 'Individual' | 'Business' | 'Exporter';
    avatar?: string;
}

interface ShopContextType {
    isAuthenticated: boolean;
    shop: ShopProfile | null;
    loginError: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isInitialized: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [shop, setShop] = useState<ShopProfile | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const formatShop = (u: any): ShopProfile => ({
        id: u._id || u.id,
        name: u.name || u.shopName || '',
        email: u.email || '',
        location: u.location || u.district || '',
        type: u.type || 'Individual',
        avatar: u.avatar,
    });

    const checkAuthStatus = async () => {
        try {
            const authData = await getAuthData();
            if (authData.token && authData.role === 'shop') {
                try {
                    const res = await authAPI.getMe();
                    setShop(formatShop(res.data.data));
                    setIsAuthenticated(true);
                } catch {
                    await clearAuthData();
                }
            }
        } catch (error) {
            console.error('Failed to load shop auth status', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setLoginError(null);
        try {
            const res = await authAPI.loginShop({ email, password });
            const { token, user: u } = res.data;
            const formatted = formatShop(u);
            await saveAuthData(token, formatted, 'shop');
            setShop(formatted);
            setIsAuthenticated(true);
            return true;
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Login failed. Please try again.';
            setLoginError(msg);
            console.error('Shop login failed', msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await clearAuthData();
            setShop(null);
            setIsAuthenticated(false);
            setLoginError(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <ShopContext.Provider value={{
            isAuthenticated,
            shop,
            loginError,
            isLoading,
            login,
            logout,
            isInitialized
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
