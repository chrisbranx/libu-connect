const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@libuconnect.com' },
    update: {},
    create: {
      email: 'admin@libuconnect.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      department: 'Administration',
    }
  });

  const lecturerPassword = await bcrypt.hash('lecturer123', 12);
  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@libuconnect.com' },
    update: {},
    create: {
      email: 'lecturer@libuconnect.com',
      password: lecturerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'LECTURER',
      department: 'Computer Science',
    }
  });

  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@libuconnect.com' },
    update: {},
    create: {
      email: 'student@libuconnect.com',
      password: studentPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'STUDENT',
      department: 'Computer Science',
      level: 'Level 200',
      matricule: 'SAI2024CS001',
    }
  });

  const schedules = [
    { userId: student.id, title: 'Data Structures', type: 'class', course: 'CSC201', lecturer: 'Dr. John Doe', location: 'Room 301', startTime: new Date('2025-01-20T08:00:00'), endTime: new Date('2025-01-20T10:00:00'), isRecurring: true, recurDays: ['MON', 'WED'], color: '#1E1B4B', reminder: 30 },
    { userId: student.id, title: 'Algorithms', type: 'class', course: 'CSC202', lecturer: 'Dr. Jane Roe', location: 'Room 205', startTime: new Date('2025-01-20T10:00:00'), endTime: new Date('2025-01-20T12:00:00'), isRecurring: true, recurDays: ['TUE', 'THU'], color: '#059669', reminder: 15 },
    { userId: student.id, title: 'Database Systems', type: 'exam', course: 'CSC203', location: 'Hall A', startTime: new Date('2025-02-10T09:00:00'), endTime: new Date('2025-02-10T12:00:00'), color: '#DC2626', reminder: 60 },
    { userId: student.id, title: 'Study Group', type: 'personal', location: 'Library', startTime: new Date('2025-01-22T14:00:00'), endTime: new Date('2025-01-22T16:00:00'), color: '#F59E0B', reminder: 30 },
  ];

  for (const s of schedules) {
    await prisma.schedule.create({ data: s });
  }

  const notes = [
    { userId: student.id, title: 'Binary Search Trees', content: 'Binary Search Trees are a type of data structure where each node has at most two children...', course: 'CSC201', tags: ['data-structures', 'trees'], visibility: 'COURSE', isPinned: true },
    { userId: student.id, title: 'Sorting Algorithms Summary', content: 'Quick Sort: O(n log n) average, O(n²) worst case\nMerge Sort: O(n log n) all cases\nBubble Sort: O(n²)...', course: 'CSC202', tags: ['algorithms', 'sorting'], visibility: 'PUBLIC' },
  ];

  for (const n of notes) {
    await prisma.note.create({ data: n });
  }

  const grades = [
    { userId: student.id, course: 'Data Structures', courseCode: 'CSC201', credits: 4, score: 88, grade: 'A', semester: 'Semester 1', year: '2024/2025' },
    { userId: student.id, course: 'Algorithms', courseCode: 'CSC202', credits: 4, score: 75, grade: 'B', semester: 'Semester 1', year: '2024/2025' },
    { userId: student.id, course: 'Database Systems', courseCode: 'CSC203', credits: 3, score: 92, grade: 'A-', semester: 'Semester 1', year: '2024/2025' },
  ];

  for (const g of grades) {
    await prisma.grade.create({ data: g });
  }

  console.log('Seed data created successfully');
  console.log('Admin: admin@libuconnect.com / admin123');
  console.log('Lecturer: lecturer@libuconnect.com / lecturer123');
  console.log('Student: student@libuconnect.com / student123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
