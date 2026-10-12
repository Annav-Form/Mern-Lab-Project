import axios from "axios";

// Axios instance — configured with baseURL and withCredentials to send HttpOnly cookies
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getProfile = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");
export const changePassword = (data) =>
  api.patch("/customers/change-password", data);

// ─── Product APIs ─────────────────────────────────────────────────────────────
export const createProduct = (data) => api.post("/products", data);
export const getAllProducts = (params = {}) =>
  api.get("/products", { params }); // supports { search, category, sort }
export const getProductById = (id) => api.get(`/products/${id}`);

// ─── Wishlist APIs (Lab-04) ──────────────────────────────────────────────────
export const addToWishlist = (productId) =>
  api.post(`/wishlist/${productId}`);
export const getWishlist = () => api.get("/wishlist");
export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

// ─── Shopping Cart APIs (Lab-05) ─────────────────────────────────────────────
export const addToCart = (productId) => api.post(`/cart/${productId}`);
export const getCart = () => api.get("/cart");
export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId) =>
  api.delete(`/cart/${productId}`);

// ─── Checkout & Order APIs (Lab-06) ──────────────────────────────────────────
export const createPaymentOrder = (shippingAddress) =>
  api.post("/orders/create-payment-order", { shippingAddress });
export const verifyPayment = (paymentData) =>
  api.post("/orders/verify-payment", paymentData);
export const getOrders = () => api.get("/orders");
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

export default api;
