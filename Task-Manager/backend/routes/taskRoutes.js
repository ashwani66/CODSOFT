const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ---------------------- Add task to project ----------------------
router.post('/:projectId', auth, async (req, res) => {
  try {
    const { title, assigneeName, assigneeId, deadline } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only project owner or members can add tasks
    if (
      project.owner.toString() !== req.user._id.toString() &&
      !project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let assignee = null;
    if (assigneeId) {
      assignee = await User.findById(assigneeId);
      if (!assignee) return res.status(404).json({ message: 'Assignee not found' });
    }

    const task = new Task({
      project: project._id,
      title,
      assigneeName: assigneeName || assignee?.name || null,
      assignee: assignee?._id || null,
      deadline,
    });

    await task.save();
    res.json({ message: 'Task created successfully', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Update task ----------------------
router.put('/:taskId', auth, async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findById(req.params.taskId).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only project owner or members can update tasks
    if (
      task.project.owner.toString() !== req.user._id.toString() &&
      !task.project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If assigneeId is updated
    if (updates.assigneeId) {
      const assignee = await User.findById(updates.assigneeId);
      if (!assignee) return res.status(404).json({ message: 'Assignee not found' });
      updates.assignee = assignee._id;
      updates.assigneeName = assignee.name;
      delete updates.assigneeId;
    }

    Object.assign(task, updates);
    await task.save();

    res.json({ message: 'Task updated successfully', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Delete task ----------------------
router.delete('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only project owner or members can delete tasks
    if (
      task.project.owner.toString() !== req.user._id.toString() &&
      !task.project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.remove();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
