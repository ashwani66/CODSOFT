import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function CreateTeam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return addToast({ type: 'error', message: 'Team title required' });

    try {
      const res = await api.post('/projects', { title, description });
      addToast({ type: 'success', message: `Team "${res.data.title}" created!` });
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      addToast({ type: 'error', message: 'Could not create team' });
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Create Team</h2>
        <input placeholder="Team title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
        <button className="btn" type="submit">Create Team</button>
      </form>
    </div>
  );
}
