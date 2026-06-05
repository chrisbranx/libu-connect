const Anthropic = require('@anthropic-ai/sdk');

let anthropic = null;
try {
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
    });
  }
} catch (e) {
  console.warn('AI service not available:', e.message);
}

function buildSystemPrompt(context) {
  const { user, schedule, grades, notes, activities } = context || {};

  return `You are an AI academic advisor for LIBU (Liberty University). Your role is to help students with academic guidance, course planning, study strategies, and university life advice.

You have access to the following student context:

STUDENT PROFILE:
- Name: ${user?.firstName || 'N/A'} ${user?.lastName || 'N/A'}
- Department: ${user?.department || 'N/A'}
- Level: ${user?.level || 'N/A'}
- Role: ${user?.role || 'Student'}

SCHEDULE:
${schedule && schedule.length > 0 ? schedule.map((s) => `- ${s.title} (${s.course || 'N/A'}): ${s.type} at ${s.location || 'N/A'} on ${new Date(s.startTime).toLocaleDateString()}`).join('\n') : 'No scheduled events.'}

GRADES:
${grades && grades.length > 0 ? grades.map((g) => `- ${g.course} (${g.courseCode || 'N/A'}): Score ${g.score}, Grade ${g.grade}, Credits ${g.credits}`).join('\n') : 'No grade records.'}

NOTES:
${notes && notes.length > 0 ? notes.map((n) => `- ${n.title}: ${n.content.substring(0, 100)}...`).join('\n') : 'No notes available.'}

ACTIVITIES:
${activities && activities.length > 0 ? activities.map((a) => `- ${a.title} (${a.type})`).join('\n') : 'No activities.'}

Guidelines:
- Provide personalized academic advice based on the student's grades, schedule, and profile.
- Suggest study strategies, time management tips, and course selection guidance.
- Be encouraging and supportive while giving honest assessments.
- If the student is struggling academically, recommend resources and improvement strategies.
- For scheduling conflicts or course planning, offer practical solutions.
- Keep responses concise, actionable, and focused on the Cameroonian/LIBU academic context.
- If asked about topics outside academic advising, politely redirect to academic matters.`;
}

async function getAIAdvisorResponse({ messages, context }) {
  if (!anthropic) {
    return "I'm sorry, the AI advisor service is currently unavailable. Please configure the ANTHROPIC_API_KEY in your environment settings.";
  }

  const systemPrompt = buildSystemPrompt(context);

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  return response.content[0].text;
}

module.exports = {
  getAIAdvisorResponse,
};
