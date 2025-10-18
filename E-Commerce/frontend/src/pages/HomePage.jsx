import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./homePage.css";

const API = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    "/images-banner/1.png",
    "/images-banner/2.png",
    "/images-banner/3.png",
    "/images-banner/4.png",
    "/images-banner/5.png",
  ];

  const categories = [
    { name: "Accessories", banner: "/images-banner/accessories.png" },
    { name: "Shirts", banner: "/images-banner/shirts.png" },
    { name: "Shoes", banner: "/images-banner/shoes.png" },
    { name: "Pants", banner: "/images-banner/pants.png" },
    { name: "Electronics", banner: "/images-banner/electronics.png" },
    { name: "Bags", banner: "/images-banner/bags.png" },
    { name: "Hats", banner: "/images-banner/hats.png" },
    { name: "Jackets", banner: "/images-banner/jackets.png" },
    { name: "Watches", banner: "/images-banner/watches.png" },
  ];

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Carousel auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  // Handle Add to Cart
  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const response = await res.json();

      if (res.ok) {
        alert("Product added to cart!");
      } else {
        alert(`Error adding to cart: ${response.message}`);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Server error while adding to cart.");
    }
  };

  // Filter products by category
  const getCategoryProducts = (category) =>
    products.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );

  return (
    <div className="homepage">
      {/* -------- Carousel -------- */}
      <section className="carousel">
        <button className="arrow left" onClick={prevSlide}>
          ❮
        </button>

        <div
          className="carousel-inner"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`slide-${idx}`}
              className="carousel-img"
              loading="lazy"
            />
          ))}
        </div>

        <button className="arrow right" onClick={nextSlide}>
          ❯
        </button>

        <div className="dots">
          {banners.map((_, idx) => (
            <span
              key={idx}
              className={idx === currentSlide ? "dot active" : "dot"}
              onClick={() => setCurrentSlide(idx)}
            ></span>
          ))}
        </div>
      </section>

      {/* -------- Category Sections -------- */}
      {categories.map((cat) => {
        const categoryProducts = getCategoryProducts(cat.name).slice(0, 6);

        return (
          <section key={cat.name} className="category-section">
            <div className="category-banner">
              <Link to={`/products?category=${cat.name.toLowerCase()}`}>
                <img
                  src={cat.banner}
                  alt={`${cat.name} banner`}
                  loading="lazy"
                />
              </Link>
            </div>

            <div className="category-header">
              <h2>{cat.name}</h2>
              <Link
                to={`/products?category=${cat.name.toLowerCase()}`}
                className="view-all"
              >
                View All →
              </Link>
            </div>

            <div className="products-grid">
              {categoryProducts.length > 0 ? (
                categoryProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    imageSize="small"
                  />
                ))
              ) : (
                <p className="loading-text">No products found in {cat.name}</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default HomePage;
