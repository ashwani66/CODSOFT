import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Context for auth state
import { useNavigate } from "react-router-dom"; // For programmatic navigation
import "./Auth.css";

const Register = () => {
  // Get login function from AuthContext to update auth state
  const { login } = useContext(AuthContext);

  // Hook to navigate programmatically after successful registration
  const navigate = useNavigate();

  // ---------- Form state ----------
  const [name, setName] = useState("");       // User's name
  const [email, setEmail] = useState("");     // User's email
  const [password, setPassword] = useState(""); // User's password
  const [isAdmin, setIsAdmin] = useState(false); // Checkbox for admin registration

  // ---------- Handle form submission ----------
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      // POST request to backend registration endpoint
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send JSON body with user data
        body: JSON.stringify({ username: name, email, password, isAdmin }),
      });

      const data = await res.json();

      // If registration successful
      if (res.ok || data._id) {
        login(data, "");   // Auto-login the user using AuthContext
        navigate("/");     // Redirect to home page
      } else {
        // Show error message from backend
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error registering");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* ---------- Page Heading ---------- */}
        <h2>Sign Up</h2>

        {/* ---------- Registration Form ---------- */}
        <form onSubmit={handleRegister}>
          {/* Name Input */}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          {/* Admin Checkbox */}
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Register as Admin
          </label>

          {/* Submit Button */}
          <button type="submit">Register</button>
        </form>

        {/* Link to login page */}
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
