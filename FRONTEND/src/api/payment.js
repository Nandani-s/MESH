import { apiPost } from './client';

export const paymentApi = {
  initiateKhalti: (orderId) => apiPost('/payment/khalti/initiate', { orderId }),
  initiateEsewa: (orderId) => apiPost('/payment/esewa/initiate', { orderId }),
};