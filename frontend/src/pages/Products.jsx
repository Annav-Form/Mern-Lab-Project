import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "",
  });

  // Debounce helper for search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.category) params.category = filters.category;
      if (filters.sort) params.sort = filters.sort;

      const res = await getAllProducts(params);
      setProducts(res.data.products);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Something went wrong while loading products.");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.category, filters.sort, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">🛍️ Products</h1>
          <p className="page-subtitle">
            Discover our collection of amazing products
          </p>
        </div>

        {/* Search & Filter */}
        <SearchBar
          search={filters.search}
          category={filters.category}
          sort={filters.sort}
          onChange={handleFilterChange}
        />

        {/* Loading State */}
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-title">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-container">
            <span className="state-icon">⚠️</span>
            <p className="state-title">{error}</p>
            <button className="btn btn-outline" onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="state-container">
            <span className="state-icon">🔍</span>
            <p className="state-title">No products found</p>
            <p className="state-subtitle">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginBottom: "20px",
              }}
            >
              Showing {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
