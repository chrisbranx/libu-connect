const prisma = require('../config/db');

async function getNotes(req, res) {
  try {
    const userId = req.user.id;
    const { course, tag, visibility, search } = req.query;

    const where = { userId };

    if (course) {
      where.course = course;
    }
    if (tag) {
      where.tags = { has: tag };
    }
    if (visibility) {
      where.visibility = visibility;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });

    res.status(200).json({ data: notes });
  } catch (error) {
    console.error('GetNotes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSharedNotes(req, res) {
  try {
    const user = req.user;

    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          { visibility: 'COURSE', department: user.department },
        ],
        userId: { not: user.id },
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: notes });
  } catch (error) {
    console.error('GetSharedNotes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getNote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.userId !== userId && note.visibility === 'PRIVATE') {
      return res.status(403).json({ error: 'Not authorized to view this note' });
    }

    res.status(200).json({ data: note });
  } catch (error) {
    console.error('GetNote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createNote(req, res) {
  try {
    const { title, content, course, department, level, tags, visibility, fileUrl, fileName } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const note = await prisma.note.create({
      data: {
        userId: req.user.id,
        title,
        content,
        course,
        department,
        level,
        tags: tags || [],
        visibility: visibility || 'PRIVATE',
        fileUrl,
        fileName,
      },
    });

    res.status(201).json({ data: note });
  } catch (error) {
    console.error('CreateNote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateNote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, course, department, level, tags, visibility, fileUrl, fileName } = req.body;

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this note' });
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(course !== undefined && { course }),
        ...(department !== undefined && { department }),
        ...(level !== undefined && { level }),
        ...(tags !== undefined && { tags }),
        ...(visibility !== undefined && { visibility }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileName !== undefined && { fileName }),
      },
    });

    res.status(200).json({ data: note });
  } catch (error) {
    console.error('UpdateNote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    await prisma.note.delete({ where: { id } });

    res.status(200).json({ data: { message: 'Note deleted successfully' } });
  } catch (error) {
    console.error('DeleteNote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function togglePin(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this note' });
    }

    const note = await prisma.note.update({
      where: { id },
      data: { isPinned: !existing.isPinned },
    });

    res.status(200).json({ data: note });
  } catch (error) {
    console.error('TogglePin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function uploadAttachment(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({ data: { url: req.file.path, publicId: req.file.filename } });
  } catch (error) {
    console.error('UploadAttachment error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
}

module.exports = { getNotes, getSharedNotes, getNote, createNote, updateNote, deleteNote, togglePin, uploadAttachment };
