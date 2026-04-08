import { useEffect, useState } from 'react';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import './Home.css';

const Home = () => {
    const [popularProducts, setPopularProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const [popular, trending] = await Promise.all([
                    productService.getPopularProducts(3),
                    productService.getTrendingProducts(16),
                ]);

                setPopularProducts(popular);
                setTrendingProducts(trending);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="home">
            {/* Category Navigation */}
            <CategoryNav />

            {/* Popular Products Carousel */}
            {popularProducts.length > 0 && (
                <section className="popular-section">
                    <div className="container">
                        <h2 className="section-title">Popular Products</h2>
                        <div className="popular-grid">
                            {popularProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trending Products */}
            <section className="trending-section">
                <div className="container">
                    <h2 className="section-title">Trending Products</h2>
                    <div className="trending-grid">
                        {trendingProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
