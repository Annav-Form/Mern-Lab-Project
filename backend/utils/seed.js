require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

const sampleProducts = [
  {
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.",
    price: 199.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    stock: 25,
  },
  {
    name: "Minimalist Leather Watch",
    description: "Elegant analog wristwatch with genuine Italian leather strap and Japanese quartz movement.",
    price: 129.5,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    stock: 18,
  },
  {
    name: "Running Performance Sneakers",
    description: "Breathable, lightweight athletic running shoes designed for high-impact comfort and durability.",
    price: 89.99,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    stock: 40,
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless vintage wash denim jacket made from 100% organic cotton with brass button detailing.",
    price: 74.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
    stock: 30,
  },
  {
    name: "Smart Fitness Tracker Band",
    description: "All-day heart rate, sleep tracking, SpO2 monitor, and 50m water resistance with vibrant OLED display.",
    price: 49.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
    stock: 50,
  },
  {
    name: "Canvas Travel Backpack",
    description: "Water-resistant multi-pocket travel backpack with 15.6-inch laptop compartment and ergonomic straps.",
    price: 59.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    stock: 22,
  },
];

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    await Product.deleteMany({});
    console.log("Cleared existing products.");

    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    // Clear all customer carts and wishlists — old product ObjectIds are now invalid
    const cartResult = await Customer.updateMany({}, { $set: { cart: [], wishlist: [] } });
    console.log(`Cleared carts & wishlists for ${cartResult.modifiedCount} customer(s).`);

    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
}

seedDatabase();
