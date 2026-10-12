import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
  getWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wishlist state for instant heart toggles across catalog
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCart();
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
      }
    } catch (err) {
      // 401 means not logged in yet, don't set error
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || "Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wishlist IDs from backend
  const fetchWishlist = useCallback(async () => {
    try {
      setWishlistLoading(true);
      const res = await getWishlist();
      if (res.data?.success) {
        const ids = new Set((res.data.wishlist || []).map((p) => p._id));
        setWishlistIds(ids);
      }
    } catch (err) {
      // Ignore 401
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  // Derived state: Total units count
  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  // Derived state: Total subtotal in INR
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  // Add item to cart
  const addItemToCart = async (productId) => {
    try {
      const res = await apiAddToCart(productId);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true, message: res.data.message || "Added to cart" };
      }
      return { success: false, message: "Could not add to cart" };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add to cart";
      return { success: false, message: msg };
    }
  };

  // Update item quantity
  const updateItemQuantity = async (productId, quantity) => {
    try {
      const res = await apiUpdateCartQuantity(productId, quantity);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
      return { success: false, message: "Could not update quantity" };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update quantity";
      return { success: false, message: msg };
    }
  };

  // Remove item from cart
  const removeItemFromCart = async (productId) => {
    try {
      const res = await apiRemoveFromCart(productId);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
      return { success: false, message: "Could not remove product" };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove product";
      return { success: false, message: msg };
    }
  };

  // Clear global cart state (after order verification)
  const clearCartState = () => {
    setCartItems([]);
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => wishlistIds.has(productId);

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    const isWishlisted = wishlistIds.has(productId);
    try {
      if (isWishlisted) {
        await apiRemoveFromWishlist(productId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        return { success: true, wishlisted: false, message: "Removed from wishlist" };
      } else {
        await apiAddToWishlist(productId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
        return { success: true, wishlisted: true, message: "Added to wishlist" };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Wishlist action failed";
      return { success: false, wishlisted: isWishlisted, message: msg };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        loading,
        error,
        fetchCart,
        addItemToCart,
        updateItemQuantity,
        removeItemFromCart,
        clearCartState,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
