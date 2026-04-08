import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, showActions = false, onDelete }) => {
    return (
        <div className="product-card">
            <Link to={`/details/${product.id}`} className="product-link">
                <div className="product-image-container">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                    />
                    <span className="product-category-badge">{product.category}</span>
                </div>
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                        {product.description?.substring(0, 80)}...
                    </p>
                    <div className="product-footer">
                        <span className="product-price">₹{Number(product.price).toLocaleString()}</span>
                        {product.color && (
                            <span className="product-color">Color: {product.color}</span>
                        )}
                    </div>
                </div>
            </Link>

            {showActions && (
                <div className="product-actions">
                    <Link
                        to={`/seller-update-product/${product.id}`}
                        className="btn btn-sm btn-primary"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="btn btn-sm btn-outline"
                        style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
