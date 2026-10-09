import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, X, Search, Grid3X3, List, Loader2, Package, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi } from '../api/products';
import { categoryApi } from '../api/categories';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import ProductImage from '../components/ui/ProductImage';

const AVAILABILITY_OPTIONS = [
  { value: 'InStock', label: 'In Stock' },
  { value: 'OutOfStock', label: 'Out of Stock' },
  { value: 'PreOrder', label: 'Pre-Order' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

const PAGE_SIZE = 12;

const FilterSidebar = ({ categories, products, selectedCategories, toggleCategory,
  selectedAvailability, toggleAvailability, maxPrice, setMaxPrice,
  clearFilters, activeFilterCount, settings
}) => {
  const priceCeiling = Math.ceil(Math.max(...products.map(p => p.price), 1000) / 100) * 100;
  return (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <div className="flex items-center justify-between border-b border-border-light pb-3">
          <h3 className="text-sm font-bold text-text-primary">Category</h3>
          {selectedCategories.length > 0 && (
            <span className="text-xs text-primary-600">{selectedCategories.length} selected</span>
          )}
        </div>
        <div className="divide-y divide-border-light">
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer group py-2.5">
              <input type="checkbox" checked={selectedCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
                className="w-3.5 h-3.5 rounded border-border text-primary-500 focus:ring-primary-500/20 shrink-0" />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-2 min-w-0 flex-1">
                {cat.image && /^((https?:)?\/\/|data:image\/|\/)/i.test(cat.image) ? (
                  <img
                	src={cat.image}
                	alt=""
                	className="w-6 h-6 rounded object-cover border border-border-light shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 rounded bg-secondary-50 flex items-center justify-center shrink-0 text-xs" aria-hidden="true">
                    {cat.image || '•'}
                  </span>
                )}
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="text-xs text-text-muted shrink-0">({cat.productCount})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-bold text-text-primary border-b border-border-light pb-3">Availability</h3>
        <div className="space-y-3 pt-3">
          {AVAILABILITY_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={selectedAvailability.includes(value)}
                onChange={() => toggleAvailability(value)}
                className="w-3.5 h-3.5 rounded border-border text-primary-500 focus:ring-primary-500/20" />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-center justify-between border-b border-border-light pb-3">
          <h3 className="text-sm font-bold text-text-primary">Price</h3>
          <span className="text-sm font-semibold text-primary-600">{formatCurrency(maxPrice, settings.currency)}</span>
        </div>
        <div className="pt-5">
          <input type="range" min={0} max={priceCeiling}
            step={50} value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary-500 cursor-pointer" />
          <div className="flex justify-between text-xs text-text-muted mt-2">
            <span>{formatCurrency(0, settings.currency)}</span>
            <span>{formatCurrency(priceCeiling, settings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button onClick={clearFilters}
          className="w-full py-2.5 border border-danger-300 text-danger-500 hover:bg-danger-50 rounded-lg text-sm font-medium transition-colors">
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [page, setPage] = useState(1);
  const [cartStatus, setCartStatus] = useState({});

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([productApi.getAll(), categoryApi.getAll()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories((catRes.data || []).filter(c => c.status === 'active'));
        const highest = Math.max(...(prodRes.data || []).map(p => p.price), 1000);
        setMaxPrice(Math.ceil(highest / 100) * 100);
      })
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleHeartClick = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    await toggleWishlist(product);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (product.availability === 'OutOfStock' || cartStatus[product._id] === 'adding') return;

    setCartStatus((prev) => ({ ...prev, [product._id]: 'adding' }));
    const added = await addToCart(product._id);
    setCartStatus((prev) => ({ ...prev, [product._id]: added ? 'added' : 'error' }));
    window.setTimeout(() => {
      setCartStatus((prev) => ({ ...prev, [product._id]: 'idle' }));
    }, 1800);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const toggleAvailability = (val) => {
    setSelectedAvailability(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) result = result.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCategories.length > 0)
      result = result.filter(p => selectedCategories.includes(p.category));
    if (selectedAvailability.length > 0)
      result = result.filter(p => selectedAvailability.includes(p.availability));
    result = result.filter(p => p.price <= maxPrice);

    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [products, searchTerm, selectedCategories, selectedAvailability, maxPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedAvailability([]);
    setSearchTerm('');
    setSortBy('newest');
    setPage(1);
  };

  const activeFilterCount = selectedCategories.length + selectedAvailability.length;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        eyebrow="Catalog"
        title="Shop"
        subtitle={isLoading ? 'Loading products…' : `Showing ${filteredProducts.length} of ${products.length} products`}
        breadcrumb={[{ label: 'Shop' }]}
        action={
          <div className="hidden sm:flex items-center gap-2 text-sm text-text-muted">
            <Grid3X3 className="w-4 h-4" />
            {filteredProducts.length} items
          </div>
        }
      />

      <Container className="py-6 lg:py-8">
        {/* Controls bar */}
        <div className="bg-surface-light border border-border-light rounded-xl p-3 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 lg:max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-background text-text-primary text-sm" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                activeFilterCount > 0 ? 'bg-primary-500 text-white border-primary-500' : 'border-border-light hover:bg-background-muted'
              }`}>
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && <span className="text-xs font-bold">{activeFilterCount}</span>}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:block text-xs text-text-muted">
              {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
            </span>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-background text-text-primary text-sm">
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className="flex gap-1 border border-border-light rounded-lg overflow-hidden">
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
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-light pt-3">
            <span className="text-xs font-semibold text-text-muted">Active filters:</span>
            {selectedCategories.map((category) => (
              <button key={category} onClick={() => toggleCategory(category)}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100">
                {category}<X className="h-3 w-3" />
              </button>
            ))}
            {selectedAvailability.map((availability) => (
              <button key={availability} onClick={() => toggleAvailability(availability)}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100">
                {AVAILABILITY_OPTIONS.find((option) => option.value === availability)?.label}<X className="h-3 w-3" />
              </button>
            ))}
            <button onClick={clearFilters} className="ml-auto text-xs font-semibold text-danger-500 hover:text-danger-600">
              Clear all
            </button>
          </div>
        )}
        </div>

        <div className="flex items-start gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 self-start">
            <FilterSidebar
              categories={categories} products={products}
              selectedCategories={selectedCategories} toggleCategory={toggleCategory}
              selectedAvailability={selectedAvailability} toggleAvailability={toggleAvailability}
              maxPrice={maxPrice} setMaxPrice={(v) => { setMaxPrice(v); setPage(1); }}
              clearFilters={clearFilters} activeFilterCount={activeFilterCount} settings={settings}
            />
          </aside>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-2xl overflow-y-auto overscroll-contain">
                <div className="p-5 sm:p-6">
                  <div className="sticky top-0 z-10 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 mb-5 flex items-center justify-between border-b border-border-light bg-background/95 backdrop-blur">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-600">Refine</p>
                      <h2 className="text-lg font-bold text-text-primary">Filters</h2>
                    </div>
                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-background-muted rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterSidebar
                    categories={categories} products={products}
                    selectedCategories={selectedCategories} toggleCategory={toggleCategory}
                    selectedAvailability={selectedAvailability} toggleAvailability={toggleAvailability}
                    maxPrice={maxPrice} setMaxPrice={(v) => { setMaxPrice(v); setPage(1); }}
                    clearFilters={clearFilters} activeFilterCount={activeFilterCount} settings={settings}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1 min-w-0">
            {isLoading && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            )}

            {!isLoading && error && (
              <div className="text-center py-20 text-text-muted">
                <p className="text-danger-500">{error}</p>
              </div>
            )}

            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-20 text-text-muted">
                <Package className="w-16 h-16 mx-auto mb-4 text-border" />
                <p className="text-lg font-medium mb-2">No products found</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-4 text-primary-500 hover:underline text-sm">
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!isLoading && !error && filteredProducts.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                    {visibleProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleProducts.map((product) => {
                      const inWishlist = isInWishlist(product._id);
                      return (
                        <Link key={product._id} to={`/product/${product._id}`}
                          className="group flex gap-4 bg-surface-light rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-border-light hover:border-primary-200 p-3 sm:p-4">
                          <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-background-muted">
                            <ProductImage src={product.image} alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                            <div>
                              <p className="text-xs text-text-muted mb-1">{product.category} · {product.brand}</p>
                              <h3 className="font-semibold text-text-primary mb-1 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                              <p className="text-sm text-text-muted line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-primary-600">{formatCurrency(product.price, settings.currency)}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <>
                                    <span className="text-sm text-text-muted line-through">{formatCurrency(product.originalPrice, settings.currency)}</span>
                                    <span className="text-xs bg-danger-100 text-danger-600 px-1.5 py-0.5 rounded-full font-semibold">
                                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleHeartClick(e, product)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    inWishlist ? 'bg-danger-50 text-danger-500' : 'hover:bg-background-muted text-text-muted hover:text-danger-500'
                                  }`}>
                                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                                </button>
                                <span className={`text-xs px-3 py-1.5 rounded-full ${
                                  product.availability === 'InStock' ? 'bg-success-100 text-success-700' :
                                  product.availability === 'OutOfStock' ? 'bg-danger-100 text-danger-700' :
                                  'bg-warning-100 text-warning-700'
                                }`}>
                                  {product.availability === 'InStock' ? 'In Stock' :
                                   product.availability === 'OutOfStock' ? 'Sold Out' : 'Pre-Order'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleAddToCart(e, product)}
                                  disabled={product.availability === 'OutOfStock' || cartStatus[product._id] === 'adding'}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-border-strong"
                                >
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                  {cartStatus[product._id] === 'adding' ? 'Adding...' :
                                    cartStatus[product._id] === 'added' ? 'Added' :
                                    product.availability === 'OutOfStock' ? 'Sold out' : 'Add to cart'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <nav
                    aria-label="Product pages"
                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className="inline-flex items-center gap-1 rounded-lg border border-border-light px-3 py-2 text-sm text-text-primary transition-colors hover:bg-background-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={safePage === pageNumber ? 'page' : undefined}
                        className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium transition-colors ${
                          safePage === pageNumber
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : 'border-border-light text-text-primary hover:bg-background-muted'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className="inline-flex items-center gap-1 rounded-lg border border-border-light px-3 py-2 text-sm text-text-primary transition-colors hover:bg-background-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                )}
                <p className="mt-4 text-center text-sm text-text-muted" aria-live="polite">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} products
                </p>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Shop;
