const express = require('express');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// ---------------------- Create Team ----------------------
router.post('/create', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Team name required' });

    // Generate unique team code
    const teamCode = crypto.randomBytes(4).toString('hex');

    const team = new Team({
      name,
      owner: req.user._id,
      teamCode,
      members: []
    });

    await team.save();
    res.json({ message: 'Team created', team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Join Team ----------------------
router.post('/join', auth, async (req, res) => {
  try {
    const { teamCode } = req.body;
    if (!teamCode) return res.status(400).json({ message: 'Team code required' });

    const team = await Team.findOne({ teamCode });
    if (!team) return res.status(404).json({ message: 'Invalid team code' });

    // Already member or owner?
    if (
      team.owner.toString() === req.user._id.toString() ||
      team.members.includes(req.user._id)
    ) {
      return res.status(400).json({ message: 'You are already part of this team' });
    }

    team.members.push(req.user._id);
    await team.save();

    res.json({ message: 'Joined team successfully', team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Get Teams for User ----------------------
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).sort({ createdAt: -1 });

    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
