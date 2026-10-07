import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { otpApi } from '../api/otp';
import { useAuth } from '../context/AuthContext';

export default function LoginOtp() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuth();

  // ─── State ───
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 boxes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0); // seconds
  const showResend = resendTimer <= 0;

  // 6 input refs for auto-focus
  const inputRefs = useRef([]);

  // ─── Redirect if already logged in ───
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // ─── Resend countdown timer ───
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // ─── Step 1: Request OTP ───
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await otpApi.requestLoginOtp(email.trim().toLowerCase());
      setMessage(res.message || 'OTP sent to your email. Valid for 10 minutes.');
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
      // Focus first OTP box
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ───
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await otpApi.verifyLoginOtp(email.trim().toLowerCase(), otpString);
      // Update auth context
      if (setUser) setUser(res.data);
      setMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
      // Clear OTP on failure
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ───
  const handleResend = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await otpApi.requestLoginOtp(email.trim().toLowerCase());
      setMessage(res.message || 'New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input Handlers ───
  const handleOtpChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next box
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace → focus previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = ['', '', '', '', '', ''];
    pasted.split('').forEach((digit, i) => (newOtp[i] = digit));
    setOtp(newOtp);
    // Focus last filled or next empty
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // ─── Reset to email step ───
  const handleChangeEmail = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setMessage('');
    setResendTimer(60);
  };

  // ─── Render ───
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background-muted px-4 py-12">
      <div className="max-w-md w-full bg-surface-light p-8 rounded-3xl shadow-2xl border border-border-light">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">MESH</h1>
          <h2 className="text-xl font-semibold mb-1">
            {step === 'email' ? 'Login with OTP' : 'Verify OTP'}
          </h2>
          <p className="text-text-muted text-sm">
            {step === 'email'
              ? 'Enter your email to receive a one-time password'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-600 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="bg-success-50 border border-success-200 text-success-700 p-3 rounded-xl mb-4 text-sm">
            {message}
          </div>
        )}

        {/* ─── STEP 1: EMAIL ─── */}
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
                className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-background-muted transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ─── STEP 2: OTP ─── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-background-muted transition"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            {/* Resend section */}
            <div className="text-center text-sm">
              {showResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-primary-600 font-medium hover:underline disabled:opacity-50"
                >
                  Didn't get the code? Resend OTP
                </button>
              ) : (
                <p className="text-text-muted">
                  Resend OTP in <span className="font-medium">{resendTimer}s</span>
                </p>
              )}
            </div>

            {/* Change email */}
            <button
              type="button"
              onClick={handleChangeEmail}
              disabled={loading}
              className="w-full text-sm text-text-muted hover:text-text-primary transition"
            >
              ← Use a different email
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-6 pt-6 border-t border-border-light text-center text-sm text-text-muted space-y-2">
          <div>
            <Link to="/login" className="hover:text-text-primary transition">
              Login with password
            </Link>
          </div>
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}