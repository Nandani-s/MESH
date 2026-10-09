// pages/admin/AdminOrders.jsx
import { useState, useEffect } from 'react';
import {
  Search, Eye, ChevronDown, Package, User,
  MapPin, Phone, Mail, Loader2, AlertCircle, X
} from 'lucide-react';
import { apiGet, apiPut, ApiError } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatCurrency';
import ProductImage from '../../components/ui/ProductImage';

const STATUS_COLORS = {
  delivered: 'bg-success-100 text-success-800',
  shipped: 'bg-primary-100 text-primary-800',
  processing: 'bg-warning-100 text-warning-800',
  pending: 'bg-accent-100 text-accent-800',
  cancelled: 'bg-background-muted text-text-secondary',
};

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
	setIsLoading(true);
	setError('');
	try {
	  const res = await apiGet('/order');
	  setOrders(res.data || []);
	} catch (err) {
	  setError(err instanceof ApiError ? err.message : 'Failed to load orders.');
	} finally {
	  setIsLoading(false);
	}
  };

  useEffect(() => { Promise.resolve().then(fetchOrders); }, []);

  const updateStatus = async (orderId, orderStatus) => {
	setUpdatingId(orderId);
	try {
	  const res = await apiPut(`/order/${orderId}/status`, { orderStatus });
	  setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
	  if (selectedOrder?._id === orderId) setSelectedOrder(res.data);
	} catch (err) {
	  alert(err instanceof ApiError ? err.message : 'Failed to update status.');
	} finally {
	  setUpdatingId(null);
	}
  };

  const filteredOrders = orders.filter(order => {
	const name = order.user?.name || '';
	const email = order.user?.email || '';
	const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
	  email.toLowerCase().includes(searchTerm.toLowerCase()) ||
	  order._id.toLowerCase().includes(searchTerm.toLowerCase());
	const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
	return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
	.filter(o => o.orderStatus !== 'cancelled')
	.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
	<div className="space-y-6">
	  <div>
		<h1 className="text-3xl font-bold text-text-primary">Orders</h1>
		<p className="text-text-muted mt-1">Manage and track customer orders</p>
	  </div>

	  {/* Stats */}
	  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
		<div className="bg-surface-light rounded-xl border border-border-light p-4 lg:col-span-2">
		  <p className="text-sm text-text-muted">Total Revenue</p>
		  <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalRevenue, settings.currency)}</p>
		</div>
		{ORDER_STATUSES.map(s => (
		  <div key={s} className="bg-surface-light rounded-xl border border-border-light p-4">
			<p className="text-xs text-text-muted capitalize">{s}</p>
			<p className="text-xl font-bold text-text-primary">
			  {orders.filter(o => o.orderStatus === s).length}
			</p>
		  </div>
		))}
	  </div>

	  {/* Filters */}
	  <div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-4">
		<div className="flex flex-col sm:flex-row gap-4">
		  <div className="flex-1 relative">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
			<input type="text" placeholder="Search by order ID, name or email..."
			  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
			  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
		  </div>
		  <div className="relative">
			<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
			  className="px-4 py-2 pr-10 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary appearance-none">
			  <option value="all">All Status</option>
			  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
			</select>
			<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
		  </div>
		</div>
	  </div>

	  {isLoading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>}

	  {!isLoading && error && (
		<div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center gap-3">
		  <AlertCircle className="w-5 h-5 text-danger-500" />
		  <p className="text-danger-600">{error}</p>
		  <button onClick={fetchOrders} className="ml-auto px-3 py-1.5 text-sm border border-danger-300 rounded-lg">Retry</button>
		</div>
	  )}

	  {!isLoading && !error && filteredOrders.length === 0 && (
		<div className="text-center py-20 text-text-muted bg-surface-light rounded-xl border border-border-light">
		  <Package className="w-16 h-16 mx-auto mb-4 text-border" />
		  <p className="text-lg font-medium mb-2">{orders.length === 0 ? 'No orders yet' : 'No orders match your search'}</p>
		  <p className="text-sm">Orders will appear here once customers complete checkout.</p>
		</div>
	  )}

	  {!isLoading && !error && filteredOrders.length > 0 && (
		<div className="bg-surface-light rounded-xl shadow-sm border border-border-light overflow-hidden">
		  <div className="overflow-x-auto">
			<table className="w-full">
			  <thead className="bg-background-muted">
				<tr>
				  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
					<th key={h} className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
				  ))}
				</tr>
			  </thead>
			  <tbody className="divide-y divide-border-light">
				{filteredOrders.map((order) => (
				  <tr key={order._id} className="hover:bg-background-muted transition">
					<td className="px-6 py-4 text-sm font-mono text-primary-500">#{order._id.slice(-6).toUpperCase()}</td>
					<td className="px-6 py-4">
					  <p className="text-sm font-medium text-text-primary">{order.user?.name || 'N/A'}</p>
					  <p className="text-xs text-text-muted">{order.user?.email}</p>
					</td>
					<td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">
					  {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
					</td>
					<td className="px-6 py-4 text-sm text-text-muted">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
					<td className="px-6 py-4 text-sm font-semibold text-text-primary">{formatCurrency(order.totalAmount, settings.currency)}</td>
					<td className="px-6 py-4">
					  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
						order.paymentStatus === 'paid' ? 'bg-success-100 text-success-800' :
						order.paymentStatus === 'failed' ? 'bg-danger-100 text-danger-700' :
						'bg-warning-100 text-warning-800'
					  }`}>{order.paymentMethod} · {order.paymentStatus}</span>
					</td>
					<td className="px-6 py-4">
					  <select value={order.orderStatus} disabled={updatingId === order._id}
						onChange={(e) => updateStatus(order._id, e.target.value)}
						className={`px-3 py-1 text-xs rounded-full font-medium border-none focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending}`}>
						{ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
					  </select>
					</td>
					<td className="px-6 py-4">
					  <button onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
						className="p-1.5 text-text-muted hover:text-primary-500 transition">
						<Eye className="w-4 h-4" />
					  </button>
					</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		</div>
	  )}

	  {/* Detail Modal */}
	  {showDetails && selectedOrder && (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
		  <div className="bg-surface-light rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div className="sticky top-0 bg-surface-light p-6 border-b border-border-light flex justify-between items-center">
			  <h2 className="text-xl font-semibold text-text-primary">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
			  <button onClick={() => setShowDetails(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
			</div>
			<div className="p-6 space-y-6">
			  <div className="bg-background-muted rounded-lg p-4">
				<h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2"><User className="w-4 h-4" />Customer</h3>
				<div className="grid grid-cols-2 gap-3 text-sm">
				  <div><p className="text-xs text-text-muted">Name</p><p>{selectedOrder.user?.name}</p></div>
				  <div><p className="text-xs text-text-muted">Email</p><p className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedOrder.user?.email}</p></div>
				  <div><p className="text-xs text-text-muted">Phone</p><p className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedOrder.shippingAddress?.phone}</p></div>
				  <div><p className="text-xs text-text-muted">Payment</p><p>{selectedOrder.paymentMethod} · <span className={selectedOrder.paymentStatus === 'paid' ? 'text-success-700 font-medium' : 'text-warning-800 font-medium'}>{selectedOrder.paymentStatus}</span></p></div>
				</div>
			  </div>

			  {selectedOrder.shippingAddress && (
				<div className="bg-background-muted rounded-lg p-4">
				  <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" />Shipping Address</h3>
				  <p className="text-sm font-medium">{selectedOrder.shippingAddress.fullName}</p>
				  <p className="text-sm text-text-muted">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
				  {selectedOrder.shippingAddress.note && <p className="text-sm text-text-muted italic mt-1">Note: {selectedOrder.shippingAddress.note}</p>}
				</div>
			  )}

			  <div>
				<h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2"><Package className="w-4 h-4" />Items</h3>
				<div className="space-y-3">
				  {selectedOrder.items.map((item, i) => (
					<div key={i} className="flex items-center gap-3 border-b border-border-light pb-3">
					  <div className="w-12 h-12 rounded-lg overflow-hidden bg-background-muted flex-shrink-0">
						<ProductImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
					  </div>
					  <div className="flex-1 min-w-0">
						<p className="font-medium text-text-primary truncate">{item.name}</p>
						<p className="text-xs text-text-muted">Qty: {item.quantity} × {formatCurrency(item.price, settings.currency)}</p>
					  </div>
					  <p className="font-semibold flex-shrink-0">{formatCurrency(item.price * item.quantity, settings.currency)}</p>
					</div>
				  ))}
				</div>
				<div className="mt-4 pt-4 border-t border-border-light flex justify-between">
				  <p className="font-semibold">Total</p>
				  <p className="text-xl font-bold text-primary-600">{formatCurrency(selectedOrder.totalAmount, settings.currency)}</p>
				</div>
			  </div>

			  <div className="bg-background-muted rounded-lg p-4">
				<h3 className="font-semibold text-text-primary mb-3">Update Status</h3>
				<div className="flex gap-3">
				  <select value={selectedOrder.orderStatus}
					onChange={(e) => setSelectedOrder({ ...selectedOrder, orderStatus: e.target.value })}
					className="flex-1 px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary">
					{ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
				  </select>
				  <button disabled={updatingId === selectedOrder._id}
					onClick={() => updateStatus(selectedOrder._id, selectedOrder.orderStatus)}
					className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2">
					{updatingId === selectedOrder._id && <Loader2 className="w-4 h-4 animate-spin" />}
					Update
				  </button>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  )}
	</div>
  );
};

export default AdminOrders;
