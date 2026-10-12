const Product = require("../models/product.model");
const mongoose = require("mongoose");

// ─── Create Product ───────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, description, price, category, image",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock: stock ?? 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─── Get All Products (with search + category filter + sort bonus) ────────────
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    // Build sort object for bonus
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };

    const products = await Product.find(filter).sort(sortObj);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─── Get Single Product by ID ─────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { createProduct, getAllProducts, getProductById };
