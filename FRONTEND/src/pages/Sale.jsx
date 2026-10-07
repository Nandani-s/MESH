import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, Zap, Tag,
  Percent, ArrowRight, Loader2, Package
} from 'lucide-react';
import { productApi } from '../api/products';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';

// Sale ends 7 days from today — change this to a fixed date for a real campaign
const SALE_END = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const getTimeLeft = () => {
  const diff = SALE_END - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
	days: Math.floor(diff / (1000 * 60 * 60 * 24)),
	hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
	minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
	seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

const Sale = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live countdown
  useEffect(() => {
	const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
	return () => clearInterval(interval);
  }, []);

  useEffect(() => {
	productApi.getAll()
	  .then((res) => {
		const sorted = (res.data || []).sort((a, b) => {
		  const discA = a.originalPrice > a.price ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
		  const discB = b.originalPrice > b.price ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
		  return discB - discA;
		});
		setAllProducts(sorted);
	  })
	  .catch(() => {})
	  .finally(() => setIsLoading(false));
  }, []);

  const handleHeartClick = async (e, product) => {
	e.preventDefault();
	if (!isAuthenticated) { navigate('/login'); return; }
	await toggleWishlist(product);
  };

  // Products with a real discount (originalPrice > price)
  const saleProducts = allProducts.filter(
	p => p.originalPrice && p.originalPrice > p.price
  );

  // Flash deals = top 3 most discounted
  const flashDeals = saleProducts.slice(0, 3);

  // All remaining sale items
  const mainSale = saleProducts;

  const getDiscount = (p) =>
	Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

  return (
	<div className="min-h-screen bg-background-light">
	  <PageHeader
		eyebrow="Limited Time Sale"
		title={saleProducts.length > 0 ? `Up to ${Math.max(...saleProducts.map(getDiscount))}% Off` : 'Sale Coming Soon'}
		subtitle={saleProducts.length > 0 ? `${saleProducts.length} products on sale — shop before time runs out!` : 'Check back soon for our next big sale event.'}
		breadcrumb={[{ label: 'Sale' }]}
	  >
		{/* Countdown */}
		<div className="mt-4 flex flex-wrap gap-3">
		  {[
			{ value: timeLeft.days, label: 'Days' },
			{ value: timeLeft.hours, label: 'Hours' },
			{ value: timeLeft.minutes, label: 'Mins' },
			{ value: timeLeft.seconds, label: 'Secs' },
		  ].map((item, index) => (
			<div key={index} className="text-center">
			  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-surface-light rounded-lg shadow-sm flex items-center justify-center border border-border-light">
				<span className="text-lg lg:text-xl font-bold text-danger-600 tabular-nums">
				  {String(item.value).padStart(2, '0')}
				</span>
			  </div>
			  <span className="text-[11px] text-text-muted mt-1 block">{item.label}</span>
			</div>
		  ))}
		</div>
		<a href="#deals"
		  className="mt-4 inline-flex items-center gap-2 bg-danger-500 hover:bg-danger-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg">
		  Shop Sale
		  <ArrowRight className="w-5 h-5" />
		</a>
	  </PageHeader>

	  {/* Loading */}
	  {isLoading && (
		<div className="flex justify-center py-20">
		  <Loader2 className="w-8 h-8 text-danger-500 animate-spin" />
		</div>
	  )}

	  {!isLoading && (
		<>
		  {/* Flash Deals */}
		  {flashDeals.length > 0 && (
			<section className="py-16 bg-surface">
			  <div className="max-w-7xl mx-auto px-4">
				<div className="flex items-center gap-3 mb-8">
				  <Zap className="w-8 h-8 text-warning-500 fill-warning-500" />
				  <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Flash Deals</h2>
				  <span className="bg-warning-100 text-warning-700 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
					Biggest Discounts
				  </span>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
				  {flashDeals.map((deal) => (
					<Link key={deal._id} to={`/product/${deal._id}`}
					  className="bg-surface-light rounded-2xl p-5 border border-border-light hover:border-warning-300 hover:shadow-xl transition-all duration-300 block">
					  <div className="flex gap-4 mb-4">
						<div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-background-muted">
						  {deal.image ? (
							<img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
						  ) : (
							<div className="w-full h-full flex items-center justify-center">
							  <Package className="w-8 h-8 text-primary-200" />
							</div>
						  )}
						</div>
						<div className="flex-1 min-w-0">
						  <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{deal.name}</h3>
						  <div className="flex items-center gap-2 mb-2">
							<span className="text-lg font-bold text-danger-600">{formatCurrency(deal.price, settings.currency)}</span>
							<span className="text-sm text-text-muted line-through">{formatCurrency(deal.originalPrice, settings.currency)}</span>
						  </div>
						  <span className="inline-block bg-danger-100 text-danger-600 px-2 py-0.5 rounded-lg text-xs font-semibold">
							{getDiscount(deal)}% OFF
						  </span>
						</div>
					  </div>
					  <div className="w-full bg-background-muted rounded-full h-2">
						<div className="bg-linear-to-r from-warning-500 to-danger-500 h-2 rounded-full"
						  style={{ width: `${Math.min(((deal.aggregateRating?.reviewCount || 0) / 100) * 100, 85)}%` }} />
					  </div>
					  <p className="text-xs text-text-muted mt-1">
						{deal.availability === 'InStock' ? 'In Stock' : deal.availability}
					  </p>
					</Link>
				  ))}
				</div>
			  </div>
			</section>
		  )}

		  {/* All Sale Items */}
		  <section className="py-16" id="deals">
			<div className="max-w-7xl mx-auto px-4">
			  <div className="flex items-center gap-3 mb-8">
				<Tag className="w-8 h-8 text-danger-500" />
				<h2 className="text-2xl lg:text-3xl font-bold text-text-primary">All Sale Items</h2>
				{mainSale.length > 0 && (
				  <span className="text-text-muted text-sm">({mainSale.length} items)</span>
				)}
			  </div>

			  {mainSale.length === 0 ? (
				<div className="text-center py-20 text-text-muted">
				  <Tag className="w-16 h-16 mx-auto mb-4 text-border" />
				  <p className="text-lg font-medium mb-2">No sale items yet</p>
				  <p className="text-sm mb-6">Add an "Original Price" to any product in the admin panel to put it on sale.</p>
				  <Link to="/shop"
					className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition">
					Browse All Products <ArrowRight className="w-4 h-4" />
				  </Link>
				</div>
			  ) : (
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
				  {mainSale.map((product) => {
					const inWishlist = isInWishlist(product._id);
					const discount = getDiscount(product);
					return (
					  <Link key={product._id} to={`/product/${product._id}`}
						className="group flex h-full flex-col bg-surface-light rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 border border-border-light hover:border-danger-200">
						<div className="relative overflow-hidden aspect-square bg-background-muted">
						  {product.image ? (
							<img src={product.image} alt={product.name}
							  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
						  ) : (
							<div className="w-full h-full bg-linear-to-br from-danger-50 to-accent-50 flex items-center justify-center">
							  <Package className="w-12 h-12 text-danger-200" />
							</div>
						  )}
						  <span className="absolute top-2 left-2 bg-danger-500 text-white px-2 py-1 rounded-md text-[10px] font-bold">
							-{discount}%
						  </span>
						  <button type="button" onClick={(e) => handleHeartClick(e, product)}
							className={`absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full transition-colors duration-200 ${
							  inWishlist ? 'bg-danger-500 text-white' : 'bg-white/95 text-text-primary hover:text-danger-500'
							}`}>
							<Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
						  </button>
						</div>
						<div className="p-3 flex flex-1 flex-col">
						  <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">{product.category} · {product.brand}</p>
						  <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
						  <div className="flex items-center gap-2">
							<span className="text-sm font-bold text-danger-600">{formatCurrency(product.price, settings.currency)}</span>
							<span className="text-xs text-text-muted line-through">{formatCurrency(product.originalPrice, settings.currency)}</span>
							<span className="ml-auto bg-danger-100 text-danger-600 px-1.5 py-0.5 rounded-md text-[10px] font-semibold">
							  -{discount}%
							</span>
						  </div>
						</div>
					  </Link>
					);
				  })}
				</div>
			  )}
			</div>
		  </section>
		</>
	  )}

	  {/* Promo Banner */}
	  <section className="py-16 bg-linear-to-br from-danger-500 via-danger-600 to-accent-500">
		<div className="max-w-7xl mx-auto px-4 text-center">
		  <Percent className="w-16 h-16 text-white/80 mx-auto mb-4" />
		  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
			Extra 10% Off on Orders Over Rs 200
		  </h2>
		  <p className="text-white/90 text-lg mb-8">
			Use code: <span className="font-bold bg-white/20 px-4 py-1 rounded-lg">EXTRA10</span>
		  </p>
		  <Link to="/shop"
			className="inline-flex items-center gap-2 bg-white text-danger-600 px-8 py-4 rounded-2xl font-semibold hover:bg-danger-50 transition-all duration-300 transform hover:scale-105">
			Shop Now
			<ArrowRight className="w-5 h-5" />
		  </Link>
		</div>
	  </section>
	</div>
  );
};

export default Sale;
