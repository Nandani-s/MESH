import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Categories = () => {
  const categories = [
    {
      name: 'Dresses',
      image: '/api/placeholder/400/500',
      items: 124,
      description: 'From casual to formal, find your perfect dress',
      featured: true,
      subcategories: ['Summer Dresses', 'Evening Gowns', 'Maxi Dresses', 'Midi Dresses', 'Mini Dresses']
    },
    {
      name: 'Tops',
      image: '/api/placeholder/400/500',
      items: 236,
      description: 'Stylish tops for every occasion',
      featured: true,
      subcategories: ['Blouses', 'T-Shirts', 'Tank Tops', 'Tunics', 'Crop Tops']
    },
    {
      name: 'Bottoms',
      image: '/api/placeholder/400/500',
      items: 89,
      description: 'Trendy bottoms to complete your look',
      featured: false,
      subcategories: ['Jeans', 'Trousers', 'Skirts', 'Shorts', 'Palazzos']
    },
    {
      name: 'Ethnic Wear',
      image: '/api/placeholder/400/500',
      items: 156,
      description: 'Traditional elegance with modern touch',
      featured: true,
      subcategories: ['Kurtas', 'Sarees', 'Lehengas', 'Salwar Suits', 'Anarkali']
    },
    {
      name: 'Outerwear',
      image: '/api/placeholder/400/500',
      items: 67,
      description: 'Layer up in style',
      featured: false,
      subcategories: ['Jackets', 'Coats', 'Blazers', 'Cardigans', 'Shrugs']
    },
    {
      name: 'Accessories',
      image: '/api/placeholder/400/500',
      items: 312,
      description: 'Complete your outfit with perfect accessories',
      featured: true,
      subcategories: ['Bags', 'Jewelry', 'Scarves', 'Belts', 'Hats']
    },
    {
      name: 'Footwear',
      image: '/api/placeholder/400/500',
      items: 98,
      description: 'Step out in style',
      featured: false,
      subcategories: ['Heels', 'Flats', 'Sandals', 'Boots', 'Sneakers']
    },
    {
      name: 'Sale',
      image: '/api/placeholder/400/500',
      items: 145,
      description: 'Great deals on your favorite styles',
      featured: true,
      subcategories: ['Clearance', 'Seasonal Sale', 'Flash Deals', 'Bundle Offers'],
      isSale: true
    },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-50 via-surface to-background-light py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Browse Categories
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary mb-4">
              Shop by Category
            </h1>
            <p className="text-lg text-text-secondary">
              Explore our curated collections and find exactly what you're looking for
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-8">Featured Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.filter(cat => cat.featured).map((category, index) => (
              <Link
                key={index}
                to={`/category/${category.name.toLowerCase().replace(' ', '-')}`}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                  <p className="text-white/80 text-sm mb-3">{category.items} Items</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-white">
                    Shop Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
                {category.isSale && (
                  <div className="absolute top-4 right-4 bg-danger-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    SALE
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Categories Grid */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-8">All Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-surface-light rounded-2xl overflow-hidden border border-border-light hover:border-primary-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {category.isSale && (
                    <div className="absolute top-3 right-3 bg-danger-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-text-primary mb-2">{category.name}</h3>
                  <p className="text-text-muted text-sm mb-4">{category.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-background-muted text-text-secondary rounded-lg text-xs font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">{category.items} Items</span>
                    <Link
                      to={`/category/${category.name.toLowerCase().replace(' ', '-')}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
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

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Browse our complete collection or contact us for personalized styling advice
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold hover:bg-primary-50 transition-all duration-300 transform hover:scale-105"
            >
              View All Products
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;