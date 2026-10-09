// pages/admin/AdminProducts.jsx
import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  ImageOff,
  Star,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/products';
import { categoryApi } from '../../api/categories';
import { ApiError } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatCurrency';
import ProductImage from '../../components/ui/ProductImage';

// Fallback list shown while categories are loading or if the fetch fails.
// Keep this in sync with your Categories page as a last resort only.
const CATEGORY_FALLBACK = ['Winter', 'Summer', 'Autumn', 'Spring'];
const PRODUCTS_PER_PAGE = 10;

const AVAILABILITY_OPTIONS = [
  { value: 'InStock', label: 'In Stock' },
  { value: 'OutOfStock', label: 'Out of Stock' },
  { value: 'PreOrder', label: 'Pre-Order' },
];

const emptyFormData = {
  name: '',
  description: '',
  brand: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: '',
  availability: 'InStock',
};

const AdminProducts = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(CATEGORY_FALLBACK);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [busyProductId, setBusyProductId] = useState(null); // delete/toggle in flight

  const fetchProducts = async () => {
	setIsLoading(true);
	setLoadError('');
	try {
	  const [productsRes, categoriesRes] = await Promise.all([
		productApi.getAll(),
		categoryApi.getAll(),
	  ]);
	  setProducts(productsRes.data || []);
	  const activeCategories = (categoriesRes.data || [])
		.filter((c) => c.status === 'active')
		.map((c) => c.name);
	  if (activeCategories.length > 0) setCategories(activeCategories);
	} catch (error) {
	  setLoadError(error instanceof ApiError ? error.message : 'Failed to load products.');
	} finally {
	  setIsLoading(false);
	}
  };

  const refreshCategories = async () => {
	try {
	  const res = await categoryApi.getAll();
	  const activeCategories = (res.data || [])
		.filter((c) => c.status === 'active')
		.map((c) => c.name);
	  if (activeCategories.length > 0) setCategories(activeCategories);
	} catch {
	  return;
	}
  };

  useEffect(() => {
	Promise.resolve().then(fetchProducts);
  }, []);

  const handleOpenModal = (product = null) => {
	setFormError('');
	setImageFile(null);
	refreshCategories(); // always pull the latest categories when modal opens
	if (product) {
	  setEditingProduct(product);
	  setFormData({
		name: product.name,
		description: product.description,
		brand: product.brand,
		category: product.category,
		price: product.price,
		originalPrice: product.originalPrice || '',
		stock: product.stock,
		availability: product.availability || 'InStock',
	  });
	  setImagePreview(product.image);
	} else {
	  setEditingProduct(null);
	  setFormData(emptyFormData);
	  setImagePreview(null);
	}
	setShowModal(true);
  };

  const handleImageChange = (e) => {
	const file = e.target.files?.[0];
	if (!file) return;
	setImageFile(file);
	setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
	e.preventDefault();

	if (!formData.name || !formData.description || !formData.brand || !formData.category || !formData.price || !formData.stock) {
	  setFormError('Please fill in all required fields.');
	  return;
	}
	if (!editingProduct && !imageFile) {
	  setFormError('A product image is required.');
	  return;
	}
	if (formData.originalPrice && Number(formData.originalPrice) <= Number(formData.price)) {
	  setFormError('Original price must be greater than the sale price.');
	  return;
	}

	setIsSubmitting(true);
	setFormError('');

	const fd = new FormData();
	fd.append('name', formData.name);
	fd.append('description', formData.description);
	fd.append('brand', formData.brand);
	fd.append('category', formData.category);
	fd.append('price', formData.price);
	fd.append('originalPrice', formData.originalPrice);
	fd.append('stock', formData.stock);
	fd.append('availability', formData.availability);
	if (imageFile) {
	  fd.append('image', imageFile);
	}

	try {
	  if (editingProduct) {
		const response = await productApi.update(editingProduct._id, fd);
		if (response.notification) {
		  window.alert(response.notification.message);
		}
	  } else {
		await productApi.create(fd);
	  }
	  setShowModal(false);
	  await fetchProducts();
	} catch (error) {
	  setFormError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
	} finally {
	  setIsSubmitting(false);
	}
  };

  const handleDelete = async (id) => {
	if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
	  return;
	}
	setBusyProductId(id);
	try {
	  await productApi.remove(id);
	  setProducts((prev) => prev.filter((p) => p._id !== id));
	} catch (error) {
	  alert(error instanceof ApiError ? error.message : 'Failed to delete product.');
	} finally {
	  setBusyProductId(null);
	}
  };

  const toggleAvailability = async (product) => {
	const nextAvailability = product.availability === 'OutOfStock' ? 'InStock' : 'OutOfStock';
	setBusyProductId(product._id);
	try {
	  const res = await productApi.updateFields(product._id, { availability: nextAvailability });
	  setProducts((prev) => prev.map((p) => (p._id === product._id ? res.data : p)));
	} catch (error) {
	  alert(error instanceof ApiError ? error.message : 'Failed to update availability.');
	} finally {
	  setBusyProductId(null);
	}
  };

  const filteredProducts = products.filter((product) => {
	const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
	const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
	return matchesSearch && matchesCategory;
  });
  const pageCount = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(pageCount, 1));
  const pageProducts = filteredProducts.slice(
	(visiblePage - 1) * PRODUCTS_PER_PAGE,
	visiblePage * PRODUCTS_PER_PAGE
  );

  const availabilityBadge = (availability) => {
	if (availability === 'InStock') return 'bg-success-100 text-success-800';
	if (availability === 'OutOfStock') return 'bg-danger-100 text-danger-700';
	return 'bg-warning-100 text-warning-800'; // PreOrder
  };

  return (
	<div className="space-y-6">
	  {/* Header */}
	  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
		  <h1 className="text-3xl font-bold text-text-primary">Products</h1>
		  <p className="text-text-muted mt-1">Manage your product inventory</p>
		</div>
		<Link
		  to="/admin/products/new"
		  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
		>
		  <Plus className="w-4 h-4" />
		  Add Product
		</Link>
	  </div>

	  {/* Search and Filter */}
	  <div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-4">
		<div className="flex flex-col sm:flex-row gap-4">
		  <div className="flex-1 relative">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
			<input
			  type="text"
			  placeholder="Search products..."
			  value={searchTerm}
			  onChange={(e) => {
				setSearchTerm(e.target.value);
				setCurrentPage(1);
			  }}
			  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
			/>
		  </div>
		  <select
			value={categoryFilter}
			onChange={(e) => {
			  setCategoryFilter(e.target.value);
			  setCurrentPage(1);
			}}
			className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
		  >
			<option value="All">All Categories</option>
			{categories.map((cat) => (
			  <option key={cat} value={cat}>{cat}</option>
			))}
		  </select>
		</div>
	  </div>

	  {/* Loading state */}
	  {isLoading && (
		<div className="flex items-center justify-center py-20">
		  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
		</div>
	  )}

	  {/* Error state */}
	  {!isLoading && loadError && (
		<div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center justify-between">
		  <div className="flex items-center gap-3">
			<AlertCircle className="w-5 h-5 text-danger-500" />
			<p className="text-danger-600">{loadError}</p>
		  </div>
		  <button
			onClick={fetchProducts}
			className="px-3 py-1.5 text-sm border border-danger-300 rounded-lg hover:bg-danger-100 transition"
		  >
			Retry
		  </button>
		</div>
	  )}

	  {/* Empty state */}
	  {!isLoading && !loadError && filteredProducts.length === 0 && (
		<div className="text-center py-20 text-text-muted">
		  {products.length === 0 ? 'No products yet — add your first one.' : 'No products match your search.'}
		</div>
	  )}

	  {/* Products List */}
	  {!isLoading && !loadError && filteredProducts.length > 0 && (
		<div className="overflow-hidden rounded-xl border border-border-light bg-surface-light shadow-sm">
		  <div className="overflow-x-auto">
			<table className="w-full min-w-[850px] text-left">
			  <thead className="bg-background-muted text-xs uppercase tracking-wider text-text-muted">
				<tr>
				  <th className="px-5 py-3 font-semibold">Product</th>
				  <th className="px-5 py-3 font-semibold">Category</th>
				  <th className="px-5 py-3 font-semibold">Price</th>
				  <th className="px-5 py-3 font-semibold">Stock</th>
				  <th className="px-5 py-3 font-semibold">Availability</th>
				  <th className="px-5 py-3 font-semibold">Rating</th>
				  <th className="px-5 py-3 text-right font-semibold">Actions</th>
				</tr>
			  </thead>
			  <tbody className="divide-y divide-border-light">
				{pageProducts.map((product) => (
				  <tr key={product._id} className="transition-colors hover:bg-background-muted/60">
					<td className="px-5 py-4">
					  <div className="flex min-w-0 items-center gap-3">
						<div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-background-muted flex items-center justify-center">
						  <ProductImage src={product.image} alt={product.name} className="h-full w-full object-cover" />
						</div>
						<div className="min-w-0">
						  <p className="max-w-xs truncate font-semibold text-text-primary">{product.name}</p>
						  <p className="max-w-xs truncate text-xs text-text-muted">{product.brand}</p>
						</div>
					  </div>
					</td>
					<td className="px-5 py-4 text-sm text-text-secondary">{product.category}</td>
					<td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-text-primary">
					  {formatCurrency(product.price, settings.currency)}
					</td>
					<td className={`whitespace-nowrap px-5 py-4 text-sm font-medium ${product.stock < 10 ? 'text-danger-700' : 'text-text-primary'}`}>
					  {product.stock} units
					</td>
					<td className="px-5 py-4">
					  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${availabilityBadge(product.availability)}`}>
						{AVAILABILITY_OPTIONS.find((option) => option.value === product.availability)?.label || product.availability}
					  </span>
					</td>
					<td className="whitespace-nowrap px-5 py-4">
					  <div className="flex items-center gap-1 text-sm text-text-primary">
						<Star className="h-3.5 w-3.5 fill-current text-warning-500" />
						{product.aggregateRating?.reviewCount
						  ? `${product.aggregateRating.ratingValue.toFixed(1)} (${product.aggregateRating.reviewCount})`
						  : <span className="text-text-muted">No ratings</span>}
					  </div>
					</td>
					<td className="px-5 py-4">
					  <div className="flex justify-end gap-1">
						<button
						  type="button"
						  onClick={() => toggleAvailability(product)}
						  disabled={busyProductId === product._id}
						  className={`rounded-lg p-2 transition disabled:opacity-50 ${
							product.availability === 'InStock'
							  ? 'text-success-700 hover:bg-success-50'
							  : 'text-danger-600 hover:bg-danger-50'
						  }`}
						  title={product.availability === 'InStock' ? 'Mark out of stock' : 'Mark in stock'}
						  aria-label={product.availability === 'InStock' ? `Mark ${product.name} out of stock` : `Mark ${product.name} in stock`}
						>
						  {product.availability === 'InStock' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
						</button>
						<button
						  type="button"
						  onClick={() => handleOpenModal(product)}
						  className="rounded-lg p-2 text-text-muted transition hover:bg-primary-50 hover:text-primary-600"
						  title="Edit product"
						  aria-label={`Edit ${product.name}`}
						>
						  <Edit className="h-4 w-4" />
						</button>
						<button
						  type="button"
						  onClick={() => handleDelete(product._id)}
						  disabled={busyProductId === product._id}
						  className="rounded-lg p-2 text-text-muted transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
						  title="Delete product"
						  aria-label={`Delete ${product.name}`}
						>
						  <Trash2 className="h-4 w-4" />
						</button>
					  </div>
					</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		</div>
	  )}

	  {!isLoading && !loadError && filteredProducts.length > 0 && (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		  <p className="text-sm text-text-muted" aria-live="polite">
			Showing {(visiblePage - 1) * PRODUCTS_PER_PAGE + 1}–
			{Math.min(visiblePage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
		  </p>
		  {pageCount > 1 && (
			<nav className="flex items-center justify-center gap-2" aria-label="Product list pagination">
			  <button
				type="button"
				onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
				disabled={visiblePage === 1}
				className="inline-flex items-center gap-1 rounded-lg border border-border-light px-3 py-2 text-sm text-text-primary transition hover:bg-background-muted disabled:cursor-not-allowed disabled:opacity-50"
			  >
				<ChevronLeft className="h-4 w-4" />
				Previous
			  </button>
			  <span className="px-2 text-sm text-text-muted" aria-current="page">
				Page {visiblePage} of {pageCount}
			  </span>
			  <button
				type="button"
				onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
				disabled={visiblePage === pageCount}
				className="inline-flex items-center gap-1 rounded-lg border border-border-light px-3 py-2 text-sm text-text-primary transition hover:bg-background-muted disabled:cursor-not-allowed disabled:opacity-50"
			  >
				Next
				<ChevronRight className="h-4 w-4" />
			  </button>
			</nav>
		  )}
		</div>
	  )}

	  {/* Add/Edit Product Modal */}
	  {showModal && (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
		  <div className="bg-surface-light rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<div className="sticky top-0 bg-surface-light p-6 border-b border-border-light flex justify-between items-center">
			  <h2 className="text-xl font-semibold text-text-primary">
				{editingProduct ? 'Edit Product' : 'Add New Product'}
			  </h2>
			  <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
				<X className="w-5 h-5" />
			  </button>
			</div>
			<form onSubmit={handleSubmit} className="p-6 space-y-4">
			  {/* Image */}
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">
				  Product Image {!editingProduct && <span className="text-danger-500">*</span>}
				</label>
				<div className="flex items-center gap-4">
				  <div className="w-20 h-20 rounded-lg overflow-hidden bg-background-muted flex items-center justify-center flex-shrink-0">
					{imagePreview ? (
					  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
					) : (
					  <ImageOff className="w-6 h-6 text-text-muted" />
					)}
				  </div>
				  <div className="flex-1">
					<input
					  type="file"
					  accept="image/*"
					  onChange={handleImageChange}
					  className="w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
					/>
					{editingProduct && (
					  <p className="text-xs text-text-muted mt-1">Leave empty to keep the current image</p>
					)}
				  </div>
				</div>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Product Name</label>
				<input
				  type="text"
				  required
				  value={formData.name}
				  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Brand</label>
				<input
				  type="text"
				  required
				  value={formData.brand}
				  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
			  </div>
			  <div className="grid grid-cols-2 gap-4">
				<div>
				  <label className="block text-sm font-medium text-text-primary mb-2">Price ($)</label>
				  <input
					type="number"
					step="0.01"
					min="0"
					required
					value={formData.price}
					onChange={(e) => setFormData({ ...formData, price: e.target.value })}
					className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				  />
				</div>
				<div>
				  <label className="block text-sm font-medium text-text-primary mb-2">Stock</label>
				  <input
					type="number"
					min="0"
					required
					value={formData.stock}
					onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
					className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				  />
				</div>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Category</label>
				<select
				  required
				  value={formData.category}
				  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				>
				  <option value="">Select Category</option>
				  {categories.map((cat) => (
					<option key={cat} value={cat}>{cat}</option>
				  ))}
				</select>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Description</label>
				<textarea
				  rows="3"
				  required
				  value={formData.description}
				  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Availability</label>
				<select
				  value={formData.availability}
				  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				>
				  {AVAILABILITY_OPTIONS.map((opt) => (
					<option key={opt.value} value={opt.value}>{opt.label}</option>
				  ))}
				</select>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">
				  Original Price ($) <span className="text-xs text-text-muted font-normal">— optional, before discount</span>
				</label>
				<input
				  type="number"
				  step="0.01"
				  min="0"
				  placeholder="Leave empty if not on sale"
				  value={formData.originalPrice || ''}
				  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
				<p className="mt-1 text-xs text-text-muted">
				  Set this above the current price to start a sale and notify active newsletter subscribers. Leave it empty to end the sale.
				</p>
			  </div>

			  {formError && (
				<div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
				  <p className="text-sm text-danger-600">{formError}</p>
				</div>
			  )}

			  <div className="flex gap-3 pt-4">
				<button
				  type="button"
				  onClick={() => setShowModal(false)}
				  disabled={isSubmitting}
				  className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-background-muted transition disabled:opacity-50"
				>
				  Cancel
				</button>
				<button
				  type="submit"
				  disabled={isSubmitting}
				  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
				>
				  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
				  {editingProduct ? 'Update' : 'Create'}
				</button>
			  </div>
			</form>
		  </div>
		</div>
	  )}
	</div>
  );
};

export default AdminProducts;
