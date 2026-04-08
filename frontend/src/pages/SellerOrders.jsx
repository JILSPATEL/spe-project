import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import './SellerOrders.css';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, order_status: newStatus } : order
            ));
            alert('Order status updated');
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

    if (loading) return <div className="loading">Loading orders...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="seller-orders-page">
            <div className="seller-orders-container">
                <div className="page-header">
                    <h1>Order Management</h1>
                </div>

                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="text-sm">{order.id.substring(0, 8)}...</td>
                                    <td>
                                        <div className="user-info">
                                            <strong>{order.name}</strong>
                                            <span className="user-email">{order.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="items-list">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="item-row">
                                                    {item.product_name} x {item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>₹{Number(order.total_price).toLocaleString()}</td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${order.order_status?.toLowerCase()}`}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={order.order_status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            className="status-select"
                                            disabled={['Delivered', 'Cancelled'].includes(order.order_status)}
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center p-4">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerOrders;
