import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load environment variables FIRST before other imports
// In Docker, environment variables are passed directly via docker-compose
// Locally, load from .env.local if it exists
if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (process.env.NODE_ENV !== 'production') {
  console.warn('[Warning] .env.local not found, using environment variables');
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBotResponse } from '../bot/index.js';
import { getAIResponse, getRateLimitStatus } from '../integrations/openai.js';
import { searchProducts, getProductInfo } from '../integrations/shopify.js';
import { StrategyFactory } from '../strategies/factory/StrategyFactory.js';
import { StrategyType } from '../types/strategy.types.js';

// Debug: Log Shopify env vars
console.log('[Debug] SHOPIFY_STORE_DOMAIN:', process.env.SHOPIFY_STORE_DOMAIN || 'NOT SET');
console.log('[Debug] SHOPIFY_STOREFRONT_ACCESS_TOKEN:', process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ? 'SET' : 'NOT SET');
console.log('[Debug] SHOPIFY_ADMIN_API_TOKEN:', process.env.SHOPIFY_ADMIN_API_TOKEN ? 'SET' : 'NOT SET');

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
  'https://shopify-headless-lemon.vercel.app', // Vercel production (primary)
  'https://shopify-headless-danh-les-projects.vercel.app', // Vercel production (alias)
  'https://shopify-headless-git-main-danh-les-projects.vercel.app', // Vercel preview
  'https://shopify-ecommerce-git-main-odanrees-projects.vercel.app', // Vercel preview (old org)
  'https://shopify-ecommerce-odanrees-projects.vercel.app', // Vercel production (old org)
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
    let systemPrompt = strategy.getSystemPrompt();
    let contextInfo = '';

    // For ecommerce strategy, try to search products if message mentions product keywords
    if (strategy.getType() === 'ecommerce') {
      const productKeywords = ['shirt', 't-shirt', 'tshirt', 'hoodie', 'pants', 'shoes', 'product', 'find', 'search', 'buy', 'large', 'medium', 'small', 'blue', 'red', 'black'];
      const messageText = message.toLowerCase();
      
      const hasProductKeyword = productKeywords.some(keyword => messageText.includes(keyword));
      
      if (hasProductKeyword) {
        try {
          console.log(`[Chat API] Searching Shopify products for: "${message}"`);
          
          // Extract potential search terms (simplified - AI will refine this)
          let searchTerm = 'shirt'; // default
          if (messageText.includes('hoodie')) searchTerm = 'hoodie';
          else if (messageText.includes('pants')) searchTerm = 'pants';
          else if (messageText.includes('shoes')) searchTerm = 'shoes';
          else if (messageText.includes('shirt') || messageText.includes('t-shirt') || messageText.includes('tshirt')) searchTerm = 'shirt';
          
          const products = await searchProducts(searchTerm, 5);
          
          if (products && products.length > 0) {
            contextInfo = `\n\nAVAILABLE PRODUCTS (from Shopify):\n${products.map(p => 
              `- ${p.title}: $${p.price}${p.url ? ` (URL: ${p.url})` : ''} (ID: ${p.id})`
            ).join('\n')}\n\nUse this product data to answer the customer's question about "${message}". Include the actual product URLs in your response so customers can click through to view or purchase.`;
            
            console.log(`[Chat API] Found ${products.length} products`);
          }
        } catch (error) {
          console.error('[Chat API] Shopify search error:', error);
          // Continue with AI response even if Shopify fails
        }
      }
    }

    // Append product context to system prompt if available
    if (contextInfo) {
      systemPrompt += contextInfo;
    }

    // Get AI response with custom system prompt and product context
    const response = await getAIResponse(message, conversationHistory || [], systemPrompt);
    
    // Analytics: Log conversation metrics
    console.log(JSON.stringify({
      event: 'chat_message',
      timestamp: new Date().toISOString(),
      strategy: strategy.getType(),
      messageLength: message.length,
      hasHistory: !!conversationHistory && conversationHistory.length > 0,
      historyLength: conversationHistory?.length || 0,
      responseTime: Date.now(), // Can calculate delta if needed
      hasContext: contextInfo.length > 0,
      success: true,
    }));

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
    
    // Analytics: Log error
    console.log(JSON.stringify({
      event: 'chat_error',
      timestamp: new Date().toISOString(),
      strategy: req.body.strategyType || 'unknown',
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    }));

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

// For local development and Docker: listen if not in Vercel serverless environment
if (!process.env.VERCEL) {
  const PORT: number = parseInt(process.env.PORT || '4000', 10);
  app.listen(PORT, () => {
    console.log(`AI Chatbot API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
  });
}
