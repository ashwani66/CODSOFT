import { useEffect, useState } from "react";
import { fetchOrders, updateOrder, deleteOrder } from "../../api/products";
import "./adminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetchOrders();
      setOrders(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingOrderId(id);
      await updateOrder(id, { status });
      setSuccess("Order status updated successfully!");
      loadOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id);
      setSuccess("Order deleted successfully!");
      loadOrders();
    } catch (err) {
      console.error("Failed to delete order:", err);
      setError(err.message || "Failed to delete order");
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Manage Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {!loading && orders.length === 0 && !error && <p>No orders placed yet.</p>}

      {orders.length > 0 && (
        // <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Products</th>
                <th>Amount (₹)</th>
                <th>Payment Method</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.userId?.name || "N/A"}</td>
                  <td>
                    {order.products?.map((p, idx) => (
                      <div key={p.productId?._id || idx}>
                        {p.productId?.name || "Unknown"} × {p.quantity || 1}
                      </div>
                    ))}
                  </td>
                  <td>{order.amount || "N/A"}</td>
                  <td>{order.paymentMethod || "N/A"}</td>
                  <td>{new Date(order.createdAt)?.toLocaleString() || "N/A"}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      disabled={updatingOrderId === order._id}
                    >
                      {["Pending", "Processing", "Shipped", "Delivered"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn delete-btn"
                      onClick={() => handleDelete(order._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        // </div>
      )}
    </div>
  );
};

export default AdminOrders;
