import { Link } from 'react-router-dom';
import './CategoryNav.css';

const categories = [
    { name: 'Mobile', icon: '📱' },
    { name: 'Laptop', icon: '💻' },
    { name: 'TV', icon: '📺' },
    { name: 'Camera', icon: '📷' },
    { name: 'Electronics', icon: '⚡' },
    { name: 'Clothes', icon: '👔' },
];

const CategoryNav = () => {
    return (
        <div className="category-nav">
            <div className="container">
                <h2 className="category-title">Shop by Category</h2>
                <div className="category-grid">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            to={`/category/${category.name}`}
                            className="category-card"
                        >
                            <span className="category-icon">{category.icon}</span>
                            <span className="category-name">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryNav;
