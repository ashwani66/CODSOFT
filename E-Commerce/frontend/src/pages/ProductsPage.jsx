import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import "./productsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const location = useLocation();

  // Get search query from URL
  const getSearchQuery = () => {
    return new URLSearchParams(location.search).get("search") || "";
  };

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        // Sort products by newest first (assuming createdAt exists)
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sorted);
        setFilteredProducts(sorted); // default
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const query = getSearchQuery().toLowerCase();

    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (query) {
      // If search query present -> filter
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
    } else {
      // If no search -> show newest first
      filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setFilteredProducts(filtered);
  }, [location.search, selectedCategory, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        alert("Product added to cart!");
      } else {
        const err = await res.json();
        alert("Error adding to cart: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server error while adding to cart");
    }
  };

  const categories = ["All", "Men", "Women", "Kids", "Accessories"];

  return (
    <div className="products-page">
      <div className="header-product-page">
        <h1>Products</h1>

        <div className="categories">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`category-btn ${
                selectedCategory === cat ? "active" : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products">No products found.</p>
        ) : (
          filteredProducts.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onAddToCart={handleAddToCart}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
