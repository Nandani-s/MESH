import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart';
import { useAuth } from './AuthContext';
import { trackAnalyticsEvent } from '../utils/analyticsTracking';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
	if (!isAuthenticated) { setItems([]); return; }
	setIsLoading(true);
	try {
	  const res = await cartApi.getCart();
	  setItems(res.data || []);
	} catch {
	  setItems([]);
	} finally {
	  setIsLoading(false);
	}
  }, [isAuthenticated]);

  useEffect(() => { Promise.resolve().then(fetchCart); }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
	if (!isAuthenticated) return false;
	try {
	  const res = await cartApi.addToCart(productId, quantity);
	  setItems(res.data || []);
	  trackAnalyticsEvent('add_to_cart', { productId });
	  return true;
	} catch {
	  return false;
	}
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (productId, quantity) => {
	// Optimistic update
	setItems(prev => prev.map(item =>
	  item.product?._id === productId ? { ...item, quantity } : item
	));
	try {
	  const res = await cartApi.updateQuantity(productId, quantity);
	  setItems(res.data || []);
	} catch {
	  await fetchCart(); // rollback
	}
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
	// Optimistic update
	setItems(prev => prev.filter(item => item.product?._id !== productId));
	try {
	  const res = await cartApi.removeFromCart(productId);
	  setItems(res.data || []);
	} catch {
	  await fetchCart(); // rollback
	}
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
	setItems([]);
	try {
	  await cartApi.clearCart();
	} catch {
	  await fetchCart();
	}
  }, [fetchCart]);

  const isInCart = useCallback(
	(productId) => items.some(item => item.product?._id === productId),
	[items]
  );

  const getItemQuantity = useCallback(
	(productId) => items.find(item => item.product?._id === productId)?.quantity || 0,
	[items]
  );

  const cartTotal = items.reduce((sum, item) => {
	const price = item.product?.price || 0;
	return sum + price * item.quantity;
  }, 0);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
	<CartContext.Provider value={{
	  items, isLoading, cartCount, cartTotal,
	  addToCart, updateQuantity, removeFromCart, clearCart,
	  isInCart, getItemQuantity, refetch: fetchCart,
	}}>
	  {children}
	</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
