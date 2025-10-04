import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Context to manage auth state
import { useNavigate } from "react-router-dom"; // For programmatic navigation
import "./auth.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  // Get login function from AuthContext to update auth state
  const { login } = useContext(AuthContext);

  // Hook to navigate programmatically after successful login
  const navigate = useNavigate();

  // ---------- Form state ----------
  const [email, setEmail] = useState("");       // User email
  const [password, setPassword] = useState(""); // User password

  // ---------- Handle form submission ----------
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submit (page reload)

    try {
      // POST request to backend login endpoint
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Send email and password
      });

      const data = await res.json(); // Parse JSON response

      // If login successful
      if (res.ok) {
        login(data.user, data.token); // Store user info and token in context
        navigate("/");                // Redirect to home page
      } else {
        // Show error message returned by backend
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in"); // Handle network or unexpected errors
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* ---------- Page Heading ---------- */}
        <h2>Login</h2>

        {/* ---------- Login Form ---------- */}
        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Submit Button */}
          <button type="submit">Login</button>
        </form>

        {/* Link to registration page */}
        <p>
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
