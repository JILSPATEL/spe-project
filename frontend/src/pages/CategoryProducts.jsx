import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import './CategoryProducts.css';

const CategoryProducts = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await productService.getProductsByCategory(category);
                setProducts(data);
            } catch (err) {
                console.error('Error fetching category products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            fetchProducts();
        }
    }, [category]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading {category} products...</p>
            </div>
        );
    }

    return (
        <div className="category-products">
            <div className="container">
                <div className="category-header">
                    <h1 className="category-title">{category}</h1>
                    <p className="category-count">{products.length} products found</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {products.length === 0 && !error ? (
                    <div className="no-products">
                        <p>No products found in this category.</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;
