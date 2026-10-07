import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, Filter, X, ChevronDown,
  Search, Grid3X3, List, Loader2, Package,
  ArrowRight, Lock
} from 'lucide-react';
import { productApi } from '../api/products';
import { categoryApi } from '../api/categories';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';

const AVAILABILITY_OPTIONS = [
  { value: 'InStock', label: 'In Stock' },
  { value: 'OutOfStock', label: 'Out of Stock' },
  { value: 'PreOrder', label: 'Pre-Order' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

const Shop = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
	if (!isAuthenticated && !isAuthLoading) return; // don't fetch if not logged in
	Promise.all([productApi.getAll(), categoryApi.getAll()])
	  .then(([prodRes, catRes]) => {
		setProducts(prodRes.data || []);
		setCategories((catRes.data || []).filter(c => c.status === 'active'));
		// Set max price from data
		const highest = Math.max(...(prodRes.data || []).map(p => p.price), 1000);
		setMaxPrice(Math.ceil(highest / 100) * 100);
	  })
	  .catch(() => setError('Failed to load products. Please try again.'))
	  .finally(() => setIsLoading(false));
  }, [isAuthenticated, isAuthLoading]);

  const handleHeartClick = async (e, product) => {
	e.preventDefault();
	if (!isAuthenticated) { navigate('/login'); return; }
	await toggleWishlist(product);
  };

  const toggleCategory = (cat) =>
	setSelectedCategories(prev =>
	  prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
	);

  const toggleAvailability = (val) =>
	setSelectedAvailability(prev =>
	  prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
	);

  const filteredProducts = useMemo(() => {
	let result = [...products];

	if (searchTerm) result = result.filter(p =>
	  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
	  p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
	);
	if (selectedCategories.length > 0)
	  result = result.filter(p => selectedCategories.includes(p.category));
	if (selectedAvailability.length > 0)
	  result = result.filter(p => selectedAvailability.includes(p.availability));
	result = result.filter(p => p.price <= maxPrice);

	switch (sortBy) {
	  case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
	  case 'price-low': result.sort((a, b) => a.price - b.price); break;
	  case 'price-high': result.sort((a, b) => b.price - a.price); break;
	  case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
	}
	return result;
  }, [products, searchTerm, selectedCategories, selectedAvailability, maxPrice, sortBy]);

  const clearFilters = () => {
	setSelectedCategories([]);
	setSelectedAvailability([]);
	setSearchTerm('');
	setSortBy('newest');
  };

  const activeFilterCount = selectedCategories.length + selectedAvailability.length;

  // Show a spinner while auth state is loading
  if (isAuthLoading) {
	return (
	  <div className="min-h-screen flex items-center justify-center">
		<Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
	  </div>
	);
  }

  // Login gate — not logged in
  if (!isAuthenticated) {
	return (
	  <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
		<div className="max-w-md w-full text-center">
		  <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
			<Lock className="w-10 h-10 text-primary-500" />
		  </div>
		  <h2 className="text-2xl font-bold text-text-primary mb-3">Sign in to shop</h2>
		  <p className="text-text-muted mb-8">
			Create an account or sign in to browse our full collection and add items to your wishlist.
		  </p>
		  <div className="flex gap-4 justify-center">
			<Link to="/login"
			  className="flex-1 max-w-[160px] bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
			  Sign In
			</Link>
			<Link to="/register"
			  className="flex-1 max-w-[160px] border-2 border-primary-500 text-primary-500 hover:bg-primary-50 px-6 py-3 rounded-xl font-semibold transition-all">
			  Register
			</Link>
		  </div>
		  <Link to="/" className="mt-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary-500 transition-colors">
			← Back to Home
		  </Link>
		</div>
	  </div>
	);
  }

  const FilterSidebar = () => (
	<div className="space-y-6">
	  {/* Categories */}
	  <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
		<h3 className="font-semibold text-text-primary mb-4">Category</h3>
		<div className="space-y-2">
		  {categories.map((cat) => (
			<label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
			  <input type="checkbox" checked={selectedCategories.includes(cat.name)}
				onChange={() => toggleCategory(cat.name)}
				className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20" />
			  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-2">
				{cat.image && <span>{cat.image}</span>}
				{cat.name}
				<span className="text-xs text-text-muted ml-auto">({cat.productCount})</span>
			  </span>
			</label>
		  ))}
		</div>
	  </div>

	  {/* Availability */}
	  <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
		<h3 className="font-semibold text-text-primary mb-4">Availability</h3>
		<div className="space-y-2">
		  {AVAILABILITY_OPTIONS.map(({ value, label }) => (
			<label key={value} className="flex items-center gap-3 cursor-pointer group">
			  <input type="checkbox" checked={selectedAvailability.includes(value)}
				onChange={() => toggleAvailability(value)}
				className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20" />
			  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
			</label>
		  ))}
		</div>
	  </div>

	  {/* Price */}
	  <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
		<h3 className="font-semibold text-text-primary mb-4">Max Price: {formatCurrency(maxPrice, settings.currency)}</h3>
		<input type="range" min={0} max={Math.ceil(Math.max(...products.map(p => p.price), 1000) / 100) * 100}
		  step={50} value={maxPrice}
		  onChange={(e) => setMaxPrice(Number(e.target.value))}
		  className="w-full accent-primary-500" />
		<div className="flex justify-between text-xs text-text-muted mt-2">
		  <span>{formatCurrency(0, settings.currency)}</span>
		  <span>{formatCurrency(Math.ceil(Math.max(...products.map(p => p.price), 1000) / 100) * 100, settings.currency)}</span>
		</div>
	  </div>

	  {/* Clear */}
	  {activeFilterCount > 0 && (
		<button onClick={clearFilters}
		  className="w-full py-2.5 border-2 border-danger-300 text-danger-500 hover:bg-danger-50 rounded-xl text-sm font-medium transition-colors">
		  Clear All Filters ({activeFilterCount})
		</button>
	  )}
	</div>
  );

  return (
	<div className="min-h-screen bg-background-light">
	  {/* Page Header */}
	  <section className="bg-gradient-to-br from-secondary-50 via-surface to-background-light py-12">
		<div className="max-w-7xl mx-auto px-4">
		  <h1 className="text-4xl font-bold text-text-primary mb-2">Shop</h1>
		  <p className="text-text-muted">
			{isLoading ? 'Loading...' : `${filteredProducts.length} of ${products.length} products`}
		  </p>
		</div>
	  </section>

	  <div className="max-w-7xl mx-auto px-4 py-8">
		{/* Controls bar */}
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
		  <div className="flex items-center gap-3 flex-1 max-w-md">
			<div className="relative flex-1">
			  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
			  <input type="text" placeholder="Search products..."
				value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
				className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
			</div>
			<button onClick={() => setShowFilters(!showFilters)}
			  className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
				activeFilterCount > 0 ? 'bg-primary-500 text-white border-primary-500' : 'border-border-light hover:bg-background-muted'
			  }`}>
			  <Filter className="w-4 h-4" />
			  {activeFilterCount > 0 && <span className="text-xs font-bold">{activeFilterCount}</span>}
			</button>
		  </div>

		  <div className="flex items-center gap-3">
			<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
			  className="px-4 py-2.5 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary text-sm">
			  {SORT_OPTIONS.map(({ value, label }) => (
				<option key={value} value={value}>{label}</option>
			  ))}
			</select>
			<div className="flex gap-1 border border-border-light rounded-xl overflow-hidden">
			  <button onClick={() => setViewMode('grid')}
				className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'hover:bg-background-muted'}`}>
				<Grid3X3 className="w-4 h-4" />
			  </button>
			  <button onClick={() => setViewMode('list')}
				className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-background-muted'}`}>
				<List className="w-4 h-4" />
			  </button>
			</div>
		  </div>
		</div>

		<div className="flex gap-8">
		  {/* Desktop Sidebar */}
		  <aside className="hidden lg:block w-72 flex-shrink-0">
			<FilterSidebar />
		  </aside>

		  {/* Mobile Filter Drawer */}
		  {showFilters && (
			<div className="fixed inset-0 z-50 lg:hidden">
			  <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
			  <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-light shadow-2xl overflow-y-auto">
				<div className="p-6">
				  <div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-bold text-text-primary">Filters</h2>
					<button onClick={() => setShowFilters(false)} className="p-2 hover:bg-background-muted rounded-lg">
					  <X className="w-5 h-5" />
					</button>
				  </div>
				  <FilterSidebar />
				</div>
			  </div>
			</div>
		  )}

		  {/* Products */}
		  <div className="flex-1 min-w-0">
			{isLoading && (
			  <div className="flex justify-center py-20">
				<Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
			  </div>
			)}

			{!isLoading && error && (
			  <div className="text-center py-20 text-text-muted">
				<p className="text-danger-500">{error}</p>
			  </div>
			)}

			{!isLoading && !error && filteredProducts.length === 0 && (
			  <div className="text-center py-20 text-text-muted">
				<Package className="w-16 h-16 mx-auto mb-4 text-border" />
				<p className="text-lg font-medium mb-2">No products found</p>
				{activeFilterCount > 0 && (
				  <button onClick={clearFilters} className="mt-4 text-primary-500 hover:underline text-sm">
					Clear filters
				  </button>
				)}
			  </div>
			)}

			{!isLoading && !error && filteredProducts.length > 0 && (
			  <>
				{viewMode === 'grid' ? (
				  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredProducts.map((product) => {
					  const inWishlist = isInWishlist(product._id);
					  return (
						<Link key={product._id} to={`/product/${product._id}`}
						  className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-light hover:border-primary-200">
						  <div className="relative overflow-hidden aspect-[3/4]">
							{product.image ? (
							  <img src={product.image} alt={product.name}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
							) : (
							  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
								<Package className="w-16 h-16 text-primary-200" />
							  </div>
							)}
							<button
							  onClick={(e) => handleHeartClick(e, product)}
							  className={`absolute top-3 right-3 p-2.5 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 ${
								inWishlist ? 'bg-danger-500 text-white opacity-100' : 'bg-white/95 text-text-primary hover:text-danger-500'
							  }`}>
							  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
							</button>
							<div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							  <span className="block w-full text-center bg-white text-text-primary py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all text-sm">
								Quick View
							  </span>
							</div>
						  </div>
						  <div className="p-4">
							<p className="text-xs text-text-muted mb-1">{product.category} · {product.brand}</p>
							<h3 className="font-semibold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
							<div className="flex flex-wrap items-center gap-2">
							  <span className="text-lg font-bold text-primary-600">{formatCurrency(product.price, settings.currency)}</span>
							  {product.originalPrice && product.originalPrice > product.price && (
								<>
								  <span className="text-sm text-text-muted line-through">{formatCurrency(product.originalPrice, settings.currency)}</span>
								  <span className="text-xs bg-danger-100 text-danger-600 px-1.5 py-0.5 rounded-full font-semibold">
									-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
								  </span>
								</>
							  )}
							  <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
								product.availability === 'InStock' ? 'bg-green-100 text-green-700' :
								product.availability === 'OutOfStock' ? 'bg-red-100 text-red-700' :
								'bg-yellow-100 text-yellow-700'
							  }`}>
								{product.availability === 'InStock' ? 'In Stock' :
								 product.availability === 'OutOfStock' ? 'Sold Out' : 'Pre-Order'}
							  </span>
							</div>
						  </div>
						</Link>
					  );
					})}
				  </div>
				) : (
				  <div className="space-y-4">
					{filteredProducts.map((product) => {
					  const inWishlist = isInWishlist(product._id);
					  return (
						<Link key={product._id} to={`/product/${product._id}`}
						  className="group flex gap-6 bg-surface-light rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border-light hover:border-primary-200 p-4">
						  <div className="w-32 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-background-muted">
							{product.image ? (
							  <img src={product.image} alt={product.name}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
							) : (
							  <div className="w-full h-full flex items-center justify-center">
								<Package className="w-10 h-10 text-primary-200" />
							  </div>
							)}
						  </div>
						  <div className="flex-1 flex flex-col justify-between min-w-0">
							<div>
							  <p className="text-xs text-text-muted mb-1">{product.category} · {product.brand}</p>
							  <h3 className="font-semibold text-text-primary mb-2">{product.name}</h3>
							  <p className="text-sm text-text-muted line-clamp-2">{product.description}</p>
							</div>
							<div className="flex items-center justify-between mt-3">
							  <div className="flex items-center gap-2">
								<span className="text-xl font-bold text-primary-600">{formatCurrency(product.price, settings.currency)}</span>
								{product.originalPrice && product.originalPrice > product.price && (
								  <>
									<span className="text-sm text-text-muted line-through">{formatCurrency(product.originalPrice, settings.currency)}</span>
									<span className="text-xs bg-danger-100 text-danger-600 px-1.5 py-0.5 rounded-full font-semibold">
									  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
									</span>
								  </>
								)}
							  </div>
							  <div className="flex items-center gap-2">
								<button
								  onClick={(e) => handleHeartClick(e, product)}
								  className={`p-2 rounded-lg transition-colors ${
									inWishlist ? 'bg-danger-50 text-danger-500' : 'hover:bg-background-muted text-text-muted hover:text-danger-500'
								  }`}>
								  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
								</button>
								<span className={`text-xs px-3 py-1.5 rounded-full ${
								  product.availability === 'InStock' ? 'bg-green-100 text-green-700' :
								  product.availability === 'OutOfStock' ? 'bg-red-100 text-red-700' :
								  'bg-yellow-100 text-yellow-700'
								}`}>
								  {product.availability === 'InStock' ? 'In Stock' :
								   product.availability === 'OutOfStock' ? 'Sold Out' : 'Pre-Order'}
								</span>
							  </div>
							</div>
						  </div>
						</Link>
					  );
					})}
				  </div>
				)}
			  </>
			)}
		  </div>
		</div>
	  </div>
	</div>
  );
};

export default Shop;
