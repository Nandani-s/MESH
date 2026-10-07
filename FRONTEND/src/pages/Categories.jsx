import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle, Package } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { categoryApi } from '../api/categories';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryApi.getAll()
      .then((res) => setCategories((res.data || []).filter(c => c.status === 'active')))
      .catch(() => setError('Failed to load categories. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  // First 4 active categories shown as "featured" cards
  const featured = categories.slice(0, 4);

  const CategoryImage = ({ category, className = '', size = 'lg' }) => {
    const isUrl = category.image?.startsWith('http');
    const iconSize = size === 'lg' ? 'text-7xl' : 'text-5xl';
    return isUrl ? (
      <img src={category.image} alt={category.name}
        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${className}`} />
    ) : (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-100 ${className}`}>
        <span className={iconSize}>{category.image || '📦'}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background-light">
      <PageHeader
        eyebrow="Browse Categories"
        title="Shop by Category"
        subtitle="Explore our curated collections and find exactly what you're looking for"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Categories' }]}
      >
        {!isLoading && !error && (
          <p className="mt-4 text-sm text-text-muted">{categories.length} categories available</p>
        )}
      </PageHeader>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger-500" />
            <p className="text-danger-600">{error}</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && categories.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-text-muted">
          <Package className="w-16 h-16 mx-auto mb-4 text-border" />
          <p className="text-lg font-medium mb-2">No categories yet</p>
          <p className="text-sm mb-6">Check back soon!</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition">
            Browse All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!isLoading && !error && categories.length > 0 && (
        <>
          {/* Featured Categories */}
          {featured.length > 0 && (
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-8">Featured Categories</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featured.map((category) => (
                    <Link key={category._id}
                      to={`/category/${category.slug}`}
                      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="aspect-[4/5] overflow-hidden">
                        <CategoryImage category={category} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                        <p className="text-white/80 text-sm mb-3">{category.productCount} Items</p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-white">
                          Shop Now
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Categories */}
          <section className="py-16 bg-surface">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-8">All Categories</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <div key={category._id}
                    className="bg-surface-light rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-48 overflow-hidden">
                      <CategoryImage category={category} size="md" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-text-primary mb-2">{category.name}</h3>
                      {category.description ? (
                        <p className="text-text-muted text-sm mb-4 line-clamp-2">{category.description}</p>
                      ) : (
                        <p className="text-text-muted text-sm mb-4">Browse {category.name.toLowerCase()} collection</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted">{category.productCount} Items</span>
                        <Link to={`/category/${category.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
                          Browse
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Browse our complete collection or contact us for personalized advice
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop"
              className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold hover:bg-primary-50 transition-all duration-300 transform hover:scale-105">
              View All Products
            </Link>
            <Link to="/contact"
              className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;
