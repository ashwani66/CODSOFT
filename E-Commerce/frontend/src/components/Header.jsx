import { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {FaSearch} from "react-icons/fa"
import axios from "axios";
import "./header.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Header = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // <-- search state

  const token = localStorage.getItem("token");

  // ---------- Fetch cart count ----------
  const fetchCartCount = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const total =
        res.data.products?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      setCartCount(total);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [token]);

  const handleAdminClick = (e) => {
    e.stopPropagation();
    if (user && user.isAdmin) {
      setAdminOpen(!adminOpen);
    } else {
      navigate("/register");
    }
  };

  // ---------- Handle Search ----------
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); // clear input after search
      setMenuOpen(false); // close mobile menu
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <NavLink to="/" end>
        <img className="logo-img" src="/logo.png" alt="" />
        </NavLink>
      </div>

      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit"><FaSearch size={24} color="gray" /></button>
      </form>

      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
          Products
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          🛒Cart
        </NavLink>
        <NavLink to="/checkout" className={({ isActive }) => (isActive ? "active" : "")}>
          Checkout
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
          Login
        </NavLink>
        <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
          Register
        </NavLink>

        <div
          className={`admin-menu ${adminOpen ? "active" : ""}`}
          onClick={handleAdminClick}
        >
          <span>Admin ▼</span>
          <div className="dropdown">
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Orders
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
