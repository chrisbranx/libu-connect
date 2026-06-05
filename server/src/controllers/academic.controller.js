const prisma = require('../config/db');
const { calculateGrade, calculateGradePoints, calculateGPA, calculateCameroonianGrade } = require('../utils/gpa');

async function getGrades(req, res) {
  try {
    const { semester, year, userId: queryUserId } = req.query;
    const userId = (req.user.role === 'ADMIN' || req.user.role === 'LECTURER') && queryUserId
      ? queryUserId
      : req.user.id;

    const where = { userId };
    if (semester) where.semester = semester;
    if (year) where.year = year;

    const grades = await prisma.grade.findMany({
      where,
      orderBy: [{ year: 'desc' }, { semester: 'asc' }, { course: 'asc' }],
    });

    res.status(200).json({ data: grades });
  } catch (error) {
    console.error('GetGrades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSummary(req, res) {
  try {
    const userId = req.user.id;

    const grades = await prisma.grade.findMany({ where: { userId } });

    if (grades.length === 0) {
      return res.status(200).json({
        data: {
          currentGPA: 0,
          totalCredits: 0,
          totalCourses: 0,
          bestCourse: null,
          worstCourse: null,
          distribution: {},
        },
      });
    }

    const currentGPA = calculateGPA(grades);
    const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);

    let bestCourse = grades[0];
    let worstCourse = grades[0];
    const distribution = {};

    for (const g of grades) {
      const points = calculateGradePoints(g.grade);
      if (points > calculateGradePoints(bestCourse.grade)) bestCourse = g;
      if (points < calculateGradePoints(worstCourse.grade)) worstCourse = g;

      distribution[g.grade] = (distribution[g.grade] || 0) + 1;
    }

    res.status(200).json({
      data: {
        currentGPA,
        totalCredits,
        totalCourses: grades.length,
        bestCourse: { course: bestCourse.course, courseCode: bestCourse.courseCode, grade: bestCourse.grade, score: bestCourse.score },
        worstCourse: { course: worstCourse.course, courseCode: worstCourse.courseCode, grade: worstCourse.grade, score: worstCourse.score },
        distribution,
      },
    });
  } catch (error) {
    console.error('GetSummary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSemesters(req, res) {
  try {
    const userId = req.user.id;

    const grades = await prisma.grade.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { semester: 'asc' }],
    });

    const grouped = {};
    for (const g of grades) {
      const key = `${g.year}-${g.semester}`;
      if (!grouped[key]) {
        grouped[key] = { year: g.year, semester: g.semester, grades: [], gpa: 0 };
      }
      grouped[key].grades.push(g);
    }

    for (const key of Object.keys(grouped)) {
      grouped[key].gpa = calculateGPA(grouped[key].grades);
    }

    res.status(200).json({ data: Object.values(grouped) });
  } catch (error) {
    console.error('GetSemesters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createGrade(req, res) {
  try {
    const { course, courseCode, credits, score, semester, year, userId: bodyUserId } = req.body;
    const userId = (req.user.role === 'ADMIN' || req.user.role === 'LECTURER') && bodyUserId
      ? bodyUserId
      : req.user.id;

    if (!course || credits === undefined || score === undefined || !semester || !year) {
      return res.status(400).json({ error: 'course, credits, score, semester, and year are required' });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    const grade = calculateGrade(score);

    const entry = await prisma.grade.create({
      data: {
        userId,
        course,
        courseCode,
        credits: parseFloat(credits),
        score: parseFloat(score),
        grade,
        semester,
        year,
      },
    });

    res.status(201).json({ data: entry });
  } catch (error) {
    console.error('CreateGrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateGrade(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { course, courseCode, credits, score, semester, year } = req.body;

    const existing = await prisma.grade.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this grade' });
    }

    const data = {};
    if (course !== undefined) data.course = course;
    if (courseCode !== undefined) data.courseCode = courseCode;
    if (credits !== undefined) data.credits = parseFloat(credits);
    if (score !== undefined) {
      data.score = parseFloat(score);
      data.grade = calculateGrade(data.score);
    }
    if (semester !== undefined) data.semester = semester;
    if (year !== undefined) data.year = year;

    const entry = await prisma.grade.update({ where: { id }, data });

    res.status(200).json({ data: entry });
  } catch (error) {
    console.error('UpdateGrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteGrade(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.grade.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this grade' });
    }

    await prisma.grade.delete({ where: { id } });

    res.status(200).json({ data: { message: 'Grade deleted successfully' } });
  } catch (error) {
    console.error('DeleteGrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getGrades, getSummary, getSemesters, createGrade, updateGrade, deleteGrade };
