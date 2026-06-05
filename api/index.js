require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('../server/src/middleware/rateLimit.middleware');

const authRoutes = require('../server/src/routes/auth.routes');
const scheduleRoutes = require('../server/src/routes/schedule.routes');
const notesRoutes = require('../server/src/routes/notes.routes');
const academicRoutes = require('../server/src/routes/academic.routes');
const activitiesRoutes = require('../server/src/routes/activities.routes');
const directoryRoutes = require('../server/src/routes/directory.routes');
const userRoutes = require('../server/src/routes/user.routes');
const aiRoutes = require('../server/src/routes/ai.routes');
const notificationRoutes = require('../server/src/routes/notification.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1', apiLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/grades', academicRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/api/v1/directory', directoryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
