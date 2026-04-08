import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSeller } from '../context/SellerContext';
import { useShop } from '../context/ShopContext';
import './Header.css';

const Header = () => {
    const { user, logout: userLogout, isAuthenticated: isUserAuth } = useAuth();
    const { seller, logout: sellerLogout, isAuthenticated: isSellerAuth } = useSeller();
    const { cartCount, fetchCartCount } = useShop();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search/${searchQuery}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        if (isUserAuth) {
            userLogout();
            navigate('/');
        } else if (isSellerAuth) {
            sellerLogout();
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <h1>ShopHub</h1>
                    </Link>

                    {/* Search Bar */}
                    <form className="search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-btn">
                            Search
                        </button>
                    </form>

                    {/* Navigation */}
                    <nav className="nav">
                        {!isUserAuth && !isSellerAuth && (
                            <>
                                <Link to="/user-auth" className="nav-link">User Login</Link>
                                <Link to="/seller-auth" className="nav-link">Seller Login</Link>
                            </>
                        )}

                        {isUserAuth && (
                            <>
                                <Link to="/" className="nav-link">Home</Link>
                                <Link to="/cart" className="nav-link cart-link">
                                    Cart
                                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                </Link>
                                <Link to="/my-orders" className="nav-link">My Orders</Link>
                                <span className="nav-user">Hi, {user?.name}</span>
                                <button onClick={handleLogout} className="btn btn-sm btn-outline">
                                    Logout
                                </button>
                            </>
                        )}

                        {isSellerAuth && (
                            <>
                                <Link to="/seller-home" className="nav-link">Dashboard</Link>
                                <Link to="/seller-add-product" className="nav-link">Add Product</Link>
                                <Link to="/seller-orders" className="nav-link">Orders</Link>
                                <span className="nav-user">Hi, {seller?.name}</span>
                                <button onClick={handleLogout} className="btn btn-sm btn-outline">
                                    Logout
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
