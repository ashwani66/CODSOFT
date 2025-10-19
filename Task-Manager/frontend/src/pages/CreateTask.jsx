import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function CreateTask() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [deadline, setDeadline] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load projects' });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!projectId || !title.trim()) return addToast({ type: 'error', message: 'Project and task title are required' });

    try {
      const res = await api.post(`/tasks/${projectId}`, { title, assigneeName, deadline });
      addToast({ type: 'success', message: 'Task created successfully' });
      navigate(`/projects/${projectId}`);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to create task' });
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Create Task</h2>

        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>

        <input placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Assignee Name" value={assigneeName} onChange={e => setAssigneeName(e.target.value)} />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        <button className="btn" type="submit">Create Task</button>
      </form>
    </div>
  );
}
