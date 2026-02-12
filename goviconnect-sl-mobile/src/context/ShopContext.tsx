import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, removeItem } from '../services/storage';

interface ShopProfile {
    id: string;
    name: string;
    email: string;
    location: string;
    type: 'Individual' | 'Business' | 'Exporter';
}

interface ShopContextType {
    isAuthenticated: boolean;
    shop: ShopProfile | null;
    login: (profile: ShopProfile) => Promise<void>;
    logout: () => Promise<void>;
    isInitialized: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [shop, setShop] = useState<ShopProfile | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const storedShop = await getItem<ShopProfile>('goviconnect_shop_profile');
            if (storedShop) {
                setShop(storedShop);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Failed to load shop auth status', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const login = async (profile: ShopProfile) => {
        try {
            await setItem('goviconnect_shop_profile', profile);
            setShop(profile);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await removeItem('goviconnect_shop_profile');
            setShop(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <ShopContext.Provider value={{
            isAuthenticated,
            shop,
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
