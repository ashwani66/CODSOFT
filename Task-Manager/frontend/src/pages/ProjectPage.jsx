import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getToken } from '../services/api';
import { useToast } from '../components/ToastContext';
import FilterBar from '../components/FilterBar';
import ConfirmModal from '../components/ConfirmModal';
// import jwt_decode from 'jwt-decode';
import "./projectPage.css";

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetTask, setTargetTask] = useState(null);
  const { addToast } = useToast();

  const userId = getTokenUserId();

  useEffect(() => {
    fetchProject();
  }, [id]);

  async function fetchProject() {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Could not load project' });
    }
  }

  // ---------------- Add Task ----------------
  async function handleAddTask(e) {
    e.preventDefault();
    if (!title.trim()) return addToast({ type: 'error', message: 'Task title required' });

    try {
      const res = await api.post(`/tasks/${id}`, { title, assigneeName, deadline });
      setTasks(prev => [res.data, ...prev]);
      setTitle('');
      setAssigneeName('');
      setDeadline('');
      addToast({ type: 'success', message: 'Task added' });
    } catch (err) {
      addToast({ type: 'error', message: 'Could not add task' });
    }
  }

  // ---------------- Update Task ----------------
  async function updateStatus(taskId, newStatus) {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      addToast({ type: 'error', message: 'Could not update task' });
    }
  }

  // ---------------- Delete Task ----------------
  async function deleteTask(taskId) {
    if (!taskId) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      addToast({ type: 'success', message: 'Task deleted' });
    } catch (err) {
      addToast({ type: 'error', message: 'Could not delete task' });
    }
  }

  // ---------------- Remove Member ----------------
  async function removeMember(memberId) {
    try {
      const res = await api.post(`/projects/${project._id}/remove-member`, { memberId });
      setProject(res.data.project);
      addToast({ type: 'success', message: 'Member removed' });
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to remove member' });
    }
  }

  // ---------------- Helpers ----------------
  function computeProgress() {
    if (!tasks || tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'Done').length;
    return Math.round((done / tasks.length) * 100);
  }

  function getTokenUserId() {
    const token = getToken();
    if (!token) return null;
    try {
      const decoded = jwt_decode(token);
      return decoded.id || decoded._id; // adjust based on your JWT payload
    } catch {
      return null;
    }
  }

  const filteredTasks = tasks.filter(t => {
    const okStatus = filterStatus === 'All' || t.status === filterStatus;
    const okAssignee = !filterAssignee || (t.assigneeName || '').toLowerCase().includes(filterAssignee.toLowerCase());
    return okStatus && okAssignee;
  });

  // ---------------- Render ----------------
  return (
    <div className="container">
      <div className="card project-header">
        <h2>{project?.title}</h2>
        <p>{project?.description}</p>
        <div className="progress-row">
          <div className="progress-bar">
            <div className="fill" style={{ width: computeProgress() + '%' }} />
          </div>
          <small>{computeProgress()}% complete</small>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <form className="card" onSubmit={handleAddTask}>
            <h3>Add Task</h3>
            <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Assignee name" value={assigneeName} onChange={e => setAssigneeName(e.target.value)} />
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <button className="btn" type="submit" disabled={!title.trim()}>Add Task</button>
          </form>

          <FilterBar
            status={filterStatus}
            assignee={filterAssignee}
            onStatusChange={setFilterStatus}
            onAssigneeChange={setFilterAssignee}
          />

          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : filteredTasks.map(task => (
              <div className="task-card" key={task._id}>
                <div>
                  <h4>{task.title}</h4>
                  <p className="meta">
                    {task.assigneeName || 'No assignee'} • {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                  </p>
                </div>
                <div className="task-actions">
                  <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)}>
                    <option>Todo</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                  <button type="button" className="btn ghost" onClick={() => { setTargetTask(task); setConfirmOpen(true); }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="card">
            <h3>Project Info</h3>
            <p>Owner: {project?.owner?.name || 'Unknown'}</p>
            <p>Tasks: {tasks.length}</p>
            <h3>Team Members</h3>
            <ul>
              {project?.members?.map(m => (
                <li key={m._id}>
                  {m.name} ({m.email})
                  {project?.owner?._id === userId && (
                    <button className="btn danger small" onClick={() => removeMember(m._id)}>Remove</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <ConfirmModal
        visible={confirmOpen}
        title="Delete Task"
        message={`Delete task "${targetTask?.title}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { deleteTask(targetTask?._id); setConfirmOpen(false); }}
      />
    </div>
  );
}
