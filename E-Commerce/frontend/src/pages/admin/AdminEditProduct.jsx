import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProducts, updateProduct } from "../../api/products";
import "./adminEditProduct.css";


const API = import.meta.env.VITE_API_BASE_URL;

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [oldImages, setOldImages] = useState([null, null, null, null]);
  const [newImages, setNewImages] = useState([null, null, null, null]);
  const [previewNewImages, setPreviewNewImages] = useState([null, null, null, null]);

  const fileInputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    const fetchProductById = async () => {
      try {
        const res = await fetchProducts();
        const p = res.find((prod) => prod._id === id);
        if (!p) throw new Error("Product not found");

        setProduct(p);
        setName(p.name);
        setPrice(p.price);
        setDescription(p.description);
        setCategory(p.category);

        const filledOld = p.images.slice(0, 4).concat(Array(4 - p.images.length).fill(null));
        setOldImages(filledOld);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductById();

    // Cleanup preview URLs to prevent memory leaks
    return () => {
      previewNewImages.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [id]);

  const handleImageBoxClick = (index) => {
    fileInputRefs[index].current?.click();
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const updatedNew = [...newImages];
    updatedNew[index] = file;
    setNewImages(updatedNew);

    const updatedPreviews = [...previewNewImages];
    // Revoke old preview URL if exists
    if (updatedPreviews[index]) URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews[index] = URL.createObjectURL(file);
    setPreviewNewImages(updatedPreviews);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);

      newImages.forEach((img) => img && formData.append("images", img));

      await updateProduct(id, formData);
      navigate("/admin/products");
    } catch (err) {
      setError("Failed to update product");
      console.error(err);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-container">
      <form onSubmit={handleUpdate} className="admin-product-form">
        <h4>Edit Product</h4>

        <label>Name:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Price:</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Category:</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />

        <label>Old Images</label>
        <div className="images-container">
          {oldImages.map((img, idx) =>
            img ? (
              <div className="image-box" key={idx}>
                <img src={img.startsWith("http") ? img : `${API}/${img}`} alt={`Old ${idx}`} />
              </div>
            ) : (
              <div className="image-box placeholder" key={idx}>
                No Image
              </div>
            )
          )}
        </div>

        <label>Update Images</label>
        <div className="images-container">
          {previewNewImages.map((img, idx) => (
            <div className="image-box" key={idx} onClick={() => handleImageBoxClick(idx)}>
              <div className="image-wrapper">
                {img ? <img src={img} alt={`New Preview ${idx}`} /> : <div className="placeholder">Click to upload</div>}
                <input
                  ref={fileInputRefs[idx]}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(e, idx)}
                />
              </div>
            </div>
          ))}
        </div>

        <button type="submit">Update Product</button>
      </form>
    </div>
  );
};

export default AdminEditProduct;
