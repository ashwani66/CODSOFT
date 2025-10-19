import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { saveToken } from '../services/api';
import { useToast } from '../components/ToastContext';
import './register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return addToast({ type: 'error', message: 'All fields required' });

    try {
      const res = await api.post('/users/register', { name, email, password });
      saveToken(res.data.data.token); // ✅ Correct path
      addToast({ type: 'success', message: 'Account created' });
      navigate('/dashboard');
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Register failed' });
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn" type="submit">Register</button>
      </form>
    </div>
  );
}
