import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/ToastContext';
import { Link } from 'react-router-dom';
import './dashBoard.css';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data || []);
    } catch (err) {
      addToast({ type: 'error', message: 'Could not load projects' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Your Projects</h2>
      {loading ? <p>Loading...</p> : (
        <div className="projects-list">
          {projects.map(p => (
            <Link to={`/projects/${p._id}`} key={p._id} className="project-card">
              <h4>{p.title}</h4>
              <p>{p.description}</p>
            </Link>
          ))}
          {projects.length === 0 && <p>No projects found.</p>}
        </div>
      )}
    </div>
  );
}
