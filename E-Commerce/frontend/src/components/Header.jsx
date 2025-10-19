import { useState, useEffect, useContext, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import "./header.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const menuRef = useRef(null);

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

  // ---------- Scroll to Top ----------
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  // ---------- Handle Search ----------
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      scrollToTop();
    }
  };

  // ---------- Handle Admin Dropdown ----------
  const handleAdminClick = (e) => {
    e.stopPropagation();
    setAdminOpen(!adminOpen);
  };

  // ---------- Handle Logout ----------
  const handleLogout = () => {
    localStorage.removeItem("token");
    if (logout) logout();
    navigate("/login");
    scrollToTop();
  };

  // ---------- Close menu when clicking outside ----------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setAdminOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="header" ref={menuRef}>
      {/* ---------- Logo ---------- */}
      <div className="logo">
        <NavLink
          to="/"
          end
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
            scrollToTop();
          }}
        >
          <img className="logo-img" src="/logo.png" alt="Logo" />
        </NavLink>
      </div>

      {/* ---------- Search Bar ---------- */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">
          <FaSearch size={24} color="gray" />
        </button>
      </form>

      {/* ---------- Hamburger ---------- */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* ---------- Navigation ---------- */}
      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink to="/" end onClick={scrollToTop}>
          Home
        </NavLink>
        <NavLink to="/products" onClick={scrollToTop}>
          Products
        </NavLink>
        <NavLink to="/cart" onClick={scrollToTop}>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          🛒Cart
        </NavLink>
        <NavLink to="/checkout" onClick={scrollToTop}>
          Checkout
        </NavLink>

        {!user && (
          <>
            <NavLink to="/login" onClick={scrollToTop}>
              Login
            </NavLink>
            <NavLink to="/register" onClick={scrollToTop}>
              Register
            </NavLink>
          </>
        )}

        {user && (
          <button className="logout-bttn" onClick={handleLogout}>
            <FaSignOutAlt size={16} /> Logout
          </button>
        )}

        {user && user.isAdmin && (
          <div
            className={`admin-menu ${adminOpen ? "active" : ""}`}
            onClick={handleAdminClick}
          >
            <span>Admin ▼</span>
            <div className="dropdown" onClick={scrollToTop}>
              <NavLink to="/admin">Dashboard</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/products">Products</NavLink>
              <NavLink to="/admin/orders">Orders</NavLink>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
