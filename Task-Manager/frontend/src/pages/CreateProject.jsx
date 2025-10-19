import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/ToastContext';
import './projectPage.css';

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return addToast({ type: 'error', message: 'Project title is required' });

    try {
      const res = await api.post('/projects', { title, description });
      addToast({ type: 'success', message: `Project "${res.data.title}" created!` });
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create project' });
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Create Project</h2>
        <input
          placeholder="Project Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button className="btn" type="submit">Create Project</button>
      </form>
    </div>
  );
}
