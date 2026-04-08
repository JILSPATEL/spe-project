import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const { fetchCartCount } = useShop();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/user-auth');
            return;
        }
        fetchCart();
    }, [isAuthenticated, navigate]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.getCartItems();
            setCartItems(data);
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            await cartService.updateCartItem(cartId, newQuantity);
            setCartItems(cartItems.map(item =>
                item.id === cartId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (err) {
            alert('Failed to update quantity');
        }
    };

    const removeItem = async (cartId) => {
        if (!window.confirm('Remove this item from cart?')) return;

        try {
            await cartService.removeFromCart(cartId);
            setCartItems(cartItems.filter(item => item.id !== cartId));
            await fetchCartCount();
        } catch (err) {
            alert('Failed to remove item');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading cart...</p>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">Shopping Cart</h1>

                {error && <div className="alert alert-error">{error}</div>}

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* Cart Items */}
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="cart-item-image"
                                        onClick={() => navigate(`/details/${item.product_id}`)}
                                    />

                                    <div className="cart-item-details">
                                        <h3 className="cart-item-name">{item.name}</h3>
                                        <p className="cart-item-category">{item.category}</p>
                                        {item.color && <p className="cart-item-color">Color: {item.color}</p>}
                                        <p className="cart-item-price">₹{Number(item.price).toLocaleString()}</p>
                                    </div>

                                    <div className="cart-item-actions">
                                        <div className="quantity-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="item-total">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </p>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="btn-remove"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="cart-summary">
                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Items ({cartItems.length})</span>
                                <span>₹{calculateTotal().toLocaleString()}</span>
                            </div>

                            <div className="summary-row">
                                <span>Delivery</span>
                                <span className="text-success">FREE</span>
                            </div>

                            <div className="summary-total">
                                <span>Total</span>
                                <span>₹{calculateTotal().toLocaleString()}</span>
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                                onClick={() => navigate('/checkout')}
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-outline"
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
