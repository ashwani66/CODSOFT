import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./adminEditProduct.css";
import { fetchProductById, updateProduct } from "../../api/products.js";

const API = import.meta.env.VITE_API_BASE_URL;

export const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  // Handle image selection
  const handleImageChange = (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;

    const updatedImages = [...product.images];
    updatedImages[idx] = {
      ...updatedImages[idx],
      file, // store file for upload
      preview: URL.createObjectURL(file) // preview new image
    };

    setProduct({ ...product, images: updatedImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("category", product.category);
      formData.append("description", product.description);

      // Append images: use file if selected, else keep original URL
      product.images.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      await updateProduct(id, formData);
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="admin-edit-product admin-product-form">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />

        <label>Price:</label>
        <input
          type="number"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
        />

        <label>Category:</label>
        <input
          type="text"
          value={product.category}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
        />

        <label>Description:</label>
        <textarea
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
        />

        {/* Images preview & update */}
        <div className="images-preview images-container">
          {product.images?.map((img, idx) => (
            <div className="image-box" key={idx}>
              <div className="image-wrapper">
                <img
                  src={img.preview || (img.small ? `${API}/${img.small}` : `${API}/${img.large}`)}
                  alt={`img-${idx}`}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, idx)}
              />
            </div>
          ))}
        </div>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default AdminEditProduct;
