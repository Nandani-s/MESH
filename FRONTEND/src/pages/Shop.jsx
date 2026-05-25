import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingBag,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  Grid3X3,
  List
} from 'lucide-react';

const Shop = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const products = [
    {
      id: 1,
      name: 'Floral Summer Dress',
      category: 'Dresses',
      price: 89.99,
      originalPrice: 129.99,
      rating: 4.8,
      reviews: 124,
      image: '/api/placeholder/300/400',
      isNew: true,
      discount: 30,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['#FFB5B5', '#FFD1D1', '#FFE8E8']
    },
    {
      id: 2,
      name: 'Elegant Evening Gown',
      category: 'Dresses',
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.9,
      reviews: 89,
      image: '/api/placeholder/300/400',
      isNew: true,
      discount: 25,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#2C3E50', '#34495E', '#1A1A1A']
    },
    {
      id: 3,
      name: 'Casual Linen Top',
      category: 'Tops',
      price: 49.99,
      rating: 4.7,
      reviews: 256,
      image: '/api/placeholder/300/400',
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#FFFFFF', '#F5F5DC', '#E8D5B7']
    },
    {
      id: 4,
      name: 'Designer Handbag',
      category: 'Accessories',
      price: 199.99,
      originalPrice: 249.99,
      rating: 4.9,
      reviews: 67,
      image: '/api/placeholder/300/400',
      isNew: false,
      discount: 20,
      sizes: ['One Size'],
      colors: ['#8B4513', '#000000', '#800020']
    },
    {
      id: 5,
      name: 'Silk Blouse',
      category: 'Tops',
      price: 79.99,
      rating: 4.6,
      reviews: 189,
      image: '/api/placeholder/300/400',
      isNew: true,
      sizes: ['S', 'M', 'L'],
      colors: ['#FF69B4', '#FFB6C1', '#FFF0F5']
    },
    {
      id: 6,
      name: 'Wide Leg Pants',
      category: 'Bottoms',
      price: 69.99,
      originalPrice: 89.99,
      rating: 4.5,
      reviews: 143,
      image: '/api/placeholder/300/400',
      isNew: false,
      discount: 22,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#000000', '#808080', '#C0C0C0']
    },
    {
      id: 7,
      name: 'Embroidered Kurta',
      category: 'Ethnic Wear',
      price: 129.99,
      rating: 4.8,
      reviews: 98,
      image: '/api/placeholder/300/400',
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#FF4500', '#FF6347', '#FF7F50']
    },
    {
      id: 8,
      name: 'Denim Jacket',
      category: 'Outerwear',
      price: 99.99,
      originalPrice: 139.99,
      rating: 4.7,
      reviews: 312,
      image: '/api/placeholder/300/400',
      isNew: false,
      discount: 28,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#4169E1', '#000080', '#87CEEB']
    },
    {
      id: 9,
      name: 'Summer Sandals',
      category: 'Footwear',
      price: 59.99,
      rating: 4.4,
      reviews: 178,
      image: '/api/placeholder/300/400',
      isNew: true,
      sizes: ['36', '37', '38', '39', '40'],
      colors: ['#D2691E', '#FFD700', '#C0C0C0']
    },
    {
      id: 10,
      name: 'Pearl Necklace',
      category: 'Accessories',
      price: 149.99,
      rating: 4.9,
      reviews: 45,
      image: '/api/placeholder/300/400',
      isNew: false,
      sizes: ['One Size'],
      colors: ['#FFFFFF', '#FFF5EE', '#FFE4E1']
    },
    {
      id: 11,
      name: 'Maxi Dress',
      category: 'Dresses',
      price: 109.99,
      rating: 4.7,
      reviews: 201,
      image: '/api/placeholder/300/400',
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#9370DB', '#BA55D3', '#DDA0DD']
    },
    {
      id: 12,
      name: 'Leather Belt',
      category: 'Accessories',
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.3,
      reviews: 89,
      image: '/api/placeholder/300/400',
      isNew: false,
      discount: 33,
      sizes: ['S', 'M', 'L'],
      colors: ['#8B4513', '#000000', '#654321']
    },
  ];

  const categories = ['Dresses', 'Tops', 'Bottoms', 'Ethnic Wear', 'Outerwear', 'Accessories', 'Footwear'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
  const colors = [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Gold', hex: '#FFD700' },
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const filteredProducts = products
    .filter(product => 
      selectedCategories.length === 0 || selectedCategories.includes(product.category)
    )
    .filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

  return (
    <div className="min-h-screen bg-background-light">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-secondary-50 via-surface to-background-light py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">Shop All</h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Discover our complete collection of fashion pieces curated just for you
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-16 lg:top-20 z-40 bg-surface-light border-b border-border-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-background-muted hover:bg-secondary-100 rounded-xl transition-colors text-sm font-medium text-text-secondary"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0) && (
                  <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedCategories.length + selectedSizes.length + selectedColors.length}
                  </span>
                )}
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm text-text-muted">
                <span>{filteredProducts.length} Products</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-background-muted hover:bg-secondary-100 px-4 py-2 pr-10 rounded-xl text-sm font-medium text-text-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="hidden lg:flex items-center gap-1 bg-background-muted rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-500' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-500' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-40 space-y-6">
                {/* Categories */}
                <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
                  <h3 className="font-semibold text-text-primary mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20"
                        />
                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
                  <h3 className="font-semibold text-text-primary mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">${priceRange[0]}</span>
                      <span className="text-text-muted">${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
                  <h3 className="font-semibold text-text-primary mb-4">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedSizes.includes(size)
                            ? 'bg-primary-500 text-white'
                            : 'bg-background-muted text-text-secondary hover:bg-secondary-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="bg-surface-light rounded-2xl p-5 border border-border-light">
                  <h3 className="font-semibold text-text-primary mb-4">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => toggleColor(color.name)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColors.includes(color.name)
                            ? 'border-primary-500 scale-110 shadow-lg'
                            : 'border-border hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filter Modal */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-light shadow-2xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-text-primary">Filters</h2>
                    <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-background-muted rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Same filter content as desktop sidebar */}
                  <div className="space-y-6">
                    {/* Categories */}
                    <div>
                      <h3 className="font-semibold text-text-primary mb-4">Categories</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label key={category} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20"
                            />
                            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Add other filter sections... */}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-surface-light rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-light hover:border-primary-200"
                  >
                    <div className="relative overflow-hidden aspect-[3/4]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {product.isNew && (
                        <span className="absolute top-3 left-3 bg-accent-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                          New
                        </span>
                      )}
                      {product.discount && (
                        <span className="absolute top-3 right-3 bg-danger-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                          -{product.discount}%
                        </span>
                      )}
                      <button className="absolute top-14 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg">
                        <Heart className="w-5 h-5 text-text-primary hover:text-danger-500 transition-colors" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-full bg-white text-text-primary py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 text-sm">
                          Quick Add
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-text-muted mb-1">{product.category}</p>
                      <h3 className="font-semibold text-text-primary mb-2 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-warning-400 text-warning-400'
                                  : 'text-border'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-text-muted">({product.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-text-muted line-through">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group flex gap-6 bg-surface-light rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border-light hover:border-primary-200 p-4"
                  >
                    <div className="w-32 h-40 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-text-muted mb-1">{product.category}</p>
                        <h3 className="font-semibold text-text-primary mb-1">{product.name}</h3>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-warning-400 text-warning-400'
                                    : 'text-border'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-text-muted">({product.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-primary-600">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-text-muted line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load More */}
            <div className="mt-12 text-center">
              <button className="px-8 py-3 border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl font-semibold transition-all duration-300">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;