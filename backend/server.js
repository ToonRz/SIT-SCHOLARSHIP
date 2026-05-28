const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { migrate } = require('./migrate');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const scholarshipsRoutes = require('./routes/scholarships');
const applicationsRoutes = require('./routes/applications');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup — allow any localhost port in dev (Vite may use 5174+ if 5173 is taken)
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin
    ? corsOrigin.split(',').map((o) => o.trim())
    : (origin, callback) => {
        if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true
}));

app.use(express.json());
app.use('/api/uploads/applications', express.static(path.join(__dirname, 'uploads/applications')));

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
app.use('/api/recommendations', recommendationsRoutes);

// Error Handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
