import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist, addItemToCart, cartItems } = useCart();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const isInStock = product.stock > 0;
  const isWishlisted = isInWishlist(product._id);

  // Check how many of this product are in cart
  const inCartItem = cartItems.find((item) => {
    const id = item.product?._id || item.product;
    return id === product._id;
  });
  const inCartQty = inCartItem?.quantity || 0;

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setFeedback("");
    const res = await toggleWishlist(product._id);
    setWishlistLoading(false);
    if (!res.success) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    if (!isInStock || cartLoading) return;
    setCartLoading(true);
    setFeedback("");
    const res = await addItemToCart(product._id);
    setCartLoading(false);
    if (!res.success) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(""), 3500);
    }
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/products/${product._id}`)}
      style={{ cursor: "pointer", position: "relative" }}
    >
      {/* Image Wrapper */}
      <div className="product-image-wrapper">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.target.src =
              "https://placehold.co/400x300/1a2035/6366f1?text=No+Image";
          }}
        />
        {/* Category badge */}
        <span className="product-category-badge">{product.category}</span>
        {/* Stock badge */}
        <span
          className={`product-stock-badge ${
            isInStock ? "stock-in" : "stock-out"
          }`}
        >
          {isInStock ? `${product.stock} in stock` : "Out of stock"}
        </span>

        {/* Wishlist Heart Button */}
        <button
          id={`wishlist-btn-${product._id}`}
          className={`wishlist-icon-btn ${isWishlisted ? "wishlisted" : ""}`}
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlistLoading ? "⏳" : isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      {/* Body */}
      <div className="product-body">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>
        <p className="product-price">{formatPrice(product.price)}</p>

        {feedback && (
          <p className="card-feedback-error">
            {feedback}
          </p>
        )}

        {/* Action Buttons */}
        <div className="product-card-actions">
          <button
            id={`cart-btn-${product._id}`}
            className="btn btn-outline"
            style={{ flex: 1 }}
            disabled={!isInStock || cartLoading}
            onClick={handleAddToCartClick}
          >
            {cartLoading
              ? "⏳ Adding..."
              : inCartQty > 0
              ? `🛒 In Cart (${inCartQty})`
              : "🛒 Add to Cart"}
          </button>
          <button
            id={`view-btn-${product._id}`}
            className="btn btn-primary"
            style={{ padding: "8px 14px" }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product._id}`);
            }}
          >
            Details →
          </button>
        </div>
      </div>
    </div>
  );
}
