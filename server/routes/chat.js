const express = require('express');
const Groq = require('groq-sdk');
const Chat = require('../models/Chat');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildChatTitle(message) {
  return String(message || 'New Chat').trim().slice(0, 60) || 'New Chat';
}

router.post('/message', verifyToken, async (req, res) => {
  let chat;
  let assistantResponse = '';

  try {
    const message = String(req.body.message || '').trim();
    const userContext = req.body.userContext || {};

    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    if (req.body.chatId) {
      chat = await Chat.findById(req.body.chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      if (chat.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
      chat = await Chat.create({
        userId: req.user._id,
        title: buildChatTitle(message),
        messages: []
      });
    }

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    chat.messages.push(userMessage);
    await chat.save();

    const conversationHistory = chat.messages
      .slice(Math.max(0, chat.messages.length - 11), -1)
      .map((item) => ({
        role: item.role,
        content: item.content
      }));

    const contextSummary = `Resume Score: ${userContext.resumeScore ?? req.user.resumeScore ?? 0}/100, Target companies: ${userContext.targetCompanies || 'top tech'}, Skills gap identified.`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    });

    res.write(`data: ${JSON.stringify({ type: 'meta', chatId: String(chat._id), title: chat.title })}\n\n`);

    const systemPrompt = `You are PrepAI, an expert AI career coach for software engineering placements. Help with: DSA prep, resume tips, interview strategies, company-specific prep, behavioral answers (STAR format), salary negotiation, career advice. Be concise and practical. User context: ${contextSummary}`;

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(h => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    const stream = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.3-70b-versatile',
      stream: true
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (!token) {
        continue;
      }

      assistantResponse += token;
      res.write(`data: ${JSON.stringify({ type: 'token', token, content: token })}\n\n`);
    }

    chat.messages.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date()
    });
    await chat.save();

    res.write(`data: ${JSON.stringify({ type: 'done', chatId: String(chat._id) })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat message error:', error);

    if (chat && assistantResponse) {
      chat.messages.push({
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      });
      await chat.save();
    }

    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error generating chat response' });
    }

    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Error generating chat response' })}\n\n`);
    res.end();
  }
});

router.get('/history', verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt');

    res.json({ chats });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Error deleting chat' });
  }
});

module.exports = router;