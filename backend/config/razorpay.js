const Razorpay = require("razorpay");

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart12345";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_test_secret_67890";

let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
} catch (err) {
  console.warn("⚠️ Warning initializing Razorpay SDK:", err.message);
}

module.exports = {
  razorpay: razorpayInstance,
  key_id,
  key_secret,
};
