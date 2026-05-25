import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Star, 
  Shield, 
  Truck, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle,
  Quote
} from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, value: '50K+', label: 'Happy Customers' },
    { icon: Star, value: '4.8', label: 'Average Rating' },
    { icon: Truck, value: '100+', label: 'Countries Shipped' },
    { icon: Award, value: '15+', label: 'Years Experience' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Every decision we make starts with our customers in mind. Your satisfaction is our priority.'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'We source only the finest materials and work with skilled artisans to ensure premium quality.'
    },
    {
      icon: Star,
      title: 'Sustainable Fashion',
      description: 'Committed to ethical sourcing and sustainable practices for a better tomorrow.'
    },
    {
      icon: Users,
      title: 'Inclusive Style',
      description: 'Fashion for everyone. We celebrate diversity in all its beautiful forms.'
    },
  ];

  const team = [
    { name: 'Sarah Johnson', role: 'Founder & CEO', image: '/api/placeholder/200/200' },
    { name: 'Emily Chen', role: 'Creative Director', image: '/api/placeholder/200/200' },
    { name: 'Maria Garcia', role: 'Head of Design', image: '/api/placeholder/200/200' },
    { name: 'Lisa Thompson', role: 'Marketing Director', image: '/api/placeholder/200/200' },
  ];

  const milestones = [
    { year: '2010', title: 'Founded', description: 'Started as a small boutique in New York' },
    { year: '2013', title: 'Online Store', description: 'Launched our e-commerce platform' },
    { year: '2016', title: 'Global Shipping', description: 'Expanded to 100+ countries worldwide' },
    { year: '2020', title: 'Sustainability', description: 'Launched eco-friendly collection' },
    { year: '2024', title: '50K Customers', description: 'Reached 50,000 happy customers milestone' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-50 via-surface to-background-light py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4 mr-2 fill-primary-500 text-primary-500" />
              Our Story
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              We Believe Fashion is
              <span className="block bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                for Everyone
              </span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              Femme Fashion was born from a simple idea: that every woman deserves to feel 
              confident and beautiful in what she wears, without compromising on quality or breaking the bank.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/shop"
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25 flex items-center gap-2"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="border-2 border-border-strong hover:border-primary-500 text-text-primary px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-primary-50"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-primary-500" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-text-primary mb-2">{stat.value}</div>
                <div className="text-text-muted font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 lg:py-28 bg-background-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/api/placeholder/600/700"
                  alt="Our Story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-surface-light shadow-2xl rounded-2xl p-6 border border-border-light">
                <Quote className="w-8 h-8 text-primary-400 mb-2" />
                <p className="text-sm text-text-secondary italic mb-2">
                  "Fashion is not just about clothes, it's about expressing who you are."
                </p>
                <p className="text-sm font-semibold text-primary-600">- Sarah Johnson, Founder</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold text-text-primary">
                Our Journey
              </h2>
              <div className="space-y-4">
                <p className="text-text-secondary leading-relaxed">
                  What started as a small boutique in New York City in 2010 has grown into a beloved 
                  global fashion brand. Our founder, Sarah Johnson, had a vision of creating a fashion 
                  destination where quality meets affordability.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Today, Femme Fashion curates collections from talented designers worldwide, bringing 
                  you the latest trends while maintaining our commitment to quality and sustainability.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Every piece in our collection is carefully selected to ensure it meets our high 
                  standards of craftsmanship, style, and comfort. We believe that when you look good, 
                  you feel good – and that confidence is priceless.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                {['Sustainable', 'Inclusive', 'Quality-Focused', 'Trend-Setting'].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4">
              Our Values
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              These core principles guide everything we do at Femme Fashion
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-surface-light hover:bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-border-light hover:border-primary-200"
              >
                <div className="w-16 h-16 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
                  <value.icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{value.title}</h3>
                <p className="text-text-muted leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28 bg-background-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4">
              Our Milestones
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Key moments that shaped our journey
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:-translate-x-px"></div>
              
              {/* Timeline Items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex items-start gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Timeline Dot */}
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary-500 rounded-full transform -translate-x-1/2 border-4 border-background-light z-10"></div>
                    
                    {/* Content */}
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                      <div className="bg-surface-light rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-border-light">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-3">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-bold text-text-primary mb-2">{milestone.title}</h3>
                        <p className="text-text-muted">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4">
              Meet Our Team
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              The passionate people behind Femme Fashion
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-6 overflow-hidden rounded-2xl aspect-square shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <div className="flex gap-3">
                      <a href="#" className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                      </a>
                      <a href="#" className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">{member.name}</h3>
                <p className="text-text-muted">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Elevate Your Style?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who have discovered their perfect style with Femme Fashion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Start Shopping
            </Link>
            <Link
              to="/register"
              className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;