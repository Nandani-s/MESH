import { Link } from 'react-router-dom';
import { Home, Search, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-background-muted px-4">
    <div className="text-center max-w-lg">
      <p className="text-7xl lg:text-8xl font-extrabold text-primary-500 tracking-tight">404</p>
      <h1 className="mt-4 text-2xl lg:text-3xl font-extrabold text-text-primary">
        This page drifted off the runway
      </h1>
      <p className="mt-3 text-text-secondary">
        The page you're looking for doesn't exist or has been moved. Let's get you back to something
        you'll love.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button to="/" variant="solid" size="md">
          <Home className="w-4 h-4" /> Back Home
        </Button>
        <Button to="/shop" variant="outline" size="md">
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Button>
      </div>

      <Link
        to="/search"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <Search className="w-4 h-4" /> Or search the catalog
      </Link>
    </div>
  </div>
);

export default NotFound;
