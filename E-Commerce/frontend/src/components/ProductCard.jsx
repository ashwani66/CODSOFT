import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import "./productCard.css";

const API = import.meta.env.VITE_API_BASE_URL;

const ProductCard = ({ product, onAddToCart, imageSize = "small" }) => {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const avgRating = product.averageRating ? Math.round(product.averageRating) : 0;

  // ✅ Handle image URL safely and dynamically
  let imageUrl = product.images?.[0]?.[imageSize];

  if (imageUrl) {
    // If image URL doesn't start with http or https → prepend backend URL
    if (!/^https?:\/\//i.test(imageUrl)) {
      imageUrl = `${API}/${imageUrl}`;
    }
  } else {
    // Default placeholder
    imageUrl = "https://via.placeholder.com/250";
  }

  return (
    <div className="product-card">
      {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}

      <Link to={`/products/${product._id}`} className="image-link">
        <img src={imageUrl} alt={product.name} className="product-image" />
      </Link>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < avgRating ? "star-filled" : "star-empty"}
            />
          ))}
          <span className="rating-value">
            ({product.averageRating?.toFixed(1) || "0"})
          </span>
        </div>

        <div className="price-section">
          {product.oldPrice && <span className="old-price">₹{product.oldPrice}</span>}
          <span className="current-price">₹{product.price}</span>
        </div>

        <button onClick={() => onAddToCart(product._id)} className="add-to-cart-btn">
          🛒 ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
