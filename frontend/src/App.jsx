import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SellerProvider } from './context/SellerContext';
import Header from './components/Header';
import Home from './pages/Home';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import UserAuth from './pages/UserAuth';
import SellerAuth from './pages/SellerAuth';
import SellerHome from './pages/SellerHome';
import AddProduct from './pages/AddProduct';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import SellerOrders from './pages/SellerOrders';
import { ShopProvider } from './context/ShopContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SellerProvider>
          <ShopProvider>
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:category" element={<CategoryProducts />} />
                  <Route path="/details/:productId" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/user-auth" element={<UserAuth />} />
                  <Route path="/seller-auth" element={<SellerAuth />} />

                  {/* Seller Routes */}
                  <Route path="/seller-home" element={<SellerHome />} />
                  <Route path="/seller-add-product" element={<AddProduct />} />
                  <Route path="/seller-orders" element={<SellerOrders />} />
                </Routes>
              </main>
            </div>
          </ShopProvider>
        </SellerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
