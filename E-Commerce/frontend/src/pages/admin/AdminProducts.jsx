import { useEffect, useState } from "react";
import "./adminProducts.css";
import { fetchProducts as fetchProductsAPI, deleteProduct } from "../../api/products.js";
import { useNavigate } from "react-router-dom";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null); // track product being deleted
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetchProductsAPI();
      setProducts(res); // adjust to res.data if API returns {data: [...]}
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setSuccess("Product deleted successfully!");
      loadProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-product/${id}`);
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Manage Products</h2>

      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {!loading && products.length === 0 && !error && <p>No products found.</p>}

      {products.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>ID</th>
                <th>Name</th>
                <th>Price (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000/${p.images[0]}`}
                        alt={p.name}
                        className="product-thumbnail"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td>{p._id}</td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>
                    <button
                      className="btn edit-btn"
                      onClick={() => handleEdit(p._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn delete-btn"
                      onClick={() => handleDelete(p._id)}
                      disabled={deletingId === p._id} // disable while deleting
                    >
                      {deletingId === p._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
