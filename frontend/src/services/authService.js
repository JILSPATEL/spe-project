import api from './api';

export const authService = {
    // User signup
    signup: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // User login
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('localCart');
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export const sellerAuthService = {
    // Seller signup
    signup: async (sellerData) => {
        const response = await api.post('/seller-auth/signup', sellerData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('seller', JSON.stringify(response.data.seller));
        }
        return response.data;
    },

    // Seller login
    login: async (credentials) => {
        const response = await api.post('/seller-auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('seller', JSON.stringify(response.data.seller));
        }
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('seller');
    },

    // Get current seller
    getCurrentSeller: () => {
        const sellerStr = localStorage.getItem('seller');
        return sellerStr ? JSON.parse(sellerStr) : null;
    },

    // Check if seller is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('seller') && !!localStorage.getItem('token');
    },
};
