import { useState } from "react";
import "./adminProductForm.css";

const API = import.meta.env.VITE_API_BASE_URL;

const AdminProductForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([null, null, null, null]);
  const [previews, setPreviews] = useState([null, null, null, null]);

  const [reviews, setReviews] = useState([]);
  const [reviewUser, setReviewUser] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // ---------- Image Preview ----------
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages[index] = file;
    newPreviews[index] = file ? URL.createObjectURL(file) : null;
    setImages(newImages);
    setPreviews(newPreviews);
  };

  // ---------- Sizes ----------
  const handleSizeChange = (e) => {
    const value = e.target.value;
    setSizes(sizes.includes(value) ? sizes.filter(s => s !== value) : [...sizes, value]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSizes(allSizes);
    } else {
      setSizes([]);
    }
  };

  // ---------- Reviews ----------
  const addReview = () => {
    if (!reviewUser || !reviewRating) return alert("User and rating required");
    setReviews([...reviews, { user: reviewUser, rating: reviewRating, comment: reviewComment }]);
    setReviewUser("");
    setReviewRating(5);
    setReviewComment("");
  };

  const removeReview = (index) => setReviews(reviews.filter((_, i) => i !== index));

  // ---------- Submit Form ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !description || !category || !images[0]) {
      return alert("Please fill all fields and select at least the first image.");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("reviews", JSON.stringify(reviews));

    // Append files
    images.forEach((img, idx) => {
      if (img) formData.append("images", img); // send files as 'images'
    });

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });

      if (res.ok) {
        alert("Product uploaded successfully!");
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setSizes([]);
        setImages([null, null, null, null]);
        setPreviews([null, null, null, null]);
        setReviews([]);
      } else {
        const err = await res.json();
        alert("Error uploading product: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server error while uploading product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />

      <select value={category} onChange={e => setCategory(e.target.value)} required>
        <option value="">Select Category</option>
        {["Shirts","Shoes","Pants","Accessories","Electronics","Bags","Hats","Jackets","Watches"].map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <div className="sizes-container">
        <label>
          <input type="checkbox" checked={sizes.length === allSizes.length} onChange={handleSelectAll} /> Select All
        </label>
        {allSizes.map(size => (
          <label key={size}>
            <input type="checkbox" value={size} checked={sizes.includes(size)} onChange={handleSizeChange} /> {size}
          </label>
        ))}
      </div>

      <div className="images-container">
        {images.map((_, idx) => (
          <div key={idx} className="image-box">
            <input type="file" onChange={e => handleImageChange(e, idx)} />
            {previews[idx] && (
              <div className="image-wrapper">
                <img src={previews[idx]} alt={`preview ${idx+1}`} />
                <span className="image-overlay">Change</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="reviews-container">
        <h4>Add Reviews (Optional)</h4>
        <input placeholder="User ID" value={reviewUser} onChange={e => setReviewUser(e.target.value)} />
        <input type="number" min="1" max="5" value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} />
        <input placeholder="Comment" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
        <button type="button" onClick={addReview}>Add Review</button>

        {reviews.length > 0 && (
          <ul>
            {reviews.map((r, i) => (
              <li key={i}>
                {r.user} - {r.rating}⭐ : {r.comment}
                <button type="button" onClick={() => removeReview(i)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit">Upload Product</button>
    </form>
  );
};

export default AdminProductForm;
