import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

export default function Wishlist() {
  const navigate = useNavigate();
  const { addItemToCart, fetchWishlist } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWishlist();
      if (res.data?.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("We couldn't load your wishlist. Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setActionLoadingId(productId);
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      fetchWishlist();
      setMessage("Product removed from wishlist");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove product");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMoveToCart = async (productId) => {
    setActionLoadingId(productId);
    const res = await addItemToCart(productId);
    setActionLoadingId(null);
    setMessage(res.message);
    setTimeout(() => setMessage(""), 3000);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">❤️ My Wishlist</h1>
            <p className="page-subtitle">
              {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved for later
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: "12px 20px",
              marginBottom: "24px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid var(--border-hover)",
              color: "var(--text-primary)",
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-title">Loading your wishlist...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-container">
            <span className="state-icon">⚠️</span>
            <p className="state-title">{error}</p>
            <button className="btn btn-primary" onClick={loadWishlist}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="state-container">
            <span className="state-icon">❤️</span>
            <h2 className="state-title">Your wishlist is empty</h2>
            <p className="state-desc">
              Save products you love and find them here later.
            </p>
            <button
              id="browse-products-btn"
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="products-grid">
            {wishlist.map((product) => {
              const inStock = product.stock > 0;
              const isActionRunning = actionLoadingId === product._id;

              return (
                <div key={product._id} className="product-card">
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
                    <span className="product-category-badge">
                      {product.category}
                    </span>
                    <span
                      className={`product-stock-badge ${
                        inStock ? "stock-in" : "stock-out"
                      }`}
                    >
                      {inStock ? `${product.stock} left` : "Out of stock"}
                    </span>
                  </div>

                  <div className="product-body">
                    <h3 className="product-name" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="product-price">
                      {formatPrice(product.price)}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginTop: "12px",
                      }}
                    >
                      <button
                        className="btn btn-primary btn-full"
                        disabled={!inStock || isActionRunning}
                        onClick={() => handleMoveToCart(product._id)}
                      >
                        {isActionRunning ? "⏳ Adding..." : "🛒 Add to Cart"}
                      </button>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-outline"
                          style={{ flex: 1, fontSize: "0.85rem", padding: "8px" }}
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          View Details
                        </button>
                        <button
                          id={`remove-wishlist-${product._id}`}
                          className="btn btn-danger"
                          style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                          disabled={isActionRunning}
                          onClick={() => handleRemove(product._id)}
                          title="Remove from wishlist"
                        >
                          Remove ♥
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
