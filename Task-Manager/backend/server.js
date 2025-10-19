const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ------------------ Middleware ------------------
app.use(cors());
app.use(express.json());

// ------------------ Config ------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ------------------ Database ------------------
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ------------------ Models ------------------
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Team = require('./models/Team'); 

// ------------------ Routes ------------------
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes'); 

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes); 

// ------------------ Default Route ------------------
app.get('/', (req, res) => {
  res.json({ message: '🚀 Project Management API is running' });
});

// ------------------ 404 Handler ------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ------------------ Global Error Handler ------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ------------------ Start Server ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
