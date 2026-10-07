import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-light">
      <div className="max-w-md w-full text-center bg-surface-light p-10 rounded-3xl shadow-lg border border-border-light">
        <XCircle className="w-20 h-20 text-danger-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">Payment Failed</h1>
        <p className="text-text-muted mb-6">
          Something went wrong with your payment. Your order is saved — you can retry.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/cart" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Back to Cart
          </Link>
          <Link to="/" className="text-primary-500 hover:underline text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}