import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch (err) {
        // 401 → not authenticated → redirect to login
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="state-container">
          <div className="spinner" />
          <p className="state-title">Loading your profile...</p>
        </div>
      </>
    );
  }

  if (!user) return null;

  // Get initials for avatar
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Hero */}
        <div className="home-hero">
          <p className="home-hero-greeting">Welcome back 👋</p>
          <h1 className="home-hero-title">Hello, {user.fullName.split(" ")[0]}!</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>
            Great to see you again. Ready to explore our products?
          </p>
          <button
            id="browse-products-btn"
            className="btn btn-primary"
            onClick={() => navigate("/products")}
            style={{ fontSize: "1rem", padding: "14px 32px" }}
          >
            🛍️ Browse Products
          </button>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar">{initials}</div>
          <h2 className="profile-name">{user.fullName}</h2>

          <div className="profile-detail-row">
            <div className="profile-detail-icon">📧</div>
            <div>
              <div className="profile-detail-label">Email Address</div>
              <div className="profile-detail-value">{user.email}</div>
            </div>
          </div>

          <div className="profile-detail-row">
            <div className="profile-detail-icon">📞</div>
            <div>
              <div className="profile-detail-label">Phone Number</div>
              <div className="profile-detail-value">{user.phone}</div>
            </div>
          </div>

          <div className="profile-detail-row">
            <div className="profile-detail-icon">🆔</div>
            <div>
              <div className="profile-detail-label">Customer ID</div>
              <div className="profile-detail-value" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {user._id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
