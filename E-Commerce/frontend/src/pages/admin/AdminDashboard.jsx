import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CgArrowLeftR, CgArrowRightR } from 'react-icons/cg';

import { useState } from "react";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Collapse sidebar on nav click (desktop)
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    } 
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? "" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <h2 className="logo">{sidebarOpen ? "Admin Panel" : "AP"}</h2>

        {/* Toggle Button */}
        <button className="manual-toggle-btn" onClick={toggleSidebar}>
            {sidebarOpen ? <CgArrowLeftR size={24} /> : <CgArrowRightR size={24} />}
        </button>

        <nav>
          <ul>
            <li>
              <NavLink
                to="/"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="icon">🏠</span>
                <span className="text">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/products"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="icon">📄</span>
                <span className="text">Products</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/adminproductform"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="icon">➕</span>
                <span className="text">Add Product</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="icon">👥</span>
                <span className="text">Users</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/orders"
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="icon">🛒</span>
                <span className="text">Orders</span>
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

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
