# OpenAI Integration Setup Guide

This guide walks through setting up and testing the OpenAI integration for the AI Chatbot.

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

## Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (you won't be able to see it again)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4 for better quality
   ```

3. Optional: Configure server port and environment:
   ```bash
   PORT=4000
   NODE_ENV=development
   ```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
AI Chatbot API running on port 4000
Environment: development
OpenAI Model: gpt-3.5-turbo
```

## Step 5: Test the API

### Health Check

```bash
curl http://localhost:4000/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "AI Chatbot API is running",
  "timestamp": "2025-11-03T10:30:00.000Z"
}
```

### Send a Chat Message

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the price of the blue t-shirt?"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "The blue t-shirt is priced at $29.99 and is available in multiple sizes.",
    "model": "gpt-3.5-turbo",
    "tokensUsed": 45
  }
}
```

### Check Rate Limit Status

```bash
curl http://localhost:4000/api/rate-limit
```

Response:
```json
{
  "rateLimit": {
    "remaining": 29,
    "limit": 30,
    "resetIn": 55
  }
}
```

## Rate Limiting

The API implements built-in rate limiting:
- **Limit**: 30 requests per minute
- **Window**: 60 seconds
- **Response**: 429 status code when exceeded

Example error response:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

## Features Implemented

### ✅ Core Functions

1. **`getAIResponse(message, conversationHistory)`**
   - Send a message to OpenAI
   - Support for conversation history
   - Returns: `{ message, model, tokensUsed }`

2. **`getAIResponseStream(message, conversationHistory)`** (Advanced)
   - Streaming responses from OpenAI
   - Returns: AsyncGenerator for real-time responses

3. **`getRateLimitStatus()`**
   - Check current rate limit status
   - Returns: `{ remaining, limit, resetIn }`

### ✅ Error Handling

- Empty message validation
- Rate limit enforcement
- API key validation
- Comprehensive error codes:
  - `INVALID_INPUT` - Empty or invalid message
  - `RATE_LIMIT_EXCEEDED` - Too many requests
  - `MISSING_API_KEY` - API key not configured

### ✅ System Prompt

The chatbot is configured with a system prompt that instructs it to:
- Be a helpful ecommerce customer support chatbot
- Help with product questions, orders, and general support
- Be concise, friendly, and helpful

## API Routes

### POST /api/chat

**Request:**
```json
{
  "message": "What products do you have?",
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "We have tech t-shirts available...",
    "model": "gpt-3.5-turbo",
    "tokensUsed": 50
  }
}
```

### GET /api/health

Health check endpoint for monitoring.

### GET /api/rate-limit

Check current rate limit status.

## TypeScript Types

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  message: string;
  model: string;
  tokensUsed: number;
}

interface AIError extends Error {
  code?: string;
  status?: number;
}
```

## Configuration Options

### OpenAI Models

- `gpt-4` - Most capable, slower, more expensive
- `gpt-3.5-turbo` - Faster, cheaper, good quality (recommended for production)

### API Parameters

- `max_tokens`: 500 (max response length)
- `temperature`: 0.7 (creativity level: 0-2)

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"

**Solution**: Make sure `.env.local` file exists with your API key:
```bash
OPENAI_API_KEY=sk-your-actual-key
```

### Error: "Rate limit exceeded"

**Solution**: Wait for the rate limit window to reset (60 seconds) or check status:
```bash
curl http://localhost:4000/api/rate-limit
```

### Error: "401 Invalid authentication"

**Solution**: Verify your API key is correct and hasn't expired:
1. Go to OpenAI Platform
2. Check if your API key is still active
3. Create a new key if needed
4. Update `.env.local`

### Error: "Server error: model not found"

**Solution**: Ensure the model name is correct in `.env.local`:
```bash
OPENAI_MODEL=gpt-3.5-turbo  # correct
OPENAI_MODEL=gpt-3.5      # incorrect
```

## Next Steps

1. ✅ OpenAI integration complete
2. 🚧 Shopify integration (Task #2)
3. 🔄 Chat widget component (Task #3)
4. 🔄 Conversation context management (Task #5)

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Models](https://platform.openai.com/docs/models)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [OpenAI Pricing](https://openai.com/pricing)
