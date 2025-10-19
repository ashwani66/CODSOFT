import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeToken, getToken } from '../services/api';
import "./navbar.css"

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    const handleStorageChange = () => setToken(getToken());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  function handleLogout() {
    removeToken();
    setToken(null);
    navigate('/login');
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand" aria-label="Go to homepage">ProjManage</Link>
      </div>

      <div className="nav-right">
        {token ? (
          <>
            <Link to="/create-team" className="btn" aria-label="Create Team">Create Team</Link>
            <Link to="/join-team" className="btn" aria-label="Join Team">Join Team</Link>
            <Link to="/create-project" className="btn">Create Project</Link>
            <Link to="/create-task" className="btn" aria-label="Create Task">Create Task</Link>
            <button className="btn ghost" onClick={handleLogout} aria-label="Logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn ghost" aria-label="Login">Login</Link>
            <Link to="/register" className="btn" aria-label="Register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
