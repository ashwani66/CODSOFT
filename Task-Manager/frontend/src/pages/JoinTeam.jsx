import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function JoinTeam() {
  const [teamCode, setTeamCode] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!teamCode) return addToast({ type: 'error', message: 'Team code required' });

    try {
      const res = await api.post('/projects/join', { teamCode });
      addToast({ type: 'success', message: `Joined team "${res.data.project.title}"!` });
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to join team' });
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleJoin}>
        <h2>Join Team</h2>
        <input placeholder="Enter Team Code" value={teamCode} onChange={e => setTeamCode(e.target.value)} />
        <button className="btn" type="submit">Join Team</button>
      </form>
    </div>
  );
}
