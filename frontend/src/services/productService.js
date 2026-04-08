import api from './api';

export const productService = {
    // Get all products
    getAllProducts: async (limit = null) => {
        const url = limit ? `/products?_limit=${limit}` : '/products';
        const response = await api.get(url);
        return response.data;
    },

    // Get seller's own products
    getMyProducts: async () => {
        const response = await api.get('/products/my-products');
        return response.data;
    },

    // Get trending products
    getTrendingProducts: async (limit = 16) => {
        const response = await api.get(`/products/trending?limit=${limit}`);
        return response.data;
    },

    // Get popular products
    getPopularProducts: async (limit = 3) => {
        const response = await api.get(`/products/popular?limit=${limit}`);
        return response.data;
    },

    // Get products by category
    getProductsByCategory: async (category) => {
        const response = await api.get(`/products/category/${category}`);
        return response.data;
    },

    // Get single product
    getProduct: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Search products
    searchProducts: async (query) => {
        const response = await api.get(`/products/search?q=${query}`);
        return response.data;
    },

    // Add product (seller only)
    addProduct: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    // Update product (seller only)
    updateProduct: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // Delete product (seller only)
    deleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
