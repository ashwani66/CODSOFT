import React, { useEffect, useState, useRef } from "react";
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
  const [currentUser, setCurrentUser] = useState(null);

  const dropdownRef = useRef(null);

  // ---------- Close dropdown when clicking outside ----------
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

  // ---------- Load current user ----------
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")); // { id, name }
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  // ---------- Fetch current product ----------
  useEffect(() => {
    const fetchCurrentProduct = async () => {
      try {
        const products = await fetchProducts();
        const currentProduct = products.find((p) => p._id === id);
        if (currentProduct) {
          setProduct(currentProduct);
          setMainImage(
            `${API}/${currentProduct.images[0]?.medium || currentProduct.images[0]?.small}`
          );
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

    if (!currentUser) {
      return alert("❌ Please log in first to write a review!");
    }

    const reviewData = {
      product: product._id,
      user: currentUser.id,
      userName: currentUser.name,
      rating: newReview.rating,
      comment: newReview.comment,
    };

    try {
      const savedReview = await addReview(reviewData);
      setReviews([savedReview, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      alert("✅ Review submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to submit review");
    }
  };

  // ---------- Handle add to cart ----------
  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`🛒 ${product.name} added to cart!`);
      } else {
        alert(`❌ Failed to add to cart: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);
      alert("⚠️ Server error while adding to cart");
    }
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
          {product.images.map((imgObj, i) => (
            <img
              key={i}
              src={`${API}/${imgObj.small}`}
              alt={`thumb-${i}`}
              onClick={() =>
                setMainImage(`${API}/${imgObj.medium || imgObj.small}`)
              }
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
              document
                .getElementById("review-form")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            ⭐ Rate this Product
          </button>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>Customer Reviews</h3>

          {/* Review Form */}
          {currentUser ? (
            <form
              id="review-form"
              className="review-form"
              onSubmit={handleReviewSubmit}
            >
              <label>Rating:</label>

              {/* Custom Dropdown */}
              <div
                className="custom-dropdown"
                ref={dropdownRef}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="selected-option">
                  {newReview.rating} ⭐
                  <span className="arrow-dropdown">
                    {dropdownOpen ? "▲" : "▼"}
                  </span>
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
          ) : (
            <p className="login-alert">
              ❌ Please log in first to write a review!
            </p>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first one!</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-card">
                  <p className="review-user">
                    <b>{r.userName || r.user}</b> -{" "}
                    {new Date(r.createdAt || r.date).toLocaleString()}
                  </p>
                  <p className="review-rating">{"⭐".repeat(r.rating || 0)}</p>
                  <p className="review-comment">{r.comment}</p>

                  {/* Delete button for own reviews */}
                  {currentUser?.id === r.user && (
                    <button
                      className="delete-btn"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Are you sure you want to delete this review?"
                          )
                        )
                          return;
                        try {
                          await fetch(`${API}/api/reviews/${r._id}`, {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "token"
                              )}`,
                            },
                          });
                          setReviews(reviews.filter((rev) => rev._id !== r._id));
                          alert("✅ Review deleted successfully");
                        } catch (err) {
                          console.error(err);
                          alert("❌ Failed to delete review");
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="related-card"
                >
                  <img
                    src={
                      item.images?.[0]?.small
                        ? `${API}/${item.images[0].small}`
                        : "/images/no-image.png"
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
