import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-light">
      <div className="max-w-md w-full text-center bg-surface-light p-10 rounded-3xl shadow-lg border border-border-light">
        <CheckCircle className="w-20 h-20 text-success-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">Order Placed!</h1>
        <p className="text-text-muted mb-6">
          Thank you for shopping with MESH. A confirmation email is on its way.
        </p>
        {orderId && (
          <p className="text-sm text-text-muted mb-6">
            Order ID: <span className="font-mono font-semibold">#{orderId.slice(-8).toUpperCase()}</span>
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Link to="/shop" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Continue Shopping
          </Link>
          <Link to="/" className="text-primary-500 hover:underline text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}