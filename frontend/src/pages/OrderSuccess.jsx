import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../services/api";
import Navbar from "../components/Navbar";

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        if (res.data?.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

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
        <div className="order-success-card">
          <div className="success-badge-icon">✅</div>

          <h1 className="success-heading">Order Placed Successfully!</h1>
          <p className="success-subheading">
            Thank you for shopping with ShopKart. Your order has been placed and payment confirmed.
          </p>

          <div className="success-info-box">
            <div className="success-info-row">
              <span className="success-info-label">Order ID:</span>
              <span className="success-info-value" style={{ fontFamily: "monospace" }}>
                {id}
              </span>
            </div>

            {order && (
              <>
                <div className="success-info-row">
                  <span className="success-info-label">Total Amount:</span>
                  <span className="success-info-value" style={{ color: "var(--accent-green)", fontWeight: 700 }}>
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                <div className="success-info-row">
                  <span className="success-info-label">Status:</span>
                  <span className="order-status-badge status-placed">
                    {order.status}
                  </span>
                </div>
                <div className="success-info-row">
                  <span className="success-info-label">Payment:</span>
                  <span className="order-status-badge status-paid">
                    {order.paymentStatus}
                  </span>
                </div>
                {order.shippingAddress && (
                  <div className="success-info-row">
                    <span className="success-info-label">Delivering to:</span>
                    <span className="success-info-value">
                      {order.shippingAddress.fullName}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="success-actions">
            <button
              id="view-orders-btn"
              className="btn btn-primary"
              style={{ padding: "14px 28px" }}
              onClick={() => navigate("/orders")}
            >
              📋 View My Orders
            </button>
            <button
              id="continue-shopping-btn"
              className="btn btn-outline"
              style={{ padding: "14px 28px" }}
              onClick={() => navigate("/products")}
            >
              🛍️ Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
