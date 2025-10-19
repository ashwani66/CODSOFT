import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { saveToken } from '../services/api';
import { useToast } from '../components/ToastContext';
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return addToast({ type: 'error', message: 'Email and password required' });

    setLoading(true);
    try {
      const res = await api.post('/users/login', { email, password });
      saveToken(res.data.data.token); // ✅ Correct path
      addToast({ type: 'success', message: 'Logged in successfully' });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email"/>
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
        <button className="btn" type="submit" disabled={loading || !email || !password}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
