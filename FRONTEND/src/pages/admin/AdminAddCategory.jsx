import { useState } from 'react';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/categories';
import { ApiError } from '../../api/client';

const AdminAddCategory = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'active',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      await categoryApi.create(formData);
      navigate('/admin/categories');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateName = (event) => {
    const name = event.target.value;
    setFormData((current) => ({
      ...current,
      name,
      slug: name.toLowerCase().trim().replace(/\s+/g, '-'),
    }));
  };

  const fieldClassName = 'w-full rounded-lg border border-border-light bg-surface-light px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500';
  const isImageUrl = /^https?:\/\//.test(formData.image);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/categories"
          className="rounded-lg border border-border-light p-2 text-text-muted transition hover:bg-background-muted hover:text-text-primary"
          aria-label="Back to categories"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Add Category</h1>
          <p className="mt-1 text-text-muted">Create a category for organizing your products</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border-light bg-surface-light p-5 shadow-sm sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="category-name">
            Category name
          </label>
          <input
            id="category-name"
            type="text"
            required
            value={formData.name}
            onChange={updateName}
            className={fieldClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="category-slug">
            Slug
          </label>
          <input
            id="category-slug"
            type="text"
            required
            value={formData.slug}
            onChange={(event) => setFormData((current) => ({ ...current, slug: event.target.value }))}
            className={fieldClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="category-image">
            Image URL or emoji
          </label>
          <input
            id="category-image"
            type="text"
            value={formData.image}
            onChange={(event) => setFormData((current) => ({ ...current, image: event.target.value }))}
            placeholder="https://… or an emoji"
            className={fieldClassName}
          />
          {formData.image && (
            <div className="mt-3">
              {isImageUrl
                ? <img src={formData.image} alt="Category preview" className="h-16 w-16 rounded-lg border border-border-light object-cover" />
                : <span className="text-3xl" aria-label="Category emoji preview">{formData.image}</span>}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="category-description">
            Description
          </label>
          <textarea
            id="category-description"
            rows="4"
            value={formData.description}
            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            className={fieldClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="category-status">
            Status
          </label>
          <select
            id="category-status"
            value={formData.status}
            onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
            className={fieldClassName}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {formError && (
          <div role="alert" className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-600">
            {formError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border-light pt-5 sm:flex-row sm:justify-end">
          <Link
            to="/admin/categories"
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
            {isSubmitting ? 'Creating category…' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddCategory;
