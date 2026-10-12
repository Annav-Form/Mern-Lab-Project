import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    loading,
    error,
    fetchCart,
    updateItemQuantity,
    removeItemFromCart,
  } = useCart();

  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleQuantityChange = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      setActionError(`Cannot add more. Only ${maxStock} in stock.`);
      setTimeout(() => setActionError(""), 3000);
      return;
    }

    setUpdatingId(productId);
    setActionError("");
    const res = await updateItemQuantity(productId, newQty);
    setUpdatingId(null);
    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    setActionError("");
    const res = await removeItemFromCart(productId);
    setUpdatingId(null);
    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">🛒 My Shopping Cart</h1>
            <p className="page-subtitle">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </button>
        </div>

        {actionError && (
          <div
            style={{
              padding: "12px 20px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid var(--accent-red)",
              color: "#fca5a5",
              fontWeight: 500,
            }}
          >
            ⚠️ {actionError}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-title">Loading your cart...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-container">
            <span className="state-icon">⚠️</span>
            <p className="state-title">{error}</p>
            <button className="btn btn-primary" onClick={fetchCart}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="state-container">
            <span className="state-icon">🛒</span>
            <h2 className="state-title">Your cart is empty</h2>
            <p className="state-desc">
              Looks like you haven't added anything to your cart yet.
            </p>
            <button
              id="browse-products-cart-btn"
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Cart Contents */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            {/* Items List */}
            <div className="cart-items-section">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isItemBusy = updatingId === product._id;
                const itemSubtotal = product.price * item.quantity;

                return (
                  <div key={product._id} className="cart-item-card">
                    {/* Product Image */}
                    <img
                      className="cart-item-image"
                      src={product.image}
                      alt={product.name}
                      onClick={() => navigate(`/products/${product._id}`)}
                      style={{ cursor: "pointer" }}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/120x120/1a2035/6366f1?text=Item";
                      }}
                    />

                    {/* Product Details */}
                    <div className="cart-item-details">
                      <h3
                        className="cart-item-name"
                        onClick={() => navigate(`/products/${product._id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {product.name}
                      </h3>
                      <span className="product-category-badge" style={{ display: "inline-block", margin: "4px 0" }}>
                        {product.category}
                      </span>
                      <p className="cart-item-unit-price">
                        {formatPrice(product.price)} each
                      </p>

                      {/* Stock Warning if near limit */}
                      {product.stock <= 5 && (
                        <p style={{ fontSize: "0.8rem", color: "var(--accent-orange)" }}>
                          ⚡ Only {product.stock} units in stock!
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="cart-item-quantity-wrapper">
                      <div className="quantity-controls">
                        <button
                          id={`qty-minus-${product._id}`}
                          className="quantity-btn"
                          disabled={isItemBusy || item.quantity <= 1}
                          onClick={() =>
                            handleQuantityChange(
                              product._id,
                              item.quantity,
                              -1,
                              product.stock
                            )
                          }
                          title={item.quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
                        >
                          −
                        </button>
                        <span className="quantity-display">
                          {isItemBusy ? "..." : item.quantity}
                        </span>
                        <button
                          id={`qty-plus-${product._id}`}
                          className="quantity-btn"
                          disabled={
                            isItemBusy || item.quantity >= product.stock
                          }
                          onClick={() =>
                            handleQuantityChange(
                              product._id,
                              item.quantity,
                              1,
                              product.stock
                            )
                          }
                          title={
                            item.quantity >= product.stock
                              ? "Stock limit reached"
                              : "Increase quantity"
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        id={`remove-cart-item-${product._id}`}
                        className="cart-item-remove-link"
                        disabled={isItemBusy}
                        onClick={() => handleRemove(product._id)}
                      >
                        🗑️ Remove
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="cart-item-total">
                      <span className="cart-item-total-price">
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="cart-summary-section">
              <div className="order-summary-card">
                <h2 className="summary-title">Order Summary</h2>

                <div className="summary-row">
                  <span className="summary-label">Total Units</span>
                  <span className="summary-value">{cartCount}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">{formatPrice(cartSubtotal)}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Estimated Shipping</span>
                  <span className="summary-value" style={{ color: "var(--accent-green)" }}>
                    FREE
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total-row">
                  <span className="total-label">Grand Total</span>
                  <span className="total-amount">{formatPrice(cartSubtotal)}</span>
                </div>

                <button
                  id="proceed-to-checkout-btn"
                  className="btn btn-primary btn-full checkout-action-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout →
                </button>

                <p className="summary-guarantee-note">
                  🔒 100% Secure Checkout with Razorpay Test Mode
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
