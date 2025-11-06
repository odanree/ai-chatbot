import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBotResponse } from '../bot/index.js';
import { getAIResponse, getRateLimitStatus } from '../integrations/openai.js';
import { StrategyFactory } from '../strategies/factory/StrategyFactory.js';
import { StrategyType } from '../types/strategy.types.js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for portfolio website and Shopify headless store
const allowedOrigins = [
  'https://danhle.net',
  'https://www.danhle.net',
  'http://localhost:3000', // For local testing
  'http://localhost:3001', // Shopify headless local dev
  'https://shopify-ecommerce-git-main-odanrees-projects.vercel.app', // Vercel preview
  'https://shopify-ecommerce-odanrees-projects.vercel.app', // Vercel production
  'https://shopify-ecommerce.vercel.app', // Vercel production alias
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../../public')));

// GET / - Welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'AI Chatbot API',
    version: '1.0.0',
    documentation: 'Send POST requests to /api/chat with optional strategyType',
    endpoints: {
      chat: 'POST /api/chat - Send a message and get AI response (accepts: message, conversationHistory, strategyType)',
      health: 'GET /api/health - Health check',
      rateLimit: 'GET /api/rate-limit - Check rate limit status',
      strategies: 'GET /api/strategies - List available strategy types',
      strategyInfo: 'GET /api/strategy/:type - Get strategy information',
    },
    availableStrategies: StrategyFactory.getAvailableStrategies(),
  });
});

// POST /api/chat - Get AI response
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory, strategyType } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get strategy (defaults to 'default' if not specified)
    const strategy = StrategyFactory.createStrategy(strategyType as StrategyType || 'default');
    
    // Check if strategy is enabled
    if (!strategy.isEnabled()) {
      res.status(503).json({
        success: false,
        error: 'This chatbot strategy is currently disabled',
      });
      return;
    }

    // Get system prompt from strategy
    const systemPrompt = strategy.getSystemPrompt();

    // Get AI response with custom system prompt
    const response = await getAIResponse(message, conversationHistory || [], systemPrompt);
    
    res.json({
      success: true,
      data: {
        ...response,
        strategyUsed: strategy.getType(),
        greeting: strategy.getGreeting(),
      },
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

// GET /api/strategy/:type - Get strategy information
app.get('/api/strategy/:type', (req, res) => {
  try {
    const strategyType = req.params.type as StrategyType;
    const strategy = StrategyFactory.createStrategy(strategyType);
    
    res.json({
      success: true,
      data: {
        type: strategy.getType(),
        version: strategy.getVersion(),
        enabled: strategy.isEnabled(),
        greeting: strategy.getGreeting(),
        suggestedQuestions: strategy.getSuggestedQuestions(),
        conversationStarters: strategy.getConversationStarters(),
        tone: strategy.getTone(),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid strategy type',
    });
  }
});

// GET /api/strategies - List available strategies
app.get('/api/strategies', (req, res) => {
  res.json({
    success: true,
    data: {
      available: StrategyFactory.getAvailableStrategies(),
    },
  });
});

// GET /api/rate-limit - Check rate limit status
app.get('/api/rate-limit', (req, res) => {
  const status = getRateLimitStatus();
  res.json({
    rateLimit: status,
  });
});

// Export for Vercel serverless
export default app;

// For local development: listen if not in serverless environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT: number = parseInt(process.env.PORT || '4000', 10);
  app.listen(PORT, () => {
    console.log(`AI Chatbot API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
  });
}
