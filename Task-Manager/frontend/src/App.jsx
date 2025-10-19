import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import CreateProject from './pages/CreateProject';
import CreateTeam from './pages/CreateTeam';
import JoinTeam from './pages/JoinTeam';
import CreateTask from './pages/CreateTask'; // new
import Login from './pages/Login';
import Register from './pages/Register';
import { getToken } from './services/api';
import { ToastProvider } from './components/ToastContext';

// Auth wrapper
function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/projects/:id" element={<RequireAuth><ProjectPage /></RequireAuth>} />
        <Route path="/create-team" element={<RequireAuth><CreateTeam /></RequireAuth>} />
        <Route path="/join-team" element={<RequireAuth><JoinTeam /></RequireAuth>} />
        <Route path="/create-project" element={<RequireAuth><CreateProject /></RequireAuth>} />
<Route path="/create-task" element={<RequireAuth><CreateTask /></RequireAuth>} />


        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
