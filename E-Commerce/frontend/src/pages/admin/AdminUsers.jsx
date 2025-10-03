import { useEffect, useState } from "react";
import './adminUsers.css';
import { getUsers, deleteUser } from "../../api/products";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await getUsers();
      setUsers(res); // adjust if API returns {data: [...]} → setUsers(res.data)
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setSuccess("User deleted successfully!");
      // Remove the deleted user from state without refetch
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete user");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-user/${id}`);
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Manage Users</h2>

      {loading && <p>Loading users...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {!loading && users.length === 0 && !error && <p>No users found.</p>}

      {users.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? "Admin" : "User"}</td>
                <td>
                  <button className="btn edit-btn" onClick={() => handleEdit(user._id)}>Edit</button>
                  <button className="btn delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
