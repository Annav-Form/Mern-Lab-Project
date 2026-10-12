# 🛒 ShopKart — Fullstack MERN E-Commerce Platform

A production-ready, full-stack e-commerce web application engineered with the **MERN stack** (MongoDB, Express, React, Node.js) featuring secure JWT authentication, dynamic catalog discovery, persistent wishlist & cart systems, and complete Razorpay test payment integration.

---

## 🚀 Key Features

### 🔐 1. Authentication & Security (Labs 01 & 02)
- **Bcrypt Hashing**: Secure salted password encryption in MongoDB.
- **JWT & HttpOnly Cookies**: Cookie-based persistent session security immune to XSS token theft.
- **Client Form Validation**: Real-time validation for email formatting, phone numbers, and password constraints.
- **Protected Routing**: Authenticated navigation and automatic redirects for guest / logged-in states.

### 🛍️ 2. Product Catalog & Discovery (Lab 03)
- **Data-Driven Catalog**: Real-time product listing with category filtering and keyword search.
- **Product Details**: Dedicated product preview pages with live inventory stock checks.
- **Database Seeder**: Automated seed script to populate realistic catalog data.

### ❤️ 3. Persistent Wishlist (Lab 04)
- **MongoDB Relationships**: User-specific product references preventing duplicates.
- **Interactive Heart Toggles**: Instant add/remove wishlist capability across catalog and details views.
- **Dedicated Wishlist Page**: Responsive grid layout for browsing and managing saved items.

### 🛒 4. Global State Shopping Cart (Lab 05)
- **React Context State**: Global `CartContext` keeping navbar badges, cart tallies, and totals in sync across the entire app.
- **Stock Guardrails**: Quantity increment/decrement buttons with automated boundary limits tied to available inventory.
- **Persistent Server Sync**: Synchronized server-side cart operations that persist across refreshes.

### 💳 5. Checkout, Payments & Order Tracking (Lab 06)
- **Strict Server Pricing**: Back-end recalculates totals and validates live stock right before order creation (zero trust on client price payloads).
- **Snapshot Architecture**: Captures product names, images, and prices at purchase time so future product changes don't distort order history.
- **Razorpay Test Integration**: Opens Razorpay payment checkout modal with test credentials.
- **HMAC SHA-256 Verification**: Server-side cryptographic signature verification before confirming payment and marking orders `PAID`.
- **Cart Clearing & Stock Decrement**: Safely clears the customer's cart and deducts stock only upon successful payment verification.
- **Read-Only Order Tracker**: Multi-step visual delivery progress bar (`PLACED` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Vanilla CSS (Modern design system with dark aesthetic).
- **Backend**: Node.js, Express.js, Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`.
- **Database**: MongoDB (Atlas / Local).
- **Payments**: Razorpay Node SDK & Checkout Checkout JS.

---

## 📁 Repository Structure

```text
ShopKart_Ecommerce/
├── backend/
│   ├── config/
│   │   └── razorpay.js            # Razorpay SDK configuration
│   ├── controllers/
│   │   ├── customer.controller.js  # Auth (Register, Login, Me, Logout)
│   │   ├── product.controller.js   # Products (CRUD, Filter, Search)
│   │   ├── wishlist.controller.js  # Wishlist handlers
│   │   ├── cart.controller.js      # Cart management handlers
│   │   └── order.controller.js     # Razorpay orders & verification
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie verification middleware
│   ├── models/
│   │   ├── customer.model.js       # Customer schema (with embedded cart/wishlist)
│   │   ├── product.model.js        # Product schema
│   │   └── order.model.js          # Order schema with item snapshots
│   ├── routes/                     # Express route declarations
│   ├── utils/
│   │   ├── generateToken.js        # JWT creation & cookie setter
│   │   └── seed.js                 # Sample catalog seeder script
│   └── index.js                    # Server entry point
│
├── frontend/
│   ├── public/                     # Static icons & SVGs
│   ├── src/
│   │   ├── components/             # Reusable UI (Navbar, ProductCard, SearchBar)
│   │   ├── context/                # Global CartContext provider
│   │   ├── pages/                  # Route views (Home, Products, Cart, Checkout, Orders...)
│   │   ├── services/
│   │   │   └── api.js              # Centralized Axios API client
│   │   ├── App.jsx                 # Route definitions
│   │   └── main.jsx                # React app mount
│   └── index.html
│
└── .gitignore                      # Git exclusion rules
```

---

## ⚡ Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas connection string)
- Git

### 2. Backend Setup
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
3. *(Optional)* Seed initial products into your database:
   ```bash
   npm run seed
   # or: node utils/seed.js
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```

### 3. Frontend Setup
1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

---

## 🔌 API Reference Overview

| Module | Method | Endpoint | Description | Auth Required |
|---|---|---|---|:---:|
| **Auth** | `POST` | `/customers/register` | Register customer | ❌ |
| **Auth** | `POST` | `/customers/login` | Login and set HttpOnly cookie | ❌ |
| **Auth** | `GET` | `/customers/me` | Fetch active user profile | ✅ |
| **Auth** | `POST` | `/customers/logout` | Clear session cookie | ✅ |
| **Products** | `GET` | `/products` | Fetch catalog (filter by search, category) | ❌ |
| **Products** | `GET` | `/products/:id` | Fetch single product | ❌ |
| **Products** | `POST` | `/products` | Add new product | ❌ |
| **Wishlist** | `GET` | `/wishlist` | Get user's saved items | ✅ |
| **Wishlist** | `POST` | `/wishlist/:productId`| Add item to wishlist | ✅ |
| **Wishlist** | `DELETE`| `/wishlist/:productId`| Remove item from wishlist | ✅ |
| **Cart** | `GET` | `/cart` | Get current cart items & count | ✅ |
| **Cart** | `POST` | `/cart/:productId` | Add product to cart | ✅ |
| **Cart** | `PATCH`| `/cart/:productId` | Update item quantity | ✅ |
| **Cart** | `DELETE`| `/cart/:productId` | Remove item from cart | ✅ |
| **Orders** | `POST` | `/orders/create-payment-order` | Validate stock & create Razorpay order | ✅ |
| **Orders** | `POST` | `/orders/verify-payment` | Verify HMAC signature & place order | ✅ |
| **Orders** | `GET` | `/orders` | View user order history | ✅ |
| **Orders** | `GET` | `/orders/:id` | View specific order & live tracker | ✅ |

---

## 👤 Author
- **Annav Wadhwa**
