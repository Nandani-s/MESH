import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Shop from './pages/Shop.jsx';
import Categories from './pages/Categories.jsx';
import NewArrivals from './pages/NewArrivals.jsx';
import Sale from './pages/Sale.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';



import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

// Admin Layout component that doesn't include Header and Footer
const AdminRouteWrapper = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </AdminLayout>
  );
};

// Main Layout for non-admin routes
const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Admin routes with admin layout (no header/footer) */}
        <Route path="/admin/*" element={<AdminRouteWrapper />} />
        
        {/* Main routes with header and footer */}
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
              <Route path="/sale" element={<Sale />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/category/:slug" element={<div className="py-20 text-center"><h1>Category sudi</h1></div>} />
              <Route path="/product/:slug" element={<div className="py-20 text-center"><h1>Product Page</h1></div>} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
};

export default App;