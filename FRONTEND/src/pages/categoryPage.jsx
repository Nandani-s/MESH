import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Heart, Package, Loader2, AlertCircle,
  ArrowRight, ArrowLeft, Grid3X3, List, Search
} from 'lucide-react';
import { productApi } from '../api/products';
import { categoryApi } from '../api/categories';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import ProductCard from '../components/ui/ProductCard';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
	const load = async () => {
	  setIsLoading(true);
	  setError('');
	  try {
		const [catRes, prodRes] = await Promise.all([
		  categoryApi.getAll(),
		  productApi.getAll(),
		]);

		// Find the category matching this slug
		const found = (catRes.data || []).find(c => c.slug === slug);
		if (!found) {
		  setError('Category not found.');
		  setIsLoading(false);
		  return;
		}
		setCategory(found);

		// Filter products belonging to this category (match name or slug)
		const nameKey = found.name.toLowerCase();
		const slugKey = (found.slug || '').toLowerCase();
		const filtered = (prodRes.data || []).filter((p) => {
		  const cat = (p.category || '').toLowerCase();
		  return cat === nameKey || cat === slugKey;
		});
		setProducts(filtered);
	  } catch {
		setError('Failed to load category. Please try again.');
	  } finally {
		setIsLoading(false);
	  }
	};
	load();
  }, [slug]);

  const handleHeartClick = async (e, product) => {
	e.preventDefault();
	if (!isAuthenticated) { navigate('/login'); return; }
	await toggleWishlist(product);
  };

  const displayedProducts = [...products]
	.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
	.sort((a, b) => {
	  if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
	  if (sortBy === 'price-low') return a.price - b.price;
	  if (sortBy === 'price-high') return b.price - a.price;
	  return a.name.localeCompare(b.name);
	});

  if (isLoading) return (
	<div className="min-h-screen flex items-center justify-center">
	  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
	</div>
  );

  if (error) return (
	<div className="min-h-screen flex items-center justify-center px-4">
	  <div className="text-center">
		<AlertCircle className="w-12 h-12 text-danger-400 mx-auto mb-4" />
		<p className="text-text-muted mb-6">{error}</p>
		<Link to="/categories" className="inline-flex items-center gap-2 text-primary-500 hover:underline">
		  <ArrowLeft className="w-4 h-4" /> Back to Categories
		</Link>
	  </div>
	</div>
  );

  return (
	<div className="min-h-screen bg-background">
	  {/* Header */}
	  <PageHeader
		eyebrow="Collection"
		title={category?.name}
		subtitle={category?.description || `${products.length} products`}
		breadcrumb={[
		  { label: 'Categories', to: '/categories' },
		  { label: category?.name || slug },
		]}
	  >
		{category?.image && (
		  <div className="mt-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-4xl overflow-hidden">
			{category.image.startsWith('http')
			  ? <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
			  : category.image}
		  </div>
		)}
	  </PageHeader>

	  <Container className="py-8">
		{/* Controls */}
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
		  <div className="relative flex-1 max-w-xs">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
			<input type="text" placeholder="Search in this category..."
			  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
			  className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary text-sm" />
		  </div>
		  <div className="flex items-center gap-3">
			<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
			  className="px-4 py-2.5 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary text-sm">
			  <option value="newest">Newest First</option>
			  <option value="price-low">Price: Low to High</option>
			  <option value="price-high">Price: High to Low</option>
			  <option value="name">Name A–Z</option>
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

		{/* Empty */}
		{displayedProducts.length === 0 && (
		  <div className="text-center py-20 text-text-muted">
			<Package className="w-16 h-16 mx-auto mb-4 text-border" />
			<p className="text-lg font-medium mb-2">
			  {products.length === 0 ? 'No products in this category yet' : 'No products match your search'}
			</p>
			<Link to="/shop" className="mt-4 inline-flex items-center gap-2 text-primary-500 hover:underline text-sm">
			  Browse all products <ArrowRight className="w-4 h-4" />
			</Link>
		  </div>
		)}

		{/* Grid */}
		{displayedProducts.length > 0 && viewMode === 'grid' && (
		  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
			{displayedProducts.map((product) => (
			  <ProductCard key={product._id} product={product} />
			))}
		  </div>
		)}

		{/* List */}
		{displayedProducts.length > 0 && viewMode === 'list' && (
		  <div className="space-y-4">
			{displayedProducts.map((product) => {
			  const inWishlist = isInWishlist(product._id);
			  return (
				<Link key={product._id} to={`/product/${product._id}`}
				  className="group flex gap-6 bg-surface-light rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border-light hover:border-primary-200 p-4">
				  <div className="w-28 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-background-muted">
					{product.image ? (
					  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
					) : (
					  <div className="w-full h-full flex items-center justify-center">
						<Package className="w-8 h-8 text-primary-200" />
					  </div>
					)}
				  </div>
				  <div className="flex-1 flex flex-col justify-between min-w-0">
					<div>
					  <p className="text-xs text-text-muted mb-1">{product.brand}</p>
					  <h3 className="font-semibold text-text-primary mb-2">{product.name}</h3>
					  <p className="text-sm text-text-muted line-clamp-2">{product.description}</p>
					</div>
					<div className="flex items-center justify-between mt-3">
					  <span className="text-xl font-bold text-primary-600">{formatCurrency(product.price, settings.currency)}</span>
					  <button onClick={(e) => handleHeartClick(e, product)}
						className={`p-2 rounded-lg transition-colors ${
						  inWishlist ? 'bg-danger-50 text-danger-500' : 'hover:bg-background-muted text-text-muted hover:text-danger-500'
						}`}>
						<Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
					  </button>
					</div>
				  </div>
			</Link>
		  );
		})}
	  </div>
	)}
  </Container>
	</div>
  );
};

export default CategoryPage;
