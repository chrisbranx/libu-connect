const prisma = require('../config/db');

async function createNotification(userId, title, message, type, link, io) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });

  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }

  return notification;
}

module.exports = {
  createNotification,
};
