import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { otpApi } from '../api/otp';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ─── Step 1: Request OTP ───
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await otpApi.requestPasswordReset(email.trim().toLowerCase());
      setMessage(res.message || 'OTP sent to your email.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Reset Password ───
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await otpApi.resetPassword(
        email.trim().toLowerCase(),
        otp,
        newPassword
      );
      setMessage(res.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-primary-50 via-background to-accent-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface-light rounded-3xl shadow-2xl p-8 lg:p-10 border border-border-light">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Forgot Password
            </h1>
            <p className="text-text-muted text-sm">
              {step === 'email'
                ? 'Enter your email to receive a reset OTP'
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="bg-success-50 border border-success-200 text-success-700 p-3 rounded-xl mb-4 text-sm">
              {message}
            </div>
          )}

          {/* ─── STEP 1: EMAIL ─── */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 outline-none disabled:bg-background-muted"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>
            </form>
          )}

          {/* ─── STEP 2: RESET ─── */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-text-secondary mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                  disabled={loading}
                  className="w-full text-center text-2xl tracking-[0.5em] font-bold py-3.5 rounded-xl border-2 border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 outline-none disabled:bg-background-muted"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 outline-none disabled:bg-background-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || newPassword.length < 6}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setNewPassword('');
                  setError('');
                  setMessage('');
                }}
                disabled={loading}
                className="w-full text-sm text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Use a different email
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 pt-6 border-t border-border-light text-center">
            <Link to="/login" className="text-sm text-primary-500 hover:text-primary-600 transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}