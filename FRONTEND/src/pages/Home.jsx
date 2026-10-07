import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, Shield, RotateCcw, HeadphonesIcon,
  ArrowRight, Loader2, Package, Tag,
} from 'lucide-react';
import { categoryApi } from '../api/categories';
import { productApi } from '../api/products';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../utils/formatCurrency';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import ProductCard from '../components/ui/ProductCard';
import heroFallback from '../assets/hero.png';

const UNSPLASH = {
  deals: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&crop=faces&w=1200&h=750&q=80',
  newSeason: 'https://images.unsplash.com/photo-1747817230338-fd252147d627?auto=format&fit=crop&crop=faces&w=1200&h=900&q=80',
  categoryFallback: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
};

const PEXELS = {
  hero: 'https://images.pexels.com/photos/4676634/pexels-photo-4676634.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=1300',
  heroMd: 'https://images.pexels.com/photos/4676634/pexels-photo-4676634.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=960',
  heroWide: 'https://images.pexels.com/photos/4676634/pexels-photo-4676634.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1920&h=760',
};

const HeroImage = () => {
  const [src, setSrc] = useState(PEXELS.hero);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 flex items-center justify-center">
        <img src={heroFallback} alt="" className="opacity-40 w-2/3 object-contain" />
      </div>
    );
  }

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={PEXELS.heroWide} />
      <source media="(min-width: 640px)" srcSet={PEXELS.heroMd} />
      <img
        src={src}
        alt="Woman walking in the city wearing MESH fashion"
        className="w-full h-full object-cover object-center"
        onError={() => (src === PEXELS.hero ? setSrc(heroFallback) : setFailed(true))}
      />
    </picture>
  );
};

const Home = () => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => setCategories((res.data || []).filter((c) => c.status === 'active')))
      .catch(() => {})
      .finally(() => setIsLoadingCategories(false));

    productApi
      .getAll()
      .then((res) => {
        const all = res.data || [];
        const sorted = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sorted);
      })
      .catch(() => {})
      .finally(() => setIsLoadingProducts(false));
  }, []);

  const featured = products.slice(0, 4);

  const maxDiscount = products.reduce((max, p) => {
    if (p.originalPrice && p.originalPrice > p.price) {
      return Math.max(max, Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100));
    }
    return max;
  }, 0);

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description:
        settings.freeShippingThreshold > 0
          ? `On orders over ${formatCurrency(settings.freeShippingThreshold, settings.currency)}`
          : 'On all orders',
    },
    { icon: RotateCcw, title: 'Easy Returns', description: '30-day return window' },
    { icon: Shield, title: 'Secure Payment', description: 'COD, Khalti & eSewa' },
    { icon: HeadphonesIcon, title: '24/7 Support', description: 'Always here to help' },
  ];

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Full-bleed editorial hero ─── */}
      <section className="relative h-[540px] sm:h-[600px] lg:h-[680px] overflow-hidden bg-text-primary">
        <div className="absolute inset-0">
          <HeroImage />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-text-primary/90 via-text-primary/50 to-text-primary/5"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-text-primary/50 via-transparent to-text-primary/20"></div>

        <Container className="relative h-full flex items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-accent-400/40 bg-text-primary/30 backdrop-blur-sm text-accent-300 px-4 py-2 rounded-full text-sm font-semibold">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></span>
              New Collection {year}
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
              Elevate Your
              <span className="block text-accent-400">Everyday Style</span>
            </h1>

            <p className="mt-6 text-lg lg:text-xl text-white/75 max-w-xl leading-relaxed">
              Discover a curated collection of elegant fashion pieces designed to make you feel
              confident and beautiful every day.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="group bg-accent-500 hover:bg-accent-400 text-text-primary px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-accent-500/30 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/categories"
                className="border border-white/40 hover:border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                View Collection
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent-400" />
                {settings.freeShippingThreshold > 0
                  ? `Free shipping over ${formatCurrency(settings.freeShippingThreshold, settings.currency)}`
                  : 'Free shipping'}
              </span>
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-accent-400" />
                30-day returns
              </span>
              {settings.codEnabled && (
                <span className="inline-flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-400" />
                  Cash on delivery
                </span>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Trust bar — floats over the hero ─── */}
      <Container className="relative z-10 -mt-10 lg:-mt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-surface-light rounded-2xl p-5 lg:p-6 border border-border-light shadow-xl shadow-text-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 lg:w-12 lg:h-12 bg-primary-50 group-hover:bg-primary-500 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300">
                  <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm lg:text-base font-bold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-text-muted mt-0.5 truncate">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* ─── Shop by Category ─── */}
      <section className="pt-20 lg:pt-24 pb-20 lg:pb-24 bg-background">
        <Container>
          <SectionHeading
            eyebrow="Collections"
            title="Shop by Category"
            subtitle="Find your perfect style from our carefully curated collections"
          />

          {isLoadingCategories ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p>No categories available yet.</p>
              <Link to="/shop" className="text-primary-500 hover:underline mt-2 inline-block">
                Browse all products →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl ring-1 ring-border-light transition-all duration-300 transform hover:-translate-y-1 aspect-[4/5]"
                >
                  {category.image && !category.image.startsWith('http') ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                      <span className="text-7xl">{category.image}</span>
                    </div>
                  ) : category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={UNSPLASH.categoryFallback}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-accent-300 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-white/70">{category.productCount} Items</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Shop
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300"
            >
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="py-20 lg:py-24 bg-background-muted border-y border-border-light">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div className="min-w-0">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary-500 mb-3">
                Handpicked
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary mb-2 tracking-tight">
                Featured Products
              </h2>
              <p className="text-text-secondary">Fresh styles just landed for you</p>
            </div>
            <Link
              to="/shop"
              className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 border border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors group"
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-light rounded-2xl border border-border-light animate-pulse">
                  <div className="aspect-[3/4] bg-background-muted rounded-t-2xl" />
                  <div className="p-5 space-y-2">
                    <div className="h-3 w-1/2 bg-background-muted rounded" />
                    <div className="h-4 w-3/4 bg-background-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 text-text-muted bg-surface-light rounded-2xl border border-border-light">
              <Package className="w-16 h-16 mx-auto mb-4 text-border-strong" />
              <p className="text-lg font-medium mb-2">No products yet</p>
              <p className="text-sm">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 items-stretch gap-4 lg:gap-5">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ─── Deals Promo Banner ─── */}
      {maxDiscount > 0 && (
        <section className="bg-text-primary text-white overflow-hidden">
          <Container className="py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-accent-400">
                  <Tag className="w-4 h-4" />
                  Limited Time
                </span>
                <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  Deals worth
                  <span className="text-accent-400"> {maxDiscount}% off</span>
                </h2>
                <p className="text-white/60 text-lg max-w-md">
                  Hand-picked styles at their best price. When they're gone, they're gone.
                </p>
                <Link
                  to="/sale"
                  className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-text-primary px-7 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-accent-500/25 hover:-translate-y-0.5 group"
                >
                  Shop Deals
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden aspect-[16/10] ring-1 ring-white/10 bg-white/5">
                  <img
                    src={UNSPLASH.deals}
                    alt="Fashion editorial"
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="absolute -top-4 -left-4 bg-accent-500 text-text-primary font-extrabold text-lg px-4 py-2 rounded-xl shadow-xl rotate-[-4deg]">
                  −{maxDiscount}%
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ─── New Season Split ─── */}
      <section className="py-20 lg:py-24 bg-background">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border-light aspect-[4/3] bg-gradient-to-br from-primary-100 to-accent-100">
                <img
                  src={UNSPLASH.newSeason}
                  alt="New season tailoring"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-5 -right-4 bg-surface-light shadow-xl rounded-2xl px-5 py-4 ring-1 ring-border-light">
                <div className="text-xs text-text-muted font-medium">Just landed</div>
                <div className="text-sm font-bold text-primary-600">Autumn Edit</div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-5">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary-500">
                New Season
              </span>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                Tailored layers for
                <span className="text-primary-500"> cooler days</span>
              </h2>
              <p className="text-text-secondary text-lg">
                Blazers, knits and denim built to mix, match and last. Explore the pieces our stylists
                can't stop wearing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/new-arrivals"
                  className="group bg-primary-500 hover:bg-primary-600 text-white px-7 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-primary-500/25 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Shop New Arrivals
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/shop"
                  className="group border border-border-strong hover:border-primary-500 text-text-primary hover:text-primary-600 px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:bg-primary-50"
                >
                  Browse All
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
