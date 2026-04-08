import { createContext, useState, useContext, useEffect } from 'react';
import { sellerAuthService } from '../services/authService';

const SellerContext = createContext();

export const useSeller = () => {
    const context = useContext(SellerContext);
    if (!context) {
        throw new Error('useSeller must be used within SellerProvider');
    }
    return context;
};

export const SellerProvider = ({ children }) => {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if seller is logged in on mount
        const currentSeller = sellerAuthService.getCurrentSeller();
        if (currentSeller) {
            setSeller(currentSeller);
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const data = await sellerAuthService.login(credentials);
        setSeller(data.seller);
        return data;
    };

    const signup = async (sellerData) => {
        const data = await sellerAuthService.signup(sellerData);
        setSeller(data.seller);
        return data;
    };

    const logout = () => {
        sellerAuthService.logout();
        setSeller(null);
    };

    const value = {
        seller,
        login,
        signup,
        logout,
        isAuthenticated: !!seller,
        loading,
    };

    return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
};
