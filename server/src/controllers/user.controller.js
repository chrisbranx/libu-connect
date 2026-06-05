const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        department: true,
        level: true,
        matricule: true,
        language: true,
        darkMode: true,
        showInDirectory: true,
        showEmail: true,
        showDepartment: true,
        showLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const counts = await Promise.all([
      prisma.schedule.count({ where: { userId: user.id } }),
      prisma.note.count({ where: { userId: user.id } }),
      prisma.grade.count({ where: { userId: user.id } }),
      prisma.activityParticipant.count({ where: { userId: user.id } }),
    ]);

    res.status(200).json({
      data: {
        ...user,
        stats: {
          schedulesCount: counts[0],
          notesCount: counts[1],
          gradesCount: counts[2],
          activitiesCount: counts[3],
        },
      },
    });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const { firstName, lastName, department, level, avatar, matricule } = req.body;

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (department !== undefined) data.department = department;
    if (level !== undefined) data.level = level;
    if (avatar !== undefined) data.avatar = avatar;

    if (matricule !== undefined) {
      const existing = await prisma.user.findUnique({ where: { matricule } });
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ error: 'Matricule already in use' });
      }
      data.matricule = matricule;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        department: true,
        level: true,
        matricule: true,
        language: true,
        darkMode: true,
        showInDirectory: true,
        showEmail: true,
        showDepartment: true,
        showLevel: true,
      },
    });

    res.status(200).json({ data: user });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updatePrivacy(req, res) {
  try {
    const { showInDirectory, showEmail, showDepartment, showLevel } = req.body;

    const data = {};
    if (showInDirectory !== undefined) data.showInDirectory = showInDirectory;
    if (showEmail !== undefined) data.showEmail = showEmail;
    if (showDepartment !== undefined) data.showDepartment = showDepartment;
    if (showLevel !== undefined) data.showLevel = showLevel;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        showInDirectory: true,
        showEmail: true,
        showDepartment: true,
        showLevel: true,
      },
    });

    res.status(200).json({ data: user });
  } catch (error) {
    console.error('UpdatePrivacy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateSettings(req, res) {
  try {
    const { language, darkMode } = req.body;

    const data = {};
    if (language !== undefined) data.language = language;
    if (darkMode !== undefined) data.darkMode = darkMode;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        language: true,
        darkMode: true,
      },
    });

    res.status(200).json({ data: user });
  } catch (error) {
    console.error('UpdateSettings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });

    res.status(200).json({ data: { message: 'Password changed successfully' } });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;

    await prisma.user.delete({ where: { id: userId } });

    res.clearCookie('refreshToken', { path: '/api/auth' });

    res.status(200).json({ data: { message: 'Account deleted successfully' } });
  } catch (error) {
    console.error('DeleteAccount error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getProfile, updateProfile, updatePrivacy, updateSettings, changePassword, deleteAccount };
