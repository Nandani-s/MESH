import { apiPost } from './client';

export const otpApi = {
  // Login OTP
  requestLoginOtp: (email) => apiPost('/user/login-otp-request', { email }),
  verifyLoginOtp: (email, otp) => apiPost('/user/login-otp-verify', { email, otp }),
  
  // Forgot Password
  requestPasswordReset: (email) => apiPost('/user/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => 
    apiPost('/user/reset-password', { email, otp, newPassword }),
};