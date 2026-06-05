const prisma = require('../config/db');

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ data: { notifications, unreadCount } });
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({ data: notification });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ data: { message: 'All notifications marked as read' } });
  } catch (error) {
    console.error('MarkAllAsRead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.notification.delete({ where: { id } });

    res.status(200).json({ data: { message: 'Notification deleted' } });
  } catch (error) {
    console.error('DeleteNotification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updatePreferences(req, res) {
  try {
    res.status(200).json({ data: { message: 'Notification preferences updated' } });
  } catch (error) {
    console.error('UpdatePreferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function broadcast(req, res) {
  try {
    const { department, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const where = {};
    if (department) {
      where.department = department;
    }

    const users = await prisma.user.findMany({ where, select: { id: true } });

    const notifications = users.map((user) => ({
      userId: user.id,
      title: 'Broadcast',
      message,
      type: 'broadcast',
    }));

    await prisma.notification.createMany({ data: notifications });

    res.status(200).json({ data: { message: `Broadcast sent to ${users.length} users` } });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, updatePreferences, broadcast };
