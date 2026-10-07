// pages/admin/AdminWishlist.jsx
import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Users, Package, Loader2, AlertCircle, ImageOff } from 'lucide-react';
import { apiGet, ApiError } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminWishlist = () => {
  const { settings } = useSettings();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
	setIsLoading(true);
	setError('');
	try {
	  const res = await apiGet('/wishlist/analytics');
	  setData(res.data);
	} catch (err) {
	  setError(err instanceof ApiError ? err.message : 'Failed to load wishlist analytics.');
	} finally {
	  setIsLoading(false);
	}
  };

  useEffect(() => {
	fetchAnalytics();
  }, []);

  return (
	<div className="space-y-6">
	  {/* Header */}
	  <div>
		<h1 className="text-3xl font-bold text-text-primary">Wishlist Analytics</h1>
		<p className="text-text-muted mt-1">See which products customers are saving most</p>
	  </div>

	  {/* Loading */}
	  {isLoading && (
		<div className="flex items-center justify-center py-20">
		  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
		</div>
	  )}

	  {/* Error */}
	  {!isLoading && error && (
		<div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center justify-between">
		  <div className="flex items-center gap-3">
			<AlertCircle className="w-5 h-5 text-danger-500" />
			<p className="text-danger-600">{error}</p>
		  </div>
		  <button
			onClick={fetchAnalytics}
			className="px-3 py-1.5 text-sm border border-danger-300 rounded-lg hover:bg-danger-100 transition"
		  >
			Retry
		  </button>
		</div>
	  )}

	  {!isLoading && !error && data && (
		<>
		  {/* Summary Cards */}
		  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
			<div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-6 flex items-center gap-4">
			  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
				<Users className="w-6 h-6 text-accent-600" />
			  </div>
			  <div>
				<p className="text-text-muted text-sm">Total Wishlists</p>
				<p className="text-2xl font-bold text-text-primary">{data.totalWishlists}</p>
			  </div>
			</div>
			<div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-6 flex items-center gap-4">
			  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
				<Heart className="w-6 h-6 text-primary-600" />
			  </div>
			  <div>
				<p className="text-text-muted text-sm">Total Saved Items</p>
				<p className="text-2xl font-bold text-text-primary">{data.totalItems}</p>
			  </div>
			</div>
			<div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-6 flex items-center gap-4">
			  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
				<TrendingUp className="w-6 h-6 text-green-600" />
			  </div>
			  <div>
				<p className="text-text-muted text-sm">Avg Items / Wishlist</p>
				<p className="text-2xl font-bold text-text-primary">
				  {data.totalWishlists > 0
					? (data.totalItems / data.totalWishlists).toFixed(1)
					: '0'}
				</p>
			  </div>
			</div>
		  </div>

		  {/* Top Wishlisted Products */}
		  <div className="bg-surface-light rounded-xl shadow-sm border border-border-light">
			<div className="p-6 border-b border-border-light flex items-center gap-2">
			  <Package className="w-5 h-5 text-primary-500" />
			  <h2 className="text-lg font-semibold text-text-primary">Top Wishlisted Products</h2>
			</div>

			{data.topProducts.length === 0 ? (
			  <div className="text-center py-16 text-text-muted">
				<Heart className="w-12 h-12 mx-auto mb-4 text-border" />
				<p>No wishlist activity yet.</p>
			  </div>
			) : (
			  <div className="divide-y divide-border-light">
				{data.topProducts.map((item, index) => (
				  <div key={item.product._id} className="flex items-center gap-4 p-4 hover:bg-background-muted transition">
					{/* Rank */}
					<span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
					  index === 0 ? 'bg-yellow-100 text-yellow-700' :
					  index === 1 ? 'bg-gray-100 text-gray-600' :
					  index === 2 ? 'bg-orange-100 text-orange-600' :
					  'bg-background-muted text-text-muted'
					}`}>
					  {index + 1}
					</span>

					{/* Image */}
					<div className="w-12 h-12 rounded-lg overflow-hidden bg-background-muted flex items-center justify-center flex-shrink-0">
					  {item.product.image ? (
						<img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
					  ) : (
						<ImageOff className="w-5 h-5 text-text-muted" />
					  )}
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
					  <p className="font-medium text-text-primary truncate">{item.product.name}</p>
					  <p className="text-xs text-text-muted">{item.product.category} · {formatCurrency(item.product.price, settings.currency)}</p>
					</div>

					{/* Count */}
					<div className="flex items-center gap-1.5 flex-shrink-0">
					  <Heart className="w-4 h-4 text-accent-500 fill-accent-500" />
					  <span className="font-semibold text-text-primary">{item.count}</span>
					  <span className="text-xs text-text-muted">{item.count === 1 ? 'save' : 'saves'}</span>
					</div>
				  </div>
				))}
			  </div>
			)}
		  </div>
		</>
	  )}
	</div>
  );
};

export default AdminWishlist;
