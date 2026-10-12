import { useNavigate, useLocation } from "react-router-dom";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlistIds } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error:", err);
    }
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <nav className="navbar">
      {/* Brand */}
      <div
        className="navbar-brand"
        onClick={() => navigate("/products")}
        style={{ cursor: "pointer" }}
      >
        <span className="navbar-brand-icon">🛒</span>
        <span>ShopKart</span>
      </div>

      {/* Nav Links */}
      <div className="navbar-nav">
        <button
          className={`nav-link ${isActive("/home") ? "active" : ""}`}
          onClick={() => navigate("/home")}
        >
          Home
        </button>
        <button
          className={`nav-link ${isActive("/products") ? "active" : ""}`}
          onClick={() => navigate("/products")}
        >
          Products
        </button>
        <button
          id="nav-wishlist-btn"
          className={`nav-link ${isActive("/wishlist") ? "active" : ""}`}
          onClick={() => navigate("/wishlist")}
        >
          Wishlist {wishlistIds.size > 0 && `(${wishlistIds.size})`}
        </button>
        <button
          id="nav-cart-btn"
          className={`nav-link ${isActive("/cart") ? "active" : ""}`}
          onClick={() => navigate("/cart")}
        >
          Cart ({cartCount})
        </button>
        <button
          id="nav-orders-btn"
          className={`nav-link ${isActive("/orders") ? "active" : ""}`}
          onClick={() => navigate("/orders")}
        >
          Orders
        </button>
        <button
          id="logout-btn"
          className="btn btn-danger"
          style={{ padding: "8px 18px", fontSize: "0.85rem" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
