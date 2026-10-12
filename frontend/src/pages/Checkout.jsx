import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import Navbar from "../components/Navbar";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartSubtotal, clearCartState } = useCart();

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Simulator Modal State
  const [showSimulator, setShowSimulator] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const validateForm = () => {
    const errs = {};
    if (!shippingAddress.fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    if (!shippingAddress.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9+\s-]{10,15}$/.test(shippingAddress.phone.trim())) {
      errs.phone = "Please enter a valid 10-digit phone number";
    }
    if (!shippingAddress.addressLine1.trim()) {
      errs.addressLine1 = "Address line is required";
    }
    if (!shippingAddress.city.trim()) {
      errs.city = "City is required";
    }
    if (!shippingAddress.state.trim()) {
      errs.state = "State is required";
    }
    if (!shippingAddress.pincode.trim()) {
      errs.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      errs.pincode = "Pincode must contain 6 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    if (cartItems.length === 0) {
      setApiError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create pending order and Razorpay order on backend
      const res = await createPaymentOrder(shippingAddress);
      const data = res.data;

      if (!data.success) {
        setApiError(data.message || "Failed to initialize order");
        setLoading(false);
        return;
      }

      setCheckoutData(data);

      // If a real Razorpay merchant key is configured, use the official Razorpay Checkout popup
      if (data.isRealKey) {
        const isScriptLoaded = await loadRazorpayScript();
        if (isScriptLoaded && window.Razorpay) {
          const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "ShopKart",
            description: "ShopKart Order Checkout (Test Mode)",
            order_id: data.razorpayOrderId,
            handler: async function (response) {
              await processVerification({
                shopKartOrderId: data.shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            },
            prefill: {
              name: shippingAddress.fullName,
              contact: shippingAddress.phone,
            },
            theme: { color: "#6366f1" },
          };

          const rzpPaymentObject = new window.Razorpay(options);
          rzpPaymentObject.on("payment.failed", function (failResponse) {
            console.error("Razorpay Payment failed:", failResponse.error);
            setApiError(
              `Payment failed: ${failResponse.error?.description || "Transaction cancelled"}. Your cart has not been cleared.`
            );
            setLoading(false);
          });
          rzpPaymentObject.open();
          setLoading(false);
          return;
        }
      }

      // If running in development/test mode without an active Razorpay merchant account,
      // open the interactive Razorpay Test Simulator modal
      setShowSimulator(true);
      setLoading(false);
    } catch (err) {
      console.error("Order creation error:", err);
      setApiError(
        err.response?.data?.message ||
          "Could not initialize order. Please check item stock and try again."
      );
      setLoading(false);
    }
  };

  const processVerification = async (verifyPayload) => {
    setLoading(true);
    try {
      const verifyRes = await verifyPayment(verifyPayload);
      if (verifyRes.data?.success) {
        clearCartState();
        setShowSimulator(false);
        navigate(`/order-success/${verifyPayload.shopKartOrderId}`);
      } else {
        setApiError(verifyRes.data?.message || "Payment verification failed");
      }
    } catch (vErr) {
      setApiError(
        vErr.response?.data?.message ||
          "Payment signature verification failed. Cart was not cleared."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedSuccess = async () => {
    if (!checkoutData) return;
    await processVerification({
      shopKartOrderId: checkoutData.shopKartOrderId,
      razorpay_order_id: checkoutData.razorpayOrderId,
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_signature: `simulated_sig_${checkoutData.razorpayOrderId}`,
    });
  };

  const handleSimulatedFailure = async () => {
    if (!checkoutData) return;
    setLoading(true);
    try {
      // Intentionally sending invalid signature to test failure handling
      await verifyPayment({
        shopKartOrderId: checkoutData.shopKartOrderId,
        razorpay_order_id: checkoutData.razorpayOrderId,
        razorpay_payment_id: `pay_failed_${Date.now()}`,
        razorpay_signature: "invalid_test_signature_xyz",
      });
    } catch (err) {
      setApiError(
        "❌ Test Payment Failed: Invalid signature rejected by backend. Your cart remains safe and was NOT cleared."
      );
      setShowSimulator(false);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !showSimulator) {
    return (
      <>
        <Navbar />
        <div className="page">
          <div className="state-container">
            <span className="state-icon">🛒</span>
            <h2 className="state-title">Your Cart is Empty</h2>
            <p className="state-desc">
              Please add products to your cart before proceeding to checkout.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">💳 Checkout</h1>
            <p className="page-subtitle">
              Enter shipping details and complete your test payment
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate("/cart")}>
            ← Back to Cart
          </button>
        </div>

        {apiError && (
          <div
            style={{
              padding: "14px 20px",
              marginBottom: "24px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid var(--accent-red)",
              color: "#fca5a5",
              fontWeight: 500,
            }}
          >
            {apiError}
          </div>
        )}

        <div className="checkout-layout">
          {/* Shipping Form */}
          <div className="checkout-form-card">
            <h2 className="form-card-title">📍 Shipping Details</h2>

            <form onSubmit={handlePlaceOrder} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={`form-input ${errors.fullName ? "input-error" : ""}`}
                  placeholder="e.g. Aarav Sharma"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <span className="form-error-msg">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-input ${errors.phone ? "input-error" : ""}`}
                  placeholder="e.g. 9876543210"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <span className="form-error-msg">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addressLine1">
                  Street Address *
                </label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  className={`form-input ${errors.addressLine1 ? "input-error" : ""}`}
                  placeholder="e.g. 22 MG Road, Flat 4B"
                  value={shippingAddress.addressLine1}
                  onChange={handleChange}
                />
                {errors.addressLine1 && (
                  <span className="form-error-msg">{errors.addressLine1}</span>
                )}
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={`form-input ${errors.city ? "input-error" : ""}`}
                    placeholder="e.g. Bengaluru"
                    value={shippingAddress.city}
                    onChange={handleChange}
                  />
                  {errors.city && (
                    <span className="form-error-msg">{errors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="state">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    className={`form-input ${errors.state ? "input-error" : ""}`}
                    placeholder="e.g. Karnataka"
                    value={shippingAddress.state}
                    onChange={handleChange}
                  />
                  {errors.state && (
                    <span className="form-error-msg">{errors.state}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">
                    Pincode *
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    maxLength={6}
                    className={`form-input ${errors.pincode ? "input-error" : ""}`}
                    placeholder="e.g. 560001"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                  />
                  {errors.pincode && (
                    <span className="form-error-msg">{errors.pincode}</span>
                  )}
                </div>
              </div>

              <button
                id="place-order-submit-btn"
                type="submit"
                className="btn btn-primary btn-full"
                style={{ marginTop: "16px", padding: "16px", fontSize: "1rem" }}
                disabled={loading}
              >
                {loading ? "⏳ Initializing Secure Payment..." : "⚡ Pay with Razorpay (Test Mode)"}
              </button>
            </form>
          </div>

          {/* Review Order Summary */}
          <div className="checkout-review-card">
            <h2 className="form-card-title">📦 Order Review ({cartCount} units)</h2>

            <div className="checkout-review-items">
              {cartItems.map((item) => {
                const p = item.product;
                if (!p) return null;
                return (
                  <div key={p._id} className="checkout-review-item">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="checkout-item-thumb"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/60x60/1a2035/6366f1?text=Item";
                      }}
                    />
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{p.name}</p>
                      <p className="checkout-item-sub">
                        {item.quantity} × {formatPrice(p.price)}
                      </p>
                    </div>
                    <span className="checkout-item-amount">
                      {formatPrice(p.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider" style={{ margin: "20px 0" }} />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: "var(--accent-green)" }}>FREE</span>
            </div>
            <div className="summary-row total-row">
              <span>Total Payable</span>
              <span className="total-amount">{formatPrice(cartSubtotal)}</span>
            </div>
          </div>
        </div>

        {/* ─── Razorpay Test Mode Interactive Modal ─────────────────────────────── */}
        {showSimulator && checkoutData && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.5rem" }}>💳</span>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      Razorpay Test Mode
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--accent-orange)" }}>
                      Simulated Checkout Sandbox
                    </p>
                  </div>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowSimulator(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-amount-banner">
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Total Payable:
                  </span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-primary)" }}>
                    {formatPrice(checkoutData.amount / 100)}
                  </span>
                </div>

                <div className="modal-info-box">
                  <p><strong>Merchant:</strong> ShopKart India</p>
                  <p><strong>Order ID:</strong> {checkoutData.razorpayOrderId}</p>
                  <p><strong>Customer:</strong> {shippingAddress.fullName}</p>
                </div>

                <div className="modal-test-card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>TEST CARD</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent-green)" }}>VALID</span>
                  </div>
                  <p style={{ fontSize: "1.1rem", letterSpacing: "2px", fontFamily: "monospace" }}>
                    4111 •••• •••• 1111
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span>EXP: 12/30</span>
                    <span>CVV: 123</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                  <button
                    id="simulate-success-btn"
                    className="btn btn-primary btn-full"
                    style={{ padding: "14px", fontSize: "0.95rem" }}
                    disabled={loading}
                    onClick={handleSimulatedSuccess}
                  >
                    {loading ? "⏳ Verifying HMAC Signature..." : `✅ Pay ${formatPrice(checkoutData.amount / 100)} (Test Success)`}
                  </button>

                  <button
                    id="simulate-fail-btn"
                    className="btn btn-outline btn-full"
                    style={{ padding: "10px", fontSize: "0.85rem", color: "var(--accent-red)", borderColor: "var(--accent-red)" }}
                    disabled={loading}
                    onClick={handleSimulatedFailure}
                  >
                    ❌ Test Payment Failure (Verify Cart Not Cleared)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
