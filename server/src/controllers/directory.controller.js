const prisma = require('../config/db');

async function getDirectory(req, res) {
  try {
    const { role, department, level, search } = req.query;

    const where = { showInDirectory: true };

    if (role) {
      where.role = role;
    }
    if (department) {
      where.department = department;
    }
    if (level) {
      where.level = level;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { matricule: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        department: true,
        level: true,
        showEmail: true,
        email: true,
        showDepartment: true,
        showLevel: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    const sanitized = users.map((user) => {
      const u = { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar: user.avatar };
      if (user.showEmail) u.email = user.email;
      if (user.showDepartment || user.department) u.department = user.showDepartment ? user.department : null;
      if (user.showLevel) u.level = user.level;
      return u;
    });

    res.status(200).json({ data: sanitized });
  } catch (error) {
    console.error('GetDirectory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        department: true,
        level: true,
        email: true,
        showInDirectory: true,
        showEmail: true,
        showDepartment: true,
        showLevel: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.showInDirectory) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    };

    if (user.showEmail) profile.email = user.email;
    if (user.showDepartment) profile.department = user.department;
    if (user.showLevel) profile.level = user.level;

    res.status(200).json({ data: profile });
  } catch (error) {
    console.error('GetUserProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getDirectory, getUserProfile };
