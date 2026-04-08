import api from './api';

export const cartService = {
    // Get cart items
    getCartItems: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    // Add item to cart
    addToCart: async (productId, quantity = 1) => {
        const response = await api.post('/cart', { productId, quantity });
        return response.data;
    },

    // Update cart item quantity
    updateCartItem: async (cartId, quantity) => {
        const response = await api.put(`/cart/${cartId}`, { quantity });
        return response.data;
    },

    // Remove item from cart
    removeFromCart: async (cartId) => {
        const response = await api.delete(`/cart/${cartId}`);
        return response.data;
    },

    // Clear entire cart
    clearCart: async () => {
        const response = await api.delete('/cart');
        return response.data;
    },

    // Get cart count
    getCartCount: async () => {
        const response = await api.get('/cart/count');
        return response.data;
    },

    // Place Order
    placeOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get My Orders
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    // Get All Orders (Seller)
    getSellerOrders: async () => {
        const response = await api.get('/orders/seller/all');
        return response.data;
    },

    // Update Order Status
    updateOrderStatus: async (orderId, status) => {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },
    // Cancel Order (User)
    cancelOrder: async (orderId) => {
        const response = await api.put(`/orders/${orderId}/cancel`);
        return response.data;
    },
};
