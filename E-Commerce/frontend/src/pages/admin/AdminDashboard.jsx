import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className={`admin-layout ${sidebarOpen ? "" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
  <h2 className="logo">{sidebarOpen ? "Admin Panel" : "AP"}</h2>

  <nav>
    <ul>
      <li>
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon">🏠</span>
          {sidebarOpen && <span className="text">Home</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon">📄</span>
          {sidebarOpen && <span className="text">Products</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/adminproductform" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon">➕</span>
          {sidebarOpen && <span className="text">Add Product</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon">👥</span>
          {sidebarOpen && <span className="text">Users</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon">🛒</span>
          {sidebarOpen && <span className="text">Orders</span>}
        </NavLink>
      </li>
      {/* New NavLink added */}
      <li>
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon">🖼️</span>
          {sidebarOpen && <span className="text">All Products</span>}
        </NavLink>
      </li>
    </ul>
  </nav>

  <button className="logout-btn" onClick={handleLogout}>
    {sidebarOpen ? "Logout" : "⏻"}
  </button>
</aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={toggleMobileMenu}></div>}

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="sidebar-btn"
            onClick={window.innerWidth <= 768 ? toggleMobileMenu : toggleSidebar}
          >
            ☰
          </button>
          <h1>Dashboard</h1>
        </header>

        {/* Dynamic page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
