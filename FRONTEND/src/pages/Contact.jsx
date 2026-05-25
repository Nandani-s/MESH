import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setErrors({ submit: 'Failed to send message. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Fashion Street', 'New York, NY 10001', 'United States'],
      action: {
        text: 'Get Directions',
        link: '#'
      }
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      action: {
        text: 'Call Now',
        link: 'tel:+15551234567'
      }
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['hello@femmefashion.com', 'support@femmefashion.com'],
      action: {
        text: 'Send Email',
        link: 'mailto:hello@femmefashion.com'
      }
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Closed'],
      action: {
        text: 'View All Hours',
        link: '#'
      }
    },
  ];

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unworn items with tags attached. Returns are free for orders over $50.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to over 100 countries worldwide. International shipping rates vary by location.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in your account dashboard.'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-50 via-surface to-background-light py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              Get in Touch
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              We'd Love to
              <span className="block bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Hear From You
              </span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Have a question, suggestion, or just want to say hello? 
              We're here to help and always happy to connect with our community.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-surface-light rounded-2xl p-6 border border-border-light hover:border-primary-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary-50 group-hover:bg-primary-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <info.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">{info.title}</h3>
                <div className="space-y-1 mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-text-muted">{detail}</p>
                  ))}
                </div>
                <a
                  href={info.action.link}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors group/link"
                >
                  {info.action.text}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 lg:py-28 bg-background-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                Send Us a Message
              </h2>
              <p className="text-text-secondary mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              {isSubmitted ? (
                <div className="bg-success-50 border border-success-200 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Message Sent!</h3>
                  <p className="text-text-secondary mb-6">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-success-500 hover:bg-success-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email Row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                          errors.name 
                            ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                            : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-danger-500">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                          errors.email 
                            ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                            : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-danger-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                        errors.subject 
                          ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                          : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                      }`}
                    />
                    {errors.subject && (
                      <p className="mt-1.5 text-xs text-danger-500">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none resize-none ${
                        errors.message 
                          ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                          : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                      }`}
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-danger-500">{errors.message}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl">
                      <p className="text-sm text-danger-600">{errors.submit}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map & FAQ */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-surface-light rounded-2xl overflow-hidden shadow-lg border border-border-light h-64 lg:h-80">
                <div className="w-full h-full bg-secondary-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">Map Integration</p>
                    <p className="text-sm text-text-muted">Google Maps would be embedded here</p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <HelpCircle className="w-6 h-6 text-primary-500" />
                  <h3 className="text-xl font-bold text-text-primary">Frequently Asked Questions</h3>
                </div>
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <details key={index} className="group bg-surface-light rounded-xl border border-border-light overflow-hidden">
                      <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary-50 transition-colors">
                        <span className="text-sm font-medium text-text-primary pr-8">{faq.question}</span>
                        <svg
                          className="w-5 h-5 text-text-muted group-open:rotate-180 transition-transform flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-5 pb-5">
                        <p className="text-sm text-text-muted leading-relaxed">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Mail className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Stay Connected
          </h2>
          <p className="text-white/90 text-lg mb-2 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive offers and updates
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300 mt-6"
          >
            Subscribe Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Contact;