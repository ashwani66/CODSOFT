import React, { useEffect, useState, useRef } from "react"; // <-- added useRef
import { useParams, Link } from "react-router-dom";
import "./productDetails.css";
import { fetchProducts, fetchReviews, addReview } from "../api/products";

const API = import.meta.env.VITE_API_BASE_URL;

const ProductDetails = () => {
  const { id } = useParams();

  // ---------- State ----------
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null); // <-- ref for custom dropdown

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ---------- Fetch current product ----------
  useEffect(() => {
    const fetchCurrentProduct = async () => {
      try {
        const products = await fetchProducts();
        const currentProduct = products.find((p) => p._id === id);
        if (currentProduct) {
          setProduct(currentProduct);
          setMainImage(`${API}/${currentProduct.images[0]}`);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchCurrentProduct();
  }, [id]);

  // ---------- Fetch all products ----------
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (err) {
        console.error("Error fetching all products:", err);
      }
    };
    loadAllProducts();
  }, []);

  // ---------- Fetch reviews ----------
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchReviews(id);
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    loadReviews();
  }, [id]);

  // ---------- Handle review submit ----------
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!product || !product._id) return;

    const reviewData = {
      product: product._id,
      user: "Guest User",
      rating: newReview.rating,
      comment: newReview.comment,
    };

    try {
      const savedReview = await addReview(reviewData);
      setReviews([savedReview, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to submit review");
    }
  };

  // ---------- Handle add to cart ----------
  const handleAddToCart = () => {
    alert(`${product.name} added to cart!`);
  };

  if (!product) return <p>Loading product...</p>;

  return (
    <div className="product-details">
      {/* ---------- Left Sticky Images ---------- */}
      <div className="images-fixed">
        <div className="main-image-container">
          <img src={mainImage} alt="Main" className="main-image" />
        </div>
        <div className="thumbnail-gallery">
          {product.images.map((img, i) => (
            <img
              key={i}
              src={`${API}/${img}`}
              alt={`thumb-${i}`}
              onClick={() => setMainImage(`${API}/${img}`)}
            />
          ))}
        </div>
      </div>

      {/* ---------- Right Content ---------- */}
      <div className="right-content">
        {/* Product Details */}
        <div className="details-section">
          <h2>{product.name}</h2>
          <p className="price">₹{product.price}</p>
          <p>{product.description}</p>
          <p>
            <b>Category:</b> {product.category}
          </p>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
          <button
            className="rate-btn"
            onClick={() => {
              const reviewForm = document.getElementById("review-form");
              reviewForm?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            ⭐ Rate this Product
          </button>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>Customer Reviews</h3>

          <form
            id="review-form"
            className="review-form"
            onSubmit={handleReviewSubmit}
          >
            <label>Rating:</label>

            {/* ---------- Custom Dropdown ---------- */}
            <div
              className="custom-dropdown"
              ref={dropdownRef}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="selected-option">
                {newReview.rating} ⭐
                <span className="arrow-dropdown">{dropdownOpen ? "▲" : "▼"}</span>
              </div>

              {dropdownOpen && (
                <div className="options">
                  {[5, 4, 3, 2, 1].map((num) => (
                    <div
                      key={num}
                      className="option"
                      onClick={() => {
                        setNewReview({ ...newReview, rating: num });
                        setDropdownOpen(false);
                      }}
                    >
                      {num} ⭐
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Write your review..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              required
            ></textarea>

            <button type="submit">Submit Review</button>
          </form>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first one!</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id || Math.random()} className="review-card">
                  <p className="review-user">
                    <b>{r.user}</b> -{" "}
                    {new Date(r.createdAt || r.date).toLocaleString()}
                  </p>
                  <p className="review-rating">{"⭐".repeat(r.rating || 0)}</p>
                  <p className="review-comment">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-section">
          <h3>Related Products</h3>
          <div className="related-grid">
            {allProducts
              .filter((item) => item._id !== product._id)
              .map((item) => (
                <Link
  key={item._id}
  to={`/products/${item._id}`}
  target="_blank"                // 👈 open in new tab
  rel="noopener noreferrer"      // 👈 security best practice
  className="related-card"
>
  <img
    src={
      item.images && item.images.length > 0
        ? `${API}/${item.images[0]}`
        : ""
    }
    alt={item.name}
  />
  <h4>{item.name}</h4>
  <p>₹{item.price}</p>
</Link>

              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
