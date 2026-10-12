require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,               // Allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "ShopKart API is running 🛒" });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ─── Connect to MongoDB and Start Server ──────────────────────────────────────
const PORT = process.env.PORT || 5001;

async function startServer() {
  let uri = process.env.MONGO_URI;

  try {
    if (!uri) throw new Error("MONGO_URI not set");
    console.log("Connecting to MongoDB at:", uri);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${err.message}). Starting in-memory MongoDB...`);
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log("✅ In-memory MongoDB running at:", uri);

    // Auto-seed initial catalog products so everything works immediately
    try {
      const Product = require("./models/product.model");
      const count = await Product.countDocuments();
      if (count === 0) {
        const seedModule = require("./utils/seed");
        if (typeof seedModule.seedSampleData === "function") {
          await seedModule.seedSampleData();
        }
      }
    } catch (seedErr) {
      console.warn("Seeding notice:", seedErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 ShopKart server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

