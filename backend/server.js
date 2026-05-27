const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const scholarshipsRoutes = require('./routes/scholarships');
const applicationsRoutes = require('./routes/applications');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/scholarships', scholarshipsRoutes);
app.use('/api/applications', applicationsRoutes);

// Error Handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
