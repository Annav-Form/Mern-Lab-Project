const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Helper to populate cart items with current product details
 */
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name price image stock category",
  });
  if (!customer) return [];
  // Filter out any items where the referenced product no longer exists
  return customer.cart.filter((item) => item.product !== null);
};

/**
 * Add a product to the user's cart (or increment quantity if already present)
 * POST /cart/:productId
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const currentQty = customer.cart[existingIndex].quantity;
      if (currentQty + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Available stock is ${product.stock}`,
        });
      }
      customer.cart[existingIndex].quantity += 1;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await customer.save();
    const updatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error adding product to cart",
    });
  }
};

/**
 * Get current authenticated user's cart
 * GET /cart
 */
exports.getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching cart",
    });
  }
};

/**
 * Update quantity for a specific product in cart
 * PATCH /cart/:productId
 */
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (typeof quantity !== "number" || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be less than 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock of ${product.stock}`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    customer.cart[existingIndex].quantity = quantity;
    await customer.save();

    const updatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating cart quantity",
    });
  }
};

/**
 * Remove product from user's cart
 * DELETE /cart/:productId
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    customer.cart.splice(existingIndex, 1);
    await customer.save();

    const updatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error removing product from cart",
    });
  }
};
