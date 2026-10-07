import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const loggedInUser = await login(formData.email, formData.password);
      // If RequireAdmin redirected here, send them back to where they were headed.
      // Otherwise, admins land on the dashboard by default; everyone else lands on home.
      const fallback = loggedInUser?.role === 'admin' ? '/admin' : '/';
      const redirectTo = location.state?.from?.pathname || fallback;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        // Map known backend messages to the field they relate to; anything
        // else falls back to a generic submit-level error.
        if (error.status === 400 && error.data?.message === 'user not found') {
          setErrors({ email: 'No account found with this email' });
        } else if (error.status === 401) {
          setErrors({ password: 'Incorrect password' });
        } else {
          setErrors({ submit: error.message || 'Unable to sign in. Please try again.' });
        }
      } else {
        setErrors({ submit: 'Unable to reach the server. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-surface to-background-light flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        

        {/* Login Card */}
        <div className="bg-surface-light rounded-3xl shadow-2xl p-8 lg:p-10 border border-border-light">
          {/* Logo & Header */}
          <div className="text-center mb-8">
           
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h1>
            <p className="text-text-muted">
              Sign in to your account to continue
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
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
              <span className="px-4 bg-surface-light text-text-muted">or sign in with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-danger-500 rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Submit Error */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500/20 cursor-pointer"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  Remember me
                </span>
              </label>
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
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* ─────────── OTP LOGIN OPTION ─────────── */}
          <div className="mt-6 pt-6 border-t border-border-light">
            <p className="text-center text-text-muted text-sm mb-3">
              Or sign in without password
            </p>
            <Link
              to="/login-otp"
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-primary-500 text-primary-500 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300"
            >
              <Mail className="w-5 h-5" />
              Login with OTP
            </Link>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-6 text-text-muted text-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary-400" />
              Secure Shopping
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary-400" />
              SSL Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;