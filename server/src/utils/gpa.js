const GRADE_MAP = [
  { min: 90, grade: 'A', points: 4.0 },
  { min: 85, grade: 'A-', points: 3.7 },
  { min: 80, grade: 'B+', points: 3.3 },
  { min: 75, grade: 'B', points: 3.0 },
  { min: 70, grade: 'B-', points: 2.7 },
  { min: 65, grade: 'C+', points: 2.3 },
  { min: 60, grade: 'C', points: 2.0 },
  { min: 55, grade: 'C-', points: 1.7 },
  { min: 50, grade: 'D+', points: 1.3 },
  { min: 45, grade: 'D', points: 1.0 },
  { min: 0, grade: 'F', points: 0.0 },
];

const CAMEROONIAN_GRADE_MAP = [
  { min: 16, description: 'Excellent' },
  { min: 14, description: 'Très Bien' },
  { min: 12, description: 'Bien' },
  { min: 10, description: 'Assez Bien' },
  { min: 8, description: 'Passable' },
  { min: 0, description: 'Insuffisant' },
];

const GRADE_COLORS = {
  'A': 'text-green-600',
  'A-': 'text-green-500',
  'B+': 'text-blue-500',
  'B': 'text-blue-500',
  'B-': 'text-blue-400',
  'C+': 'text-yellow-500',
  'C': 'text-yellow-500',
  'C-': 'text-yellow-600',
  'D+': 'text-orange-500',
  'D': 'text-orange-600',
  'F': 'text-red-600',
};

function calculateGrade(score) {
  if (typeof score !== 'number' || score < 0) return 'F';
  const entry = GRADE_MAP.find((g) => g.min <= score);
  return entry ? entry.grade : 'F';
}

function calculateGradePoints(grade) {
  const entry = GRADE_MAP.find((g) => g.grade === grade);
  return entry ? entry.points : 0;
}

function calculateGPA(grades) {
  if (!grades || grades.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const entry of grades) {
    const points = calculateGradePoints(entry.grade);
    totalPoints += points * entry.credits;
    totalCredits += entry.credits;
  }

  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
}

function calculateCameroonianGrade(score) {
  if (typeof score !== 'number' || score < 0) return 'Insuffisant';
  const scaledScore = (score / 100) * 20;
  const entry = CAMEROONIAN_GRADE_MAP.find((g) => g.min <= scaledScore);
  return entry ? entry.description : 'Insuffisant';
}

function getGradeColor(grade) {
  return GRADE_COLORS[grade] || 'text-gray-500';
}

module.exports = {
  calculateGrade,
  calculateGradePoints,
  calculateGPA,
  calculateCameroonianGrade,
  getGradeColor,
};
