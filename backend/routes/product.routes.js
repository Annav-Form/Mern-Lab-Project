const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/product.controller");

// POST /products       → Create a product
// GET  /products       → Get all products (supports ?search=, ?category=, ?sort=)
// GET  /products/:id   → Get single product

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;
