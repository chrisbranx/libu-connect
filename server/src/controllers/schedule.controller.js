const prisma = require('../config/db');

async function getSchedules(req, res) {
  try {
    const { week, month } = req.query;
    const userId = req.user.id;

    const where = { userId };

    if (week) {
      const weekDate = new Date(week);
      const startOfWeek = new Date(weekDate);
      startOfWeek.setDate(weekDate.getDate() - weekDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      where.startTime = { gte: startOfWeek, lt: endOfWeek };
    } else if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

      where.startTime = { gte: startOfMonth, lte: endOfMonth };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    res.status(200).json({ data: schedules });
  } catch (error) {
    console.error('GetSchedules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUpcoming(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const schedules = await prisma.schedule.findMany({
      where: {
        userId,
        startTime: { gte: now, lte: sevenDays },
      },
      orderBy: { startTime: 'asc' },
    });

    res.status(200).json({ data: schedules });
  } catch (error) {
    console.error('GetUpcoming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createSchedule(req, res) {
  try {
    const { title, description, type, course, lecturer, location, startTime, endTime, isRecurring, recurDays, color, reminder } = req.body;

    if (!title || !type || !startTime || !endTime) {
      return res.status(400).json({ error: 'title, type, startTime, and endTime are required' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId: req.user.id,
        title,
        description,
        type,
        course,
        lecturer,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isRecurring: isRecurring || false,
        recurDays: recurDays || [],
        color: color || '#1E1B4B',
        reminder: reminder || null,
      },
    });

    res.status(201).json({ data: schedule });
  } catch (error) {
    console.error('CreateSchedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateSchedule(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, type, course, lecturer, location, startTime, endTime, isRecurring, recurDays, color, reminder } = req.body;

    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this schedule' });
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(course !== undefined && { course }),
        ...(lecturer !== undefined && { lecturer }),
        ...(location !== undefined && { location }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurDays !== undefined && { recurDays }),
        ...(color !== undefined && { color }),
        ...(reminder !== undefined && { reminder }),
      },
    });

    res.status(200).json({ data: schedule });
  } catch (error) {
    console.error('UpdateSchedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteSchedule(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this schedule' });
    }

    await prisma.schedule.delete({ where: { id } });

    res.status(200).json({ data: { message: 'Schedule deleted successfully' } });
  } catch (error) {
    console.error('DeleteSchedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getSchedules, getUpcoming, createSchedule, updateSchedule, deleteSchedule };
