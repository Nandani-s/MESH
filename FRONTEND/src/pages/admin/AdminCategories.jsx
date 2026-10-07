// pages/admin/AdminCategories.jsx
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { categoryApi } from '../../api/categories';
import { ApiError } from '../../api/client';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [busyCategoryId, setBusyCategoryId] = useState(null);
  const [formData, setFormData] = useState({
	name: '',
	slug: '',
	description: '',
	image: '',
	status: 'active'
  });

  const fetchCategories = async () => {
	setIsLoading(true);
	setLoadError('');
	try {
	  const res = await categoryApi.getAll();
	  setCategories(res.data || []);
	} catch (error) {
	  setLoadError(error instanceof ApiError ? error.message : 'Failed to load categories.');
	} finally {
	  setIsLoading(false);
	}
  };

  useEffect(() => {
	Promise.resolve().then(fetchCategories);
  }, []);

  const handleOpenModal = (category = null) => {
	setFormError('');
	if (category) {
	  setEditingCategory(category);
	  setFormData({
		name: category.name,
		slug: category.slug,
		description: category.description || '',
		image: category.image || '',
		status: category.status
	  });
	} else {
	  setEditingCategory(null);
	  setFormData({ name: '', slug: '', description: '', image: '', status: 'active' });
	}
	setShowModal(true);
  };

  const handleCloseModal = () => {
	setShowModal(false);
	setEditingCategory(null);
	setFormError('');
	setFormData({ name: '', slug: '', description: '', image: '', status: 'active' });
  };

  const handleSubmit = async (e) => {
	e.preventDefault();
	setIsSubmitting(true);
	setFormError('');
	try {
	  if (editingCategory) {
		await categoryApi.update(editingCategory._id, formData);
	  } else {
		await categoryApi.create(formData);
	  }
	  handleCloseModal();
	  await fetchCategories();
	} catch (error) {
	  setFormError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
	} finally {
	  setIsSubmitting(false);
	}
  };

  const handleDelete = async (id) => {
	if (!window.confirm('Are you sure you want to delete this category?')) return;
	setBusyCategoryId(id);
	try {
	  await categoryApi.remove(id);
	  setCategories((prev) => prev.filter((cat) => cat._id !== id));
	} catch (error) {
	  alert(error instanceof ApiError ? error.message : 'Failed to delete category.');
	} finally {
	  setBusyCategoryId(null);
	}
  };

  const isImageUrl = (value) => typeof value === 'string' && /^https?:\/\//.test(value);

  const filteredCategories = categories.filter(category =>
	category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
	category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
	<div className="space-y-6">
	  {/* Header */}
	  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
		  <h1 className="text-3xl font-bold text-text-primary">Categories</h1>
		  <p className="text-text-muted mt-1">Manage your product categories</p>
		</div>
		<button
		  onClick={() => handleOpenModal()}
		  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
		>
		  <Plus className="w-4 h-4" />
		  Add Category
		</button>
	  </div>

	  {/* Search and Filter */}
	  <div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-4">
		<div className="flex flex-col sm:flex-row gap-4">
		  <div className="flex-1 relative">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
			<input
			  type="text"
			  placeholder="Search categories..."
			  value={searchTerm}
			  onChange={(e) => setSearchTerm(e.target.value)}
			  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
			/>
		  </div>
		
		</div>
	  </div>

	  {/* Loading */}
	  {isLoading && (
		<div className="flex items-center justify-center py-20">
		  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
		</div>
	  )}

	  {/* Error */}
	  {!isLoading && loadError && (
		<div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center justify-between">
		  <div className="flex items-center gap-3">
			<AlertCircle className="w-5 h-5 text-danger-500" />
			<p className="text-danger-600">{loadError}</p>
		  </div>
		  <button onClick={fetchCategories} className="px-3 py-1.5 text-sm border border-danger-300 rounded-lg hover:bg-danger-100 transition">
			Retry
		  </button>
		</div>
	  )}

	  {/* Empty */}
	  {!isLoading && !loadError && filteredCategories.length === 0 && (
		<div className="text-center py-20 text-text-muted">
		  {categories.length === 0 ? 'No categories yet — add your first one.' : 'No categories match your search.'}
		</div>
	  )}

	  {/* Categories Grid */}
	  {!isLoading && !loadError && filteredCategories.length > 0 && (
	  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{filteredCategories.map((category) => (
		  <div key={category._id} className="bg-surface-light rounded-xl shadow-sm border border-border-light hover:shadow-md transition">
			<div className="p-6">
			  <div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
				  {isImageUrl(category.image) ? (
					<img
					  src={category.image}
					  alt={category.name}
					  className="w-12 h-12 rounded-xl object-cover border border-border-light"
					/>
				  ) : (
					<div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-2xl">
					  {category.image || '📦'}
					</div>
				  )}
				  <div>
					<h3 className="font-semibold text-text-primary">{category.name}</h3>
					<p className="text-xs text-text-muted">{category.slug}</p>
				  </div>
				</div>
				<div className="flex gap-2">
				  <button
					onClick={() => handleOpenModal(category)}
					className="p-1.5 text-text-muted hover:text-primary-500 transition"
				  >
					<Edit className="w-4 h-4" />
				  </button>
				  <button
					onClick={() => handleDelete(category._id)}
					disabled={busyCategoryId === category._id}
					className="p-1.5 text-text-muted hover:text-danger-500 transition disabled:opacity-50"
				  >
					<Trash2 className="w-4 h-4" />
				  </button>
				</div>
			  </div>

			  <div className="space-y-3">
				<div className="flex items-center justify-between text-sm">
				  <span className="text-text-muted">Products</span>
				  <span className="font-semibold text-text-primary">{category.productCount}</span>
				</div>
				<div className="flex items-center justify-between">
				  <span className="text-text-muted">Status</span>
				  <span className={`px-2 py-1 text-xs rounded-full ${
					category.status === 'active'
					  ? 'bg-success-50 text-success-700'
					  : 'bg-danger-50 text-danger-700'
				  }`}>
					{category.status}
				  </span>
				</div>
			  </div>
			</div>
		  </div>
		))}
	  </div>
	  )}

	  {/* Add/Edit Modal */}
	  {showModal && (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
		  <div className="bg-surface-light rounded-xl shadow-xl max-w-md w-full">
			<div className="p-6 border-b border-border-light flex justify-between items-center">
			  <h2 className="text-xl font-semibold text-text-primary">
				{editingCategory ? 'Edit Category' : 'Add New Category'}
			  </h2>
			  <button onClick={handleCloseModal} className="text-text-muted hover:text-text-primary">
				<X className="w-5 h-5" />
			  </button>
			</div>
			<form onSubmit={handleSubmit} className="p-6 space-y-4">
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Category Name</label>
				<input
				  type="text"
				  required
				  value={formData.name}
				  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Slug</label>
				<input
				  type="text"
				  required
				  value={formData.slug}
				  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Image URL or Emoji</label>
				<input
				  type="text"
				  value={formData.image}
				  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
				  placeholder="https://… or an emoji"
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
				{formData.image && (
				  <div className="mt-2">
					{isImageUrl(formData.image) ? (
					  <img
						src={formData.image}
						alt="Category preview"
						className="w-16 h-16 rounded-lg object-cover border border-border-light"
					  />
					) : (
					  <span className="text-3xl">{formData.image}</span>
					)}
				  </div>
				)}
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Description</label>
				<textarea
				  rows="3"
				  value={formData.description}
				  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				/>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Status</label>
				<select
				  value={formData.status}
				  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary"
				>
				  <option value="active">Active</option>
				  <option value="inactive">Inactive</option>
				</select>
			  </div>
			  {formError && (
				<div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
				  <p className="text-sm text-danger-600">{formError}</p>
				</div>
			  )}
			  <div className="flex gap-3 pt-4">
				<button
				  type="button"
				  onClick={handleCloseModal}
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
				  {editingCategory ? 'Update' : 'Create'}
				</button>
			  </div>
			</form>
		  </div>
		</div>
	  )}
	</div>
  );
};

export default AdminCategories;