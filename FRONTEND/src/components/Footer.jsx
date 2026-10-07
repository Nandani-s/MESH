import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight,  } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { apiPost, ApiError } from '../api/client';
import logo from '../assets/logo.png';

const Facebook = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const Instagram = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const Twitter = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const Youtube = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 011.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418zM15.194 12l-5.196 3V9l5.196 3z" clipRule="evenodd" />
  </svg>
);

const FooterHeading = ({ children }) => (
  <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-white mb-4 inline-block">
    {children}
  </h3>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const [subscribeMsg, setSubscribeMsg] = useState('');
  const { settings } = useSettings();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('loading');
    try {
      const res = await apiPost('/subscribe', { email });
      setSubscribeStatus('success');
      setSubscribeMsg(res.message || 'Subscribed successfully!');
      setEmail('');
    } catch (error) {
      setSubscribeStatus('error');
      setSubscribeMsg(error instanceof ApiError ? error.message : 'Failed to subscribe. Please try again.');
    }
  };

  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Shop', path: '/shop' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Deals', path: '/sale' },
    { name: 'Categories', path: '/categories' },
  ];

  const customerService = [
    { name: 'Track Order', path: '/orders' },
    { name: 'Returns & Exchange', path: '/contact' },
    { name: 'FAQ', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Wishlist', path: '/wishlist' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-text-primary text-white">
      {/* Newsletter — slim inline row */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg lg:text-xl font-extrabold">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-white/50 text-sm">New arrivals and exclusive offers, no spam.</p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full md:w-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscribeStatus('');
                  }}
                  placeholder="Your email address"
                  className="w-full md:w-72 px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                  className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-text-primary text-sm font-bold rounded-lg transition-all duration-300 flex items-center gap-2 group whitespace-nowrap"
                >
                  {subscribeStatus === 'loading'
                    ? '...'
                    : subscribeStatus === 'success'
                      ? '✓ Done'
                      : 'Subscribe'}
                  {subscribeStatus !== 'loading' && subscribeStatus !== 'success' && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
              {subscribeMsg && (
                <p className={`text-xs mt-1.5 ${subscribeStatus === 'success' ? 'text-accent-400' : 'text-danger-400'}`}>
                  {subscribeMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo} alt="MESH" className="h-9 sm:h-10 w-auto object-contain" />
            </Link>
            <p className="text-white/55 text-sm leading-relaxed">
              Elegant, contemporary fashion curated to help you express your style with confidence.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 bg-white/5 text-white/70 hover:bg-accent-500 hover:text-text-primary rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/55 hover:text-accent-400 transition-colors duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <FooterHeading>Customer Service</FooterHeading>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/55 hover:text-accent-400 transition-colors duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <FooterHeading>Contact Us</FooterHeading>
            <ul className="space-y-2.5">
              {settings.storeAddress && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/55 leading-snug">
                    {settings.storeAddress}
                  </span>
                </li>
              )}
              {settings.storePhone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                  <a href={`tel:${settings.storePhone}`} className="text-sm text-white/55 hover:text-white transition-colors">
                    {settings.storePhone}
                  </a>
                </li>
              )}
              {settings.storeEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-accent-400 shrink-0" />
                  <a href={`mailto:${settings.storeEmail}`} className="text-sm text-white/55 hover:text-white transition-colors">
                    {settings.storeEmail}
                  </a>
                </li>
              )}
              {!settings.storeAddress && !settings.storePhone && !settings.storeEmail && (
                <li className="text-sm text-white/55">
                  Contact info not set yet.
                  <br />
                  <Link to="/admin/settings" className="text-accent-400 hover:text-accent-300 underline">
                    Update in Settings
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-white/45 flex items-center justify-center text-center">
            © {new Date().getFullYear()} Sunflower🌻. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
