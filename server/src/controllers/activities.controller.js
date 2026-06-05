const prisma = require('../config/db');

async function getActivities(req, res) {
  try {
    const { type, department, date, all } = req.query;

    const where = all === 'true' && (req.user.role === 'ADMIN' || req.user.role === 'LECTURER') ? {} : { isPublished: true };

    if (type) {
      where.type = type;
    }
    if (department) {
      where.department = department;
    }
    if (date) {
      const filterDate = new Date(date);
      where.startDate = {
        gte: new Date(filterDate.setHours(0, 0, 0, 0)),
        lte: new Date(filterDate.setHours(23, 59, 59, 999)),
      };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        _count: { select: { participants: true } },
      },
    });

    res.status(200).json({ data: activities });
  } catch (error) {
    console.error('GetActivities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getActivity(req, res) {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.status(200).json({ data: activity });
  } catch (error) {
    console.error('GetActivity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMyActivities(req, res) {
  try {
    const userId = req.user.id;

    const participations = await prisma.activityParticipant.findMany({
      where: { userId },
      include: {
        activity: {
          include: {
            _count: { select: { participants: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const activities = participations.map((p) => p.activity);

    res.status(200).json({ data: activities });
  } catch (error) {
    console.error('GetMyActivities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createActivity(req, res) {
  try {
    const { title, description, type, organizer, location, startDate, endDate, imageUrl, department } = req.body;

    if (!title || !description || !type || !organizer || !startDate) {
      return res.status(400).json({ error: 'title, description, type, organizer, and startDate are required' });
    }

    if (!['ACADEMIC', 'SOCIAL', 'SPORTS', 'ANNOUNCEMENT', 'CLUB'].includes(type)) {
      return res.status(400).json({ error: 'Invalid activity type' });
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        type,
        organizer,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl,
        department: department || req.user.department,
      },
    });

    res.status(201).json({ data: activity });
  } catch (error) {
    console.error('CreateActivity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateActivity(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type, organizer, location, startDate, endDate, imageUrl, isPublished, department } = req.body;

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (type !== undefined) data.type = type;
    if (organizer !== undefined) data.organizer = organizer;
    if (location !== undefined) data.location = location;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (isPublished !== undefined) data.isPublished = isPublished;
    if (department !== undefined) data.department = department;

    const activity = await prisma.activity.update({ where: { id }, data });

    res.status(200).json({ data: activity });
  } catch (error) {
    console.error('UpdateActivity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteActivity(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await prisma.activity.delete({ where: { id } });

    res.status(200).json({ data: { message: 'Activity deleted successfully' } });
  } catch (error) {
    console.error('DeleteActivity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function approveActivity(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: { isPublished: true },
    });

    res.status(200).json({ data: activity });
  } catch (error) {
    console.error('ApproveActivity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function joinActivity(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const existing = await prisma.activityParticipant.findUnique({
      where: { userId_activityId: { userId, activityId: id } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Already joined this activity' });
    }

    const participant = await prisma.activityParticipant.create({
      data: { userId, activityId: id },
    });

    res.status(201).json({ data: participant });
  } catch (error) {
    console.error('JoinActivity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function leaveActivity(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.activityParticipant.findUnique({
      where: { userId_activityId: { userId, activityId: id } },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Not a participant of this activity' });
    }

    await prisma.activityParticipant.delete({
      where: { userId_activityId: { userId, activityId: id } },
    });

    res.status(200).json({ data: { message: 'Left activity successfully' } });
  } catch (error) {
    console.error('LeaveActivity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getActivities, getActivity, getMyActivities, createActivity, updateActivity, deleteActivity, approveActivity, joinActivity, leaveActivity };
