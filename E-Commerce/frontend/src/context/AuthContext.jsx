// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

// ---------- Create the AuthContext ----------
export const AuthContext = createContext();

// ---------- AuthProvider Component ----------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Stores logged-in user info
  const [token, setToken] = useState(null);     // Stores JWT token
  const [loading, setLoading] = useState(true); // True while checking localStorage

  // ---------- Check localStorage on mount ----------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to load auth from localStorage:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Login function ----------
  const login = (userData, jwtToken) => {
    if (!userData || !jwtToken) {
      console.error("Login failed: userData and token are required");
      return;
    }
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  // ---------- Logout function ----------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ---------- Provide context ----------
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
