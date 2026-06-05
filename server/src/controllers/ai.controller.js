const prisma = require('../config/db');
const { getAIAdvisorResponse } = require('../services/ai.service');

async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userId = req.user.id;

    const [user, schedules, grades, notes, activities] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.schedule.findMany({ where: { userId }, orderBy: { startTime: 'asc' } }),
      prisma.grade.findMany({ where: { userId } }),
      prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 10 }),
      prisma.activityParticipant.findMany({
        where: { userId },
        include: { activity: true },
      }),
    ]);

    const context = { user, schedule: schedules, grades, notes, activities: activities.map((p) => p.activity) };

    let conversation = await prisma.conversation.findUnique({ where: { userId } });

    let storedMessages = [];
    if (conversation?.messages) {
      try {
        storedMessages = JSON.parse(conversation.messages);
      } catch {
        storedMessages = [];
      }
    }

    const userMessages = storedMessages.map((m) => ({ role: m.role, content: m.content }));
    userMessages.push({ role: 'user', content: message });

    const aiResponse = await getAIAdvisorResponse({ messages: userMessages, context });

    const updatedMessages = [...userMessages, { role: 'assistant', content: aiResponse }];

    await prisma.conversation.upsert({
      where: { userId },
      update: { messages: JSON.stringify(updatedMessages) },
      create: { userId, messages: JSON.stringify(updatedMessages) },
    });

    res.status(200).json({ data: { message: aiResponse } });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'AI service error' });
  }
}

async function getHistory(req, res) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { userId: req.user.id },
    });

    if (!conversation) {
      return res.status(200).json({ data: { messages: [] } });
    }

    let messages = [];
    try {
      messages = JSON.parse(conversation.messages);
    } catch {
      messages = [];
    }

    res.status(200).json({ data: { messages } });
  } catch (error) {
    console.error('GetHistory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function clearHistory(req, res) {
  try {
    await prisma.conversation.deleteMany({ where: { userId: req.user.id } });

    res.status(200).json({ data: { message: 'Conversation history cleared' } });
  } catch (error) {
    console.error('ClearHistory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSuggestions(req, res) {
  try {
    const userId = req.user.id;

    const [user, grades, schedules] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.grade.findMany({ where: { userId } }),
      prisma.schedule.findMany({
        where: { userId, startTime: { gte: new Date() } },
        orderBy: { startTime: 'asc' },
        take: 10,
      }),
    ]);

    const context = { user, grades, schedule: schedules, notes: [], activities: [] };

    const prompt = 'Based on my current grades and upcoming schedule, what are the top 3-5 specific study suggestions you would recommend? Keep it brief and actionable.';

    const suggestions = await getAIAdvisorResponse({
      messages: [{ role: 'user', content: prompt }],
      context,
    });

    res.status(200).json({ data: { suggestions } });
  } catch (error) {
    console.error('GetSuggestions error:', error);
    res.status(500).json({ error: 'AI service error' });
  }
}

module.exports = { chat, getHistory, clearHistory, getSuggestions };
