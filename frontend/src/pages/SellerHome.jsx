import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import './SellerHome.css';

const SellerHome = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getMyProducts();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(id);
                setProducts(products.filter((p) => p.id !== id));
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="seller-home">
            <div className="container">
                <div className="seller-header">
                    <h1 className="page-title">Product Management</h1>
                    <button
                        onClick={() => navigate('/seller-add-product')}
                        className="btn btn-primary"
                    >
                        + Add New Product
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {products.length === 0 ? (
                    <div className="no-products">
                        <p>No products yet. Add your first product!</p>
                        <button
                            onClick={() => navigate('/seller-add-product')}
                            className="btn btn-primary"
                        >
                            Add Product
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                showActions={true}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerHome;
