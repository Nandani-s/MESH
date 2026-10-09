import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { trackAnalyticsEvent } from './utils/analyticsTracking';
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
import LoginOtp from './components/LoginOtp';
import ForgotPassword from './components/ForgotPassword';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Search from './pages/Search';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Legal from './pages/Legal';



import AdminLayout from './layouts/AdminLayout';
import RequireAdmin from './components/RequireAdmin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSetting from './pages/admin/AdminSetting';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAddCategory from './pages/admin/AdminAddCategory';

import AdminReports from './pages/admin/AdminReports';
import CategoryPage from './pages/categoryPage';
import ProductDetail from './pages/ProductDetail';


// Main Layout for non-admin routes
const MainLayout = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		trackAnalyticsEvent('visit');
	}, [pathname]);

	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

const ScrollToTop = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
	}, [pathname]);

	return null;
};

const App = () => {
	return (
		<Router>
			<ScrollToTop />
			<Routes>
				{/* Admin routes - protected: only authenticated admins can reach these */}
				<Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
					<Route index element={<AdminDashboard />} />
					<Route path="products" element={<AdminProducts />} />
					<Route path="products/new" element={<AdminAddProduct />} />
					<Route path="orders" element={<AdminOrders />} />
					<Route path="users" element={<AdminUsers />} />
					<Route path="settings" element={<AdminSetting />} />
					<Route path="analytics" element={<AdminAnalytics />} />
					<Route path="reports" element={<AdminReports />} />
					<Route path="categories/new" element={<AdminAddCategory />} />
					<Route path="categories" element={<AdminCategories />} />
					
				</Route>

				{/* Main routes with header and footer */}
				<Route path="/" element={<MainLayout />}>
					<Route index element={<Home />} />
					<Route path="home" element={<Home />} />
					<Route path="shop" element={<Shop />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="categories" element={<Categories />} />
					<Route path="new-arrivals" element={<NewArrivals />} />
					<Route path="sale" element={<Sale />} />
					<Route path="about" element={<About />} />
					<Route path="contact" element={<Contact />} />
					<Route path="wishlist" element={<Wishlist />} />
					<Route path="cart" element={<Cart />} />
					<Route path="category/:slug" element={<CategoryPage />} />
					<Route path="product/:id" element={<ProductDetail />} />
					<Route path="login-otp" element={<LoginOtp />} />
					<Route path="forgot-password" element={<ForgotPassword />} />
					<Route path="checkout" element={<Checkout />} />
					<Route path="orders" element={<MyOrders />} />
					<Route path="profile" element={<Profile />} />
					<Route path="search" element={<Search />} />
					<Route path="terms" element={<Legal type="terms" />} />
					<Route path="privacy" element={<Legal type="privacy" />} />
					<Route path="payment/success" element={<PaymentSuccess />} />
					<Route path="payment/failure" element={<PaymentFailure />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</Router>
	);
};

export default App;