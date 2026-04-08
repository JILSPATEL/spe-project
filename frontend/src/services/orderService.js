import api from './api';

export const orderService = {
    // Place new order
    placeOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get user's orders
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    // Get single order details
    getOrderDetails: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    // Get all orders (seller)
    getAllOrders: async () => {
        const response = await api.get('/orders/seller/all');
        return response.data;
    },

    // Update order status (seller)
    updateOrderStatus: async (orderId, status) => {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },
};
