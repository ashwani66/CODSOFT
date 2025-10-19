const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();
const crypto = require('crypto');

// ---------------------- Get all projects for logged-in user ----------------------
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Create a new project ----------------------
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const teamCode = crypto.randomBytes(4).toString('hex');

    const project = new Project({
      title,
      description,
      owner: req.user._id,
      teamCode,
      members: []
    });

    await project.save();
    const populatedProject = await project
      .populate('owner', 'name email')
      .execPopulate();

    res.json(populatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Get project with tasks ----------------------
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (
      project.owner._id.toString() !== req.user._id.toString() &&
      !project.members.some(m => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: project._id }).sort({ createdAt: -1 });
    res.json({ project, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Join project by team code ----------------------
router.post('/join', auth, async (req, res) => {
  try {
    const { teamCode } = req.body;
    if (!teamCode) return res.status(400).json({ message: 'Team code required' });

    const project = await Project.findOne({ teamCode });
    if (!project) return res.status(404).json({ message: 'Invalid team code' });

    if (
      project.members.includes(req.user._id) ||
      project.owner.toString() === req.user._id.toString()
    ) {
      return res.status(400).json({ message: 'You are already part of this project' });
    }

    project.members.push(req.user._id);
    await project.save();

    const populatedProject = await project
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .execPopulate();

    res.json({ message: 'Joined project successfully', project: populatedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Remove member ----------------------
router.post('/:id/remove-member', auth, async (req, res) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    project.members = project.members.filter(m => m.toString() !== memberId);
    await project.save();

    const populatedProject = await project
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .execPopulate();

    res.json({ message: 'Member removed', project: populatedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
