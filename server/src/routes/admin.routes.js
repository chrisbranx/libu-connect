const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [totalUsers, totalAdmins, totalLecturers, totalStudents, totalActivities, totalNotes, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'LECTURER' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.activity.count(),
      prisma.note.count(),
      prisma.user.count({ where: { isActive: true } }),
    ]);
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const recentActivities = await prisma.activity.count({
      where: { createdAt: { gte: thisWeek } },
    });
    res.json({ data: { totalUsers, totalAdmins, totalLecturers, totalStudents, totalActivities, totalNotes, activeSessions: activeUsers, recentActivities } });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const where = {};
    if (role && role !== 'all') where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
    const mapped = users.map((u) => ({ ...u, status: u.isActive ? 'active' : 'deactivated' }));
    res.json({ data: mapped });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/users/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'User deleted' } });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/status', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'deactivated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: status === 'active' } });
    res.json({ data: user });
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/role', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['STUDENT', 'LECTURER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json({ data: user });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/announcements', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, description, type, location, startDate, endDate } = req.body;
    const activity = await prisma.activity.create({
      data: { title, description, type: type || 'ANNOUNCEMENT', location, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, organizer: req.user.firstName + ' ' + req.user.lastName, isPublished: true },
    });
    res.status(201).json({ data: activity });
  } catch (error) {
    console.error('Admin create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/departments', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { department: { not: null } },
      select: { department: true },
      distinct: ['department'],
    });
    const departments = users.map((u) => u.department).filter(Boolean);
    res.json({ data: departments });
  } catch (error) {
    console.error('Admin departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
