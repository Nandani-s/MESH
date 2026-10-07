import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, PackageSearch } from 'lucide-react';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import { productApi } from '../api/products';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productApi
      .getAll()
      .then((res) => setProducts(res.data || []))
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return products.filter((p) =>
      [p.name, p.brand, p.category, p.description]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [products, query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    const trimmed = String(q || '').trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
  };

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={query ? `Results for “${query}”` : 'Search Products'}
        subtitle={
          query
            ? `${results.length} product${results.length === 1 ? '' : 's'} found`
            : 'Type a product, brand or category to get started.'
        }
        breadcrumb={[{ label: 'Search' }]}
      >
        <form key={query} onSubmit={handleSubmit} className="mt-6 max-w-xl">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search for dresses, tops, brands..."
              className="w-full pl-12 pr-32 py-3.5 rounded-xl border border-border bg-surface-light focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </PageHeader>

      <Container className="py-10 lg:py-14">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-light rounded-2xl border border-border-light animate-pulse">
                <div className="aspect-[3/4] bg-background-muted rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-1/2 bg-background-muted rounded" />
                  <div className="h-4 w-3/4 bg-background-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-danger-500 py-16">{error}</p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {results.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <PackageSearch className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              {query ? 'No products matched your search' : 'Start searching'}
            </h2>
            <p className="text-text-secondary text-sm">
              {query
                ? 'Try a different keyword, or browse our categories to discover something you love.'
                : 'Look for a product name, brand or category.'}
            </p>
          </div>
        )}
      </Container>
    </>
  );
};

export default SearchPage;
