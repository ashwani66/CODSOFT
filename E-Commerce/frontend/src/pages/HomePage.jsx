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

      if (res.ok) alert("Product added to cart!");
      else {
        const err = await res.json();
        alert("Error adding to cart: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server error while adding to cart");
    }
  };

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

      {/* ---------- Products Grid ---------- */}
      <h2>Top Products</h2>
      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <Link to={`/products/${product._id}`} className="product-link">
                <img
                  src={product.images?.[0] ? `${API}/${product.images[0]}` : ""}
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
          <p className="loading-text">Loading Products...</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
