import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import './ProductDetails.css';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { fetchCartCount } = useShop();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProduct(productId);
                setProduct(data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/user-auth');
            return;
        }

        try {
            setAdding(true);
            await cartService.addToCart(productId, 1);
            await fetchCartCount();
            alert('Product added to cart!');
        } catch (err) {
            alert('Failed to add to cart. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container">
                <div className="alert alert-error">{error || 'Product not found'}</div>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="product-details">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back
                </button>

                <div className="product-details-grid">
                    {/* Product Image */}
                    <div className="product-image-section">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="product-detail-image"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/600x450?text=No+Image';
                            }}
                        />
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <span className="product-category-tag">{product.category}</span>
                        <h1 className="product-detail-name">{product.name}</h1>

                        <div className="product-price-section">
                            <span className="product-detail-price">₹{Number(product.price).toLocaleString()}</span>
                        </div>

                        {product.color && (
                            <div className="product-meta">
                                <strong>Color:</strong> {product.color}
                            </div>
                        )}

                        <div className="product-description-section">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="product-actions-section">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAddToCart}
                                disabled={adding}
                            >
                                {adding ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button className="btn btn-outline btn-lg">
                                Buy Now
                            </button>
                        </div>

                        <div className="product-additional-info">
                            <div className="info-item">
                                <span className="info-label">Product ID:</span>
                                <span className="info-value">{product.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
