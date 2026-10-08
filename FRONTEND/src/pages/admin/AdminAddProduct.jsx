import { useEffect, useState } from 'react';
import { ArrowLeft, ImageOff, Loader2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/categories';
import { ApiError } from '../../api/client';
import { productApi } from '../../api/products';

const CATEGORY_FALLBACK = ['Winter', 'Summer', 'Autumn', 'Spring'];

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(CATEGORY_FALLBACK);
  const [categoryError, setCategoryError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    availability: 'InStock',
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    categoryApi.getAll()
      .then((res) => {
        const activeCategories = (res.data || [])
          .filter((category) => category.status === 'active')
          .map((category) => category.name);
        if (activeCategories.length > 0) {
          setCategories(activeCategories);
        } else {
          setCategoryError('No active categories found. Add or activate a category before creating a product.');
        }
      })
      .catch((error) => {
        setCategoryError(error instanceof ApiError ? error.message : 'Failed to load categories.');
      });
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!imageFile) {
      setFormError('A product image is required.');
      return;
    }
    if (!formData.category) {
      setFormError('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') payload.append(key, value);
    });
    payload.append('image', imageFile);

    try {
      await productApi.create(payload);
      navigate('/admin/products');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const fieldClassName = 'w-full rounded-lg border border-border-light bg-surface-light px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="rounded-lg border border-border-light p-2 text-text-muted transition hover:bg-background-muted hover:text-text-primary"
          aria-label="Back to products"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Add Product</h1>
          <p className="mt-1 text-text-muted">Add a new item to your product catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border-light bg-surface-light p-5 shadow-sm sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-image">
            Product image <span className="text-danger-500">*</span>
          </label>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background-muted">
              {imagePreview
                ? <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover" />
                : <ImageOff className="h-7 w-7 text-text-muted" />}
            </div>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-name">Product name</label>
            <input id="product-name" name="name" value={formData.name} onChange={updateField} required className={fieldClassName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-brand">Brand</label>
            <input id="product-brand" name="brand" value={formData.brand} onChange={updateField} required className={fieldClassName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-category">Category</label>
            <select
              id="product-category"
              name="category"
              value={formData.category}
              onChange={updateField}
              required
              className={fieldClassName}
            >
              <option value="">Select category</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {categoryError && <p className="mt-2 text-xs text-text-muted">{categoryError}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-availability">Availability</label>
            <select
              id="product-availability"
              name="availability"
              value={formData.availability}
              onChange={updateField}
              className={fieldClassName}
            >
              <option value="InStock">In Stock</option>
              <option value="OutOfStock">Out of Stock</option>
              <option value="PreOrder">Pre-Order</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-price">Price</label>
            <input id="product-price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={updateField} required className={fieldClassName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-original-price">Original price <span className="font-normal text-text-muted">(optional)</span></label>
            <input id="product-original-price" name="originalPrice" type="number" min="0" step="0.01" value={formData.originalPrice} onChange={updateField} className={fieldClassName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-stock">Stock quantity</label>
            <input id="product-stock" name="stock" type="number" min="0" value={formData.stock} onChange={updateField} required className={fieldClassName} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={updateField}
              required
              className={fieldClassName}
            />
          </div>
        </div>

        {formError && (
          <div role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {formError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border-light pt-5 sm:flex-row sm:justify-end">
          <Link
            to="/admin/products"
            className="rounded-lg border border-border-light px-5 py-2.5 text-center text-sm font-medium text-text-secondary transition hover:bg-background-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isSubmitting ? 'Adding product…' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;
