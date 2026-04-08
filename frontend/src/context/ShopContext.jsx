import { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error('useShop must be used within ShopProvider');
    }
    return context;
};

export const ShopProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCartCount();
        } else {
            setCartCount(0);
        }
    }, [isAuthenticated]);

    const fetchCartCount = async () => {
        try {
            const data = await cartService.getCartCount();
            setCartCount(data.count || 0);
        } catch (err) {
            console.error('Error fetching cart count:', err);
        }
    };

    const value = {
        cartCount,
        fetchCartCount,
        setCartCount
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
