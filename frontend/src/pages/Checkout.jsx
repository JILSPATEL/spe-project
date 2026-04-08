import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import './Checkout.css';

const Checkout = () => {
    const { user } = useAuth();
    const { fetchCartCount } = useShop();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: '',
        pincode: '',
        contact: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await cartService.placeOrder(formData);
            await fetchCartCount(); // Reset cart count to 0 in UI
            alert('Order placed successfully!');
            navigate('/my-orders');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h2 className="checkout-title">Checkout</h2>
                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Shipping Address</label>
                        <textarea
                            name="address"
                            className="form-control"
                            rows="3"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            className="form-control"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{6}"
                            title="Please enter valid 6 digit pincode"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Number</label>
                        <input
                            type="tel"
                            name="contact"
                            className="form-control"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}"
                            title="Please enter valid 10 digit number"
                        />
                    </div>

                    <div className="checkout-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate('/cart')}
                        >
                            Back to Cart
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
