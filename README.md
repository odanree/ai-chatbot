# AI Chatbot

This project provides an embeddable AI-powered chatbot for ecommerce and support use cases. It integrates with Shopify and cloud AI services (OpenAI, Dialogflow, etc.).

## Features

- ✅ **OpenAI Integration** - GPT-4 and GPT-3.5-turbo support with streaming
- ✅ **Shopify Integration** - Product search, order lookup, customer management via GraphQL API
- ✅ **Embeddable Chat Widget** - Cross-origin JavaScript widget with themes and customization
- ✅ **REST API** - `/api/chat` endpoint for message processing
- 🚧 **Bot Logic** - Smart conversation flows (Phase 4)
- 🚧 **Logging & Analytics** - Conversation tracking (Phase 7)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
OPENAI_API_KEY=sk-...
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ADMIN_API_TOKEN=...
PORT=4000
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:4000`

### 4. Test API Endpoint

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What products do you have?"}'
```

## Embed Chat Widget

Add to any website:

```html
<link rel="stylesheet" href="https://your-domain.com/chat-widget.css">
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AIChatbot.init({
    apiUrl: 'https://your-api.com',
    position: 'bottom-right',
    theme: 'light'
  });
</script>
```

See [docs/CHAT_WIDGET.md](docs/CHAT_WIDGET.md) for full configuration options and examples.

## Development

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
npm start
```

## Architecture

- **Backend**: Express.js + TypeScript + Node.js 18+
- **Integrations**: OpenAI API, Shopify GraphQL API
- **Frontend**: Embeddable vanilla JavaScript widget
- **Deployment**: Vercel (auto-deploy on main branch)

See [docs/architecture.md](docs/architecture.md) for detailed architecture overview.

## Documentation

- [Chat Widget Guide](docs/CHAT_WIDGET.md) - Widget configuration and API
- [Architecture](docs/architecture.md) - System design and components
- [Roadmap](../ROADMAP.md) - Feature roadmap and phases

## Project Status

**Phase 3 ✅ Complete**
- [x] OpenAI integration with rate limiting
- [x] Shopify product/order API integration
- [x] Embeddable chat widget (JavaScript + CSS)
- [x] REST API endpoint

**Next: Phase 4** - Advanced bot logic and conversation flows