const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

/**
 * Middleware to protect routes.
 * Reads the JWT from the HttpOnly cookie, verifies it,
 * fetches the customer from DB, and attaches to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the customer and exclude the password
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found. Please log in again.",
      });
    }

    // Attach customer to request
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

module.exports = { protect };
