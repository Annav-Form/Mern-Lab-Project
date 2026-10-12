import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist, addItemToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getProductById(id);
        setProduct(res.data.product);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Product not found.");
        } else if (err.response?.status === 400) {
          setError("Invalid product ID.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const isInStock = product && product.stock > 0;
  const isWishlisted = product && isInWishlist(product._id);

  const inCartItem = cartItems.find((item) => {
    const itemId = item.product?._id || item.product;
    return itemId === product?._id;
  });
  const inCartQty = inCartItem?.quantity || 0;

  const handleWishlistToggle = async () => {
    if (!product || wishlistLoading) return;
    setWishlistLoading(true);
    setFeedback("");
    const res = await toggleWishlist(product._id);
    setWishlistLoading(false);
    setFeedback(res.message);
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleAddToCart = async () => {
    if (!product || !isInStock || cartLoading) return;
    setCartLoading(true);
    setFeedback("");
    const res = await addItemToCart(product._id);
    setCartLoading(false);
    setFeedback(res.message);
    setTimeout(() => setFeedback(""), 3000);
  };

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate("/products")}>
          ← Back to Products
        </button>

        {/* Loading State */}
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-title">Loading product...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-container">
            <span className="state-icon">⚠️</span>
            <p className="state-title">{error}</p>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/products")}
            >
              Back to Products
            </button>
          </div>
        )}

        {/* Product Details */}
        {!loading && !error && product && (
          <div className="product-details-grid">
            {/* Image */}
            <div className="product-details-image-wrapper">
              <img
                className="product-details-image"
                src={product.image}
                alt={product.name}
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/600x600/1a2035/6366f1?text=No+Image";
                }}
              />
            </div>

            {/* Info */}
            <div className="product-details-info">
              {/* Category */}
              <span className="product-details-category">
                🏷️ {product.category}
              </span>

              {/* Name */}
              <h1 className="product-details-name">{product.name}</h1>

              {/* Price */}
              <div className="product-details-price">
                {formatPrice(product.price)}
              </div>

              {/* Description */}
              <p className="product-details-desc">{product.description}</p>

              {/* Meta Chips */}
              <div className="product-details-meta">
                <div className="meta-chip">
                  <span className="meta-chip-label">Stock:</span>
                  <span
                    className="meta-chip-value"
                    style={{
                      color:
                        product.stock > 0
                          ? "var(--accent-green)"
                          : "var(--accent-red)",
                    }}
                  >
                    {product.stock > 0
                      ? `${product.stock} units available`
                      : "Out of Stock"}
                  </span>
                </div>
                <div className="meta-chip">
                  <span className="meta-chip-label">Category:</span>
                  <span className="meta-chip-value">{product.category}</span>
                </div>
              </div>

              {feedback && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid var(--border-hover)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  {feedback}
                </div>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  marginTop: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  id={`add-to-cart-btn-${product._id}`}
                  className="btn btn-primary"
                  style={{
                    fontSize: "1rem",
                    padding: "14px 28px",
                    flex: "1 1 200px",
                  }}
                  disabled={!isInStock || cartLoading}
                  onClick={handleAddToCart}
                >
                  {cartLoading
                    ? "⏳ Adding to Cart..."
                    : inCartQty > 0
                    ? `🛒 Add Another (${inCartQty} in cart)`
                    : "🛒 Add to Cart"}
                </button>

                <button
                  id={`wishlist-toggle-btn-${product._id}`}
                  className={`btn ${
                    isWishlisted ? "btn-danger" : "btn-outline"
                  }`}
                  style={{
                    fontSize: "1rem",
                    padding: "14px 24px",
                  }}
                  disabled={wishlistLoading}
                  onClick={handleWishlistToggle}
                >
                  {wishlistLoading
                    ? "⏳ Saving..."
                    : isWishlisted
                    ? "♥ Remove from Wishlist"
                    : "♡ Add to Wishlist"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
