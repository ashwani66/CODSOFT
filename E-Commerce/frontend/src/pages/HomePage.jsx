import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./homePage.css";

const API = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [current, setCurrent] = useState(0);

  const images = [
    "/images-banner/1.png",
    "/images-banner/2.png",
    "/images-banner/3.png",
    "/images-banner/4.png",
    "/images-banner/5.png",
  ];

  // Fetch products from API
  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // Carousel auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

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

      if (res.ok) alert("✅ Product added to cart!");
      else {
        const err = await res.json();
        alert("❌ Error adding to cart: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Server error while adding to cart");
    }
  };

  // Filter products by category
  const getCategoryProducts = (category) =>
    products.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );

  // All category sections with banners
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

  return (
    <div className="homepage">
      {/* ---------- Carousel ---------- */}
      <div className="carousel">
        <button className="arrow left" onClick={prevSlide}>❮</button>
        <div
          className="carousel-inner"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`slide-${idx}`} className="carousel-img" />
          ))}
        </div>
        <button className="arrow right" onClick={nextSlide}>❯</button>
        <div className="dots">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={idx === current ? "dot active" : "dot"}
              onClick={() => setCurrent(idx)}
            ></span>
          ))}
        </div>
      </div>

      {/* ---------- Category Sections ---------- */}
      {categories.map((cat) => {
        const catProducts = getCategoryProducts(cat.name).slice(0, 6); // ✅ 6 per row
        return (
          <section key={cat.name} className="category-section">
            
            {/* ✅ Category Banner at Top */}
            <div className="category-banner">
              <Link to={`/products?category=${cat.name.toLowerCase()}`}>
                <img src={cat.banner} alt={`${cat.name} banner`} />
              </Link>
            </div>

            {/* Category Header */}
            <div className="category-header">
            
              <Link
                to={`/products?category=${cat.name.toLowerCase()}`}
                className="view-all"
              >
                View All →
              </Link>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {catProducts.length > 0 ? (
                catProducts.map((product) => (
                  <div key={product._id} className="product-card">
                    <Link to={`/products/${product._id}`} className="product-link">
                      <img
                        src={
                          product.images?.[0]
                            ? `${API}/${product.images[0]}`
                            : "/images/no-image.png"
                        }
                        alt={product.name}
                        className="product-img"
                      />
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">₹{product.price}</p>
                      <p className="product-rating">
                        {(() => {
                          const rating = product.rating || 0;
                          const fullStars = Math.floor(rating);
                          const halfStar = rating - fullStars >= 0.5;
                          const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
                          return (
                            <>
                              {"★".repeat(fullStars)}
                              {halfStar ? "½" : ""}
                              {"☆".repeat(emptyStars)}
                            </>
                          );
                        })()}
                      </p>
                    </Link>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product._id)}
                    >
                      Add to Cart
                    </button>
                  </div>
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
