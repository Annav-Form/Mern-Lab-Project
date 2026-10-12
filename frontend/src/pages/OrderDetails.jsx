import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../services/api";
import Navbar from "../components/Navbar";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderById(id);
      if (res.data?.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Order not found.");
      } else if (err.response?.status === 403) {
        setError("Unauthorized to view this order.");
      } else {
        setError("Failed to load order details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    setStatusMsg("");
    try {
      const res = await updateOrderStatus(id, newStatus);
      if (res.data?.success) {
        setOrder(res.data.order);
        setStatusMsg(`Status updated to ${newStatus}`);
        setTimeout(() => setStatusMsg(""), 3000);
      }
    } catch (err) {
      setStatusMsg("Failed to update status");
      setTimeout(() => setStatusMsg(""), 3000);
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusSteps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

  return (
    <>
      <Navbar />
      <div className="page">
        <button className="back-btn" onClick={() => navigate("/orders")}>
          ← Back to Orders
        </button>

        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-title">Loading order details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-container">
            <span className="state-icon">⚠️</span>
            <p className="state-title">{error}</p>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/orders")}
            >
              Back to Orders
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="order-details-container">
            {/* Header info */}
            <div className="order-details-header">
              <div>
                <span className="order-id-label">Purchase Details</span>
                <h1 className="order-details-title">Order #{order._id}</h1>
                <p className="order-date-text">Placed on {formatDate(order.createdAt)}</p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span className={`order-status-badge status-${order.status?.toLowerCase()}`}>
                  Status: {order.status}
                </span>
                <span
                  className={`order-status-badge ${
                    order.paymentStatus === "PAID"
                      ? "status-paid"
                      : "status-pending"
                  }`}
                >
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Bonus Challenge: Status Progression Tracker & Demo Controls */}
            <div className="order-tracker-card">
              <h3 style={{ fontSize: "1rem", marginBottom: "16px", color: "var(--text-secondary)" }}>
                🚚 Live Delivery Tracker (Lab-06 Bonus)
              </h3>

              <div className="status-tracker-container" style={{ margin: "16px 0 24px" }}>
                {statusSteps.map((step, idx) => {
                  const currentIdx = statusSteps.indexOf(order.status);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div
                      key={step}
                      className={`status-step ${
                        isCompleted ? "step-completed" : ""
                      } ${isCurrent ? "step-active" : ""}`}
                    >
                      <div className="step-circle">{isCompleted ? "✓" : idx + 1}</div>
                      <span className="step-label">{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Status Switcher (Bonus demo control) */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Change Status (Demo):
                </span>
                {statusSteps.map((s) => (
                  <button
                    key={s}
                    className={`btn ${order.status === s ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange(s)}
                  >
                    {s}
                  </button>
                ))}
                {statusMsg && (
                  <span style={{ fontSize: "0.85rem", color: "var(--accent-green)", marginLeft: "8px" }}>
                    {statusMsg}
                  </span>
                )}
              </div>
            </div>

            <div className="order-details-grid">
              {/* Items Card */}
              <div className="order-details-items-card">
                <h3 className="card-section-title">Purchased Items ({order.items?.length})</h3>

                <div className="order-items-table">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item-table-row">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-preview-thumb"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/60x60/1a2035/6366f1?text=Item";
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{item.name}</h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          Price at purchase: {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="summary-divider" style={{ margin: "20px 0" }} />

                <div className="summary-row total-row">
                  <span>Grand Total</span>
                  <span className="total-amount">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* Address & Payment Info Card */}
              <div className="order-details-meta-card">
                <h3 className="card-section-title">Shipping Address</h3>
                <div className="address-display-box">
                  <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                    {order.shippingAddress?.fullName}
                  </p>
                  <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                    📞 {order.shippingAddress?.phone}
                  </p>
                  <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                    {order.shippingAddress?.addressLine1}
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                </div>

                <h3 className="card-section-title" style={{ marginTop: "24px" }}>
                  Payment Information
                </h3>
                <div className="payment-meta-box">
                  <div className="summary-row">
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Method:</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Razorpay Test Mode</span>
                  </div>
                  {order.razorpayOrderId && (
                    <div className="summary-row">
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Rzp Order:</span>
                      <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                        {order.razorpayOrderId}
                      </span>
                    </div>
                  )}
                  {order.razorpayPaymentId && (
                    <div className="summary-row">
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Rzp Payment:</span>
                      <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--accent-green)" }}>
                        {order.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
