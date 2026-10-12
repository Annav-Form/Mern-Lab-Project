const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Accessories",
  "Footwear",
  "Books",
  "Home",
  "Sports",
  "Beauty",
  "Toys",
  "Food",
];

/**
 * SearchBar component — search input + category dropdown + sort dropdown.
 * Calls onChange({ search, category, sort }) whenever any filter changes.
 */
export default function SearchBar({ search, category, sort, onChange }) {
  return (
    <div className="products-controls">
      {/* Search */}
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          id="product-search-input"
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onChange({ search: e.target.value, category, sort })}
        />
      </div>

      {/* Category */}
      <select
        id="category-filter"
        className="category-select"
        value={category}
        onChange={(e) => onChange({ search, category: e.target.value, sort })}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat === "All Categories" ? "" : cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Sort (Bonus) */}
      <select
        id="sort-filter"
        className="sort-select"
        value={sort}
        onChange={(e) => onChange({ search, category, sort: e.target.value })}
      >
        <option value="">Sort: Default</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
