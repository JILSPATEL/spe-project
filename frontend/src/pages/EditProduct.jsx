import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import './AddProduct.css';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Mobile',
        color: '',
        description: '',
        image: '',
        inventory_count: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const categories = ['Mobile', 'Laptop', 'TV', 'Camera', 'Electronics', 'Clothes', 'Other'];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productService.getProduct(productId);
                setFormData({
                    name: data.name || '',
                    price: data.price || '',
                    category: data.category || 'Mobile',
                    color: data.color || '',
                    description: data.description || '',
                    image: data.image || '',
                    inventory_count: data.inventory_count || 0,
                });
            } catch (err) {
                setError('Failed to load product');
            } finally {
                setFetching(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await productService.updateProduct(productId, formData);
            navigate('/seller-home');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading product...</p>
            </div>
        );
    }

    return (
        <div className="add-product-page">
            <div className="container">
                <div className="form-container">
                    <h1 className="page-title">Edit Product</h1>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-group">
                            <label className="form-label">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price (₹) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Color</label>
                            <input
                                type="text"
                                name="color"
                                className="form-input"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="e.g., Black, White, Blue"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Image URL *</label>
                            <input
                                type="url"
                                name="image"
                                className="form-input"
                                value={formData.image}
                                onChange={handleChange}
                                required
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Inventory Count *</label>
                            <input
                                type="number"
                                name="inventory_count"
                                className="form-input"
                                value={formData.inventory_count}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="Available quantity"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/seller-home')}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;