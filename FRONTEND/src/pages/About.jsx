import PageHeader from '../components/ui/PageHeader';
import { Link } from 'react-router-dom';
import { 
  Heart, Star, Shield, Truck, Users, Award,
  ArrowRight, Quote
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const About = () => {
  const { settings } = useSettings();
  const storeName = settings.storeName || 'Our Store';
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
    { name: 'Sarah Johnson', role: 'Founder & CEO', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&h=640&q=85' },
    { name: 'Emily Chen', role: 'Creative Director', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&h=640&q=85' },
    { name: 'Maria Garcia', role: 'Head of Design', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&h=640&q=85' },
    { name: 'Lisa Thompson', role: 'Marketing Director', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=640&h=640&q=85' },
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
      <PageHeader
        eyebrow="Our Story"
        title="We Believe Fashion Is for Everyone"
        subtitle={`${storeName} was born from a simple idea: that every woman deserves to feel confident and beautiful in what she wears, without compromising on quality or breaking the bank.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        action={
          <div className="flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="bg-accent-500 hover:bg-accent-600 text-text-primary px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-border-strong hover:border-primary-500 text-text-primary px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:bg-primary-50"
            >
              Contact Us
            </Link>
          </div>
        }
      />

   

      {/* Our Story Section */}
      <section className="py-20 lg:py-28 bg-background-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative aspect-[6/7] overflow-hidden rounded-3xl bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&h=1400&q=85"
                  alt="A curated display of women's clothing in a fashion boutique"
                  loading="lazy"
                  className="h-full w-full object-cover"
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
                  What started as a small boutique has grown into a beloved 
                  global fashion brand. Our founder had a vision of creating a fashion 
                  destination where quality meets affordability.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Today, {storeName} curates collections from talented designers worldwide, bringing 
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

      {/* Our Values */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4">
              Our Values
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              These core principles guide everything we do at {storeName}
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

     

      {/* Team Section */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4">
              Meet Our Team
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              The passionate people behind {storeName}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-6 overflow-hidden rounded-2xl aspect-square shadow-lg bg-gradient-to-br from-primary-100 to-accent-100">
                  <img
                    src={member.photo}
                    alt={`${member.name}, ${member.role}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
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
            Join thousands of happy customers who have discovered their perfect style with {storeName}.
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