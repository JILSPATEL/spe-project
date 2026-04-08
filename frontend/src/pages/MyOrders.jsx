import { useEffect, useState } from 'react';
import { cartService } from '../services/cartService';
import './MyOrders.css';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await cartService.getMyOrders();
            setOrders(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            await cartService.cancelOrder(orderId);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, order_status: 'Cancelled' } : order
            ));
            alert('Order cancelled successfully');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to cancel order');
        }
    };

    if (loading) return <div className="text-center p-5">Loading orders...</div>;
    if (error) return <div className="text-center p-5 text-red-500">{error}</div>;

    return (
        <div className="my-orders-page">
            <div className="orders-container">
                <h2 className="orders-title">My Orders</h2>

                {orders.length === 0 ? (
                    <div className="text-center">
                        <p>No orders found.</p>
                        <button onClick={() => navigate('/')} className="btn-primary mt-4">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <span className="order-id">Order #{order.id}</span>
                                <span className={`order-status status-${order.order_status?.toLowerCase()}`}>
                                    {order.order_status}
                                </span>
                            </div>
                            <div className="order-body">
                                <div className="order-items">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <span>{item.product_name} x {item.quantity}</span>
                                            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-footer">
                                    <span className="order-date">
                                        Placed on: {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <div className="order-total">
                                        Total: ₹{Number(order.total_price).toLocaleString()}
                                    </div>
                                    {!['Delivered', 'Cancelled'].includes(order.order_status) && (
                                        <button
                                            onClick={() => handleCancel(order.id)}
                                            className="btn btn-sm btn-outline text-red-500 border-red-500 hover:bg-red-50"
                                            style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;
