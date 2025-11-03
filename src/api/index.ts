import express from 'express';
import { getBotResponse } from '../bot/index.js';
import { getAIResponse, getRateLimitStatus } from '../integrations/openai.js';

const app = express();
app.use(express.json());

// POST /api/chat - Get AI response
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await getAIResponse(message, conversationHistory || []);
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Error) {
      if ('code' in error && error.code === 'RATE_LIMIT_EXCEEDED') {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        });
        return;
      }

      if ('code' in error && error.code === 'MISSING_API_KEY') {
        res.status(500).json({
          success: false,
          error: 'Server configuration error. API key not set.',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
    });
  }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Chatbot API is running',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/rate-limit - Check rate limit status
app.get('/api/rate-limit', (req, res) => {
  const status = getRateLimitStatus();
  res.json({
    rateLimit: status,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI Chatbot API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
});
