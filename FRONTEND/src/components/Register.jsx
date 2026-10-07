import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone,
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d+\s()-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone.trim(),
        password: formData.password,
      });
      // Registration does not log the user in (backend doesn't set a cookie
      // on /register), so send them to login to sign in with their new account.
      navigate('/login', { state: { justRegistered: true } });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.data?.message === 'User already exists') {
          setErrors({ email: 'An account with this email already exists' });
        } else {
          setErrors({ submit: error.message || 'Registration failed. Please try again.' });
        }
      } else {
        setErrors({ submit: 'Unable to reach the server. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-danger-500', 'bg-warning-500', 'bg-warning-400', 'bg-success-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-surface to-background-light flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
       

        {/* Register Card */}
        <div className="bg-surface-light rounded-3xl shadow-2xl p-8 lg:p-10 border border-border-light">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-2xl mb-4">
              <UserPlus className="w-8 h-8 text-accent-500" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
            <p className="text-text-muted">
              Join Femme Fashion and start shopping
            </p>
          </div>

          {/* Social Register Button */}
          <div className="mb-6">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-border rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-text-secondary font-medium group-hover:text-primary-600">Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface-light text-text-muted">or register with email</span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                    errors.name 
                      ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                      : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-danger-500 rounded-full"></span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                    errors.email 
                      ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                      : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-danger-500 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                    errors.phone 
                      ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                      : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-danger-500 rounded-full"></span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password & Confirm Password - Single Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                      errors.password 
                        ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                        : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-danger-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${
                      errors.confirmPassword 
                        ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20' 
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-success-400 focus:border-success-500'
                        : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-success-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-danger-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="bg-background-muted rounded-xl p-4">
                <div className="flex gap-1.5 mb-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        level <= passwordStrength
                          ? strengthColors[passwordStrength - 1]
                          : 'bg-border'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-text-muted mb-3">
                  Password strength: <span className="font-semibold text-text-primary">{strengthLabels[passwordStrength - 1] || 'Very Weak'}</span>
                </p>
                
                {/* Password Requirements */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    {formData.password.length >= 8 ? (
                      <Check className="w-3.5 h-3.5 text-success-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-text-muted" />
                    )}
                    <span className={formData.password.length >= 8 ? 'text-success-600' : 'text-text-muted'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? (
                      <Check className="w-3.5 h-3.5 text-success-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-text-muted" />
                    )}
                    <span className={/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'text-success-600' : 'text-text-muted'}>
                      Uppercase & lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {/\d/.test(formData.password) ? (
                      <Check className="w-3.5 h-3.5 text-success-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-text-muted" />
                    )}
                    <span className={/\d/.test(formData.password) ? 'text-success-600' : 'text-text-muted'}>
                      At least one number
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => {
                    setAgreeToTerms(e.target.checked);
                    if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                  }}
                  className="w-4 h-4 mt-1 rounded border-border text-primary-500 focus:ring-primary-500/20 cursor-pointer"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  I agree to the{' '}
                  <Link to="/terms" className="text-accent-500 hover:text-accent-600 underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-accent-500 hover:text-accent-600 underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-danger-500 rounded-full"></span>
                  {errors.terms}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl">
                <p className="text-sm text-danger-600 text-center">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-300 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-500/25 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <UserPlus className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-500 hover:text-accent-600 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;