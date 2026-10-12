import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../services/api";
import Navbar from "../components/Navbar";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrders();
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return "status-placed";
      case "CONFIRMED":
        return "status-confirmed";
      case "SHIPPED":
        return "status-shipped";
      case "DELIVERED":
        return "status-delivered";
      default:
        return "status-pending";
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">📦 My Orders</h1>
            <p className="page-subtitle">
              View your purchase history and live order tracking
            </p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/products")}
          >
            ← Browse Products
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-title">Loading your orders...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="state-container">
            <span className="state-icon">⚠️</span>
            <p className="state-title">{error}</p>
            <button className="btn btn-primary" onClick={fetchUserOrders}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="state-container">
            <span className="state-icon">📦</span>
            <h2 className="state-title">You have not placed any orders yet</h2>
            <p className="state-desc">
              When you purchase items, your order history will appear here.
            </p>
            <button
              id="start-shopping-btn"
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const statusSteps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
              const currentStepIndex = statusSteps.indexOf(order.status);

              return (
                <div key={order._id} className="order-history-card">
                  {/* Order Top Meta */}
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-label">Order</span>
                      <h3 className="order-id-code">#{order._id}</h3>
                      <p className="order-date-text">
                        📅 {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="order-badges-group">
                      <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                      <span
                        className={`order-status-badge ${
                          order.paymentStatus === "PAID"
                            ? "status-paid"
                            : "status-pending"
                        }`}
                      >
                        💳 {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Bonus Challenge: Order Status Progress Bar */}
                  <div className="status-tracker-container">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      return (
                        <div
                          key={step}
                          className={`status-step ${
                            isCompleted ? "step-completed" : ""
                          } ${isCurrent ? "step-active" : ""}`}
                        >
                          <div className="step-circle">
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span className="step-label">{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items Snapshot */}
                  <div className="order-items-preview">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-preview-row">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-preview-thumb"
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/48x48/1a2035/6366f1?text=Item";
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <span className="order-preview-name">{item.name}</span>
                          <span className="order-preview-qty">
                            Quantity: {item.quantity} × {formatPrice(item.price)}
                          </span>
                        </div>
                        <span className="order-preview-subtotal">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Bottom Footer */}
                  <div className="order-card-footer">
                    <div>
                      <span className="order-footer-label">Delivered to: </span>
                      <span className="order-footer-address">
                        {order.shippingAddress?.fullName}, {order.shippingAddress?.city} ({order.shippingAddress?.pincode})
                      </span>
                    </div>

                    <div className="order-footer-actions">
                      <div className="order-total-block">
                        <span className="order-total-label">Total Amount:</span>
                        <span className="order-total-val">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                      <button
                        id={`view-order-${order._id}`}
                        className="btn btn-primary"
                        style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        View Details →
                      </button>
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
