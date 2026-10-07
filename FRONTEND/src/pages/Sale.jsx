import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, Timer, Zap, Tag,
  Percent, Flame, ArrowRight, Loader2, Package
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
	  {/* Hero */}
	  <section className="relative bg-gradient-to-br from-danger-50 via-surface to-background-light py-20 overflow-hidden">
		<div className="max-w-7xl mx-auto px-4 relative z-10">
		  <div className="max-w-3xl">
			<div className="inline-flex items-center bg-danger-100 text-danger-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
			  <Flame className="w-4 h-4 mr-2" />
			  Limited Time Sale
			</div>
			<h1 className="text-4xl lg:text-7xl font-bold text-text-primary mb-6">
			  {saleProducts.length > 0
				? `Up to ${Math.max(...saleProducts.map(getDiscount))}% Off`
				: 'Sale Coming Soon'}
			</h1>
			<p className="text-lg text-text-secondary mb-8 max-w-xl">
			  {saleProducts.length > 0
				? `${saleProducts.length} products on sale — shop before time runs out!`
				: "Check back soon for our next big sale event."}
			</p>

			{/* Countdown */}
			<div className="flex gap-4 mb-8">
			  {[
				{ value: timeLeft.days, label: 'Days' },
				{ value: timeLeft.hours, label: 'Hours' },
				{ value: timeLeft.minutes, label: 'Mins' },
				{ value: timeLeft.seconds, label: 'Secs' },
			  ].map((item, index) => (
				<div key={index} className="text-center">
				  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-surface-light rounded-2xl shadow-lg flex items-center justify-center border border-border-light">
					<span className="text-2xl lg:text-3xl font-bold text-primary-600 tabular-nums">
					  {String(item.value).padStart(2, '0')}
					</span>
				  </div>
				  <span className="text-xs text-text-muted mt-2 block">{item.label}</span>
				</div>
			  ))}
			</div>

			<a href="#deals"
			  className="inline-flex items-center gap-2 bg-danger-500 hover:bg-danger-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-danger-500/25">
			  Shop Sale
			  <ArrowRight className="w-5 h-5" />
			</a>
		  </div>
		</div>
		<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-danger-100 rounded-full filter blur-3xl opacity-50" />
	  </section>

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
						<div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-background-muted">
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
						<div className="bg-gradient-to-r from-warning-500 to-danger-500 h-2 rounded-full"
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
				<div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
				  {mainSale.map((product) => {
					const inWishlist = isInWishlist(product._id);
					const discount = getDiscount(product);
					return (
					  <Link key={product._id} to={`/product/${product._id}`}
						className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-light hover:border-danger-200">
						<div className="relative overflow-hidden aspect-[3/4]">
						  {product.image ? (
							<img src={product.image} alt={product.name}
							  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
						  ) : (
							<div className="w-full h-full bg-gradient-to-br from-danger-50 to-accent-50 flex items-center justify-center">
							  <Package className="w-16 h-16 text-danger-200" />
							</div>
						  )}
						  <span className="absolute top-3 left-3 bg-danger-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
							-{discount}%
						  </span>
						  <button onClick={(e) => handleHeartClick(e, product)}
							className={`absolute top-3 right-3 p-2.5 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 ${
							  inWishlist ? 'bg-danger-500 text-white opacity-100' : 'bg-white/95 text-text-primary hover:text-danger-500'
							}`}>
							<Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
						  </button>
						  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							<span className="block w-full text-center bg-white text-text-primary py-2.5 rounded-xl font-semibold hover:bg-danger-500 hover:text-white transition-all text-sm">
							  Quick View
							</span>
						  </div>
						</div>
						<div className="p-4">
						  <p className="text-xs text-text-muted mb-1">{product.category} · {product.brand}</p>
						  <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
						  <div className="flex items-center gap-2">
							<span className="text-xl font-bold text-danger-600">{formatCurrency(product.price, settings.currency)}</span>
							<span className="text-sm text-text-muted line-through">{formatCurrency(product.originalPrice, settings.currency)}</span>
							<span className="ml-auto bg-danger-100 text-danger-600 px-2 py-0.5 rounded-lg text-xs font-semibold">
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
	  <section className="py-16 bg-gradient-to-br from-danger-500 via-danger-600 to-accent-500">
		<div className="max-w-7xl mx-auto px-4 text-center">
		  <Percent className="w-16 h-16 text-white/80 mx-auto mb-4" />
		  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
			Extra 10% Off on Orders Over $200
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
