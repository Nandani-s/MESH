import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/wishlist';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]); // populated product objects
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
	if (!isAuthenticated) {
	  setItems([]);
	  return;
	}
	setIsLoading(true);
	try {
	  const res = await wishlistApi.getAll();
	  setItems(res.data || []);
	} catch {
	  setItems([]);
	} finally {
	  setIsLoading(false);
	}
  }, [isAuthenticated]);

  // Re-fetch whenever the user logs in or out
  useEffect(() => {
	Promise.resolve().then(fetchWishlist);
  }, [fetchWishlist]);

  // Check if a product is in the wishlist (by _id string)
  const isInWishlist = useCallback(
	(productId) => items.some((item) => item.product?._id === productId),
	[items]
  );

  // Toggle: add if not present, remove if already there.
  // Optimistic update — UI changes immediately, rolls back if API fails.
  const toggleWishlist = useCallback(
	async (product) => {
	  if (!isAuthenticated) return false; // caller can redirect to login

	  const productId = product._id;
	  const alreadyIn = isInWishlist(productId);

	  // Optimistic update
	  if (alreadyIn) {
		setItems((prev) => prev.filter((item) => item.product?._id !== productId));
	  } else {
		setItems((prev) => [
		  ...prev,
		  { product, addedAt: new Date().toISOString() },
		]);
	  }

	  try {
		if (alreadyIn) {
		  await wishlistApi.remove(productId);
		} else {
		  await wishlistApi.add(productId);
		}
		return !alreadyIn;
	  } catch {
		// Roll back on failure
		await fetchWishlist();
		return alreadyIn;
	  }
	},
	[isAuthenticated, isInWishlist, fetchWishlist]
  );

  const clearWishlist = useCallback(async () => {
	setItems([]);
	try {
	  await wishlistApi.clear();
	} catch {
	  await fetchWishlist();
	}
  }, [fetchWishlist]);

  return (
	<WishlistContext.Provider
	  value={{
		items,
		isLoading,
		count: items.length,
		isInWishlist,
		toggleWishlist,
		clearWishlist,
		refetch: fetchWishlist,
	  }}
	>
	  {children}
	</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (ctx === undefined) {
	throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
