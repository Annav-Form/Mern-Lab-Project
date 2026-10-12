const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");

// All order routes are protected
router.use(protect);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus); // Bonus endpoint

module.exports = router;
