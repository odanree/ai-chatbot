# AI Chatbot

An intelligent, embeddable chatbot for ecommerce and customer support. Integrates with Shopify, OpenAI, and modern web frameworks.

**Status**: Production Ready  
**Version**: v0.2.1  
**Documentation**: See [INDEX.md](INDEX.md) for complete guide

## ✨ Features

- ✅ **OpenAI Integration** - GPT-4 and GPT-3.5-turbo with streaming
- ✅ **Shopify Integration** - Product search, order lookup via GraphQL
- ✅ **Embeddable Chat Widget** - Self-contained JavaScript widget
- ✅ **Smart Bot Logic** - Intent recognition, context management, multi-turn conversations
- ✅ **REST API** - `/api/chat` endpoint with TypeScript types
- ✅ **Design Patterns** - Singleton, Factory, Strategy, Auto-cleanup
- ✅ **Comprehensive Tests** - 34 passing unit tests, production-ready code

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

## 📚 Documentation

**Start Here**: [INDEX.md](INDEX.md) - Complete documentation map with reading paths by role

### Quick Links

| Need | Read This |
|------|-----------|
| **Project Overview** | [INDEX.md](INDEX.md) (master index) |
| **Project Timeline** | [/docs/planning/ROADMAP.md](docs/planning/ROADMAP.md) |
| **Architecture** | [/docs/architecture/DESIGN_PATTERNS.md](docs/architecture/DESIGN_PATTERNS.md) |
| **Code Review** | [/docs/code-review/](docs/code-review/) (5 documents) |
| **Current Status** | [/docs/status/SESSION_SUMMARY.md](docs/status/SESSION_SUMMARY.md) |

### By Role

- **👤 New to Project** → Start with [INDEX.md](INDEX.md) → Read your role's path
- **👨‍💻 Developer** → [/docs/architecture/](docs/architecture/)
- **🔍 Code Reviewer** → [/docs/code-review/PR_5_OVERVIEW.md](docs/code-review/PR_5_OVERVIEW.md)
- **📊 Stakeholder** → [/docs/status/SESSION_SUMMARY.md](docs/status/SESSION_SUMMARY.md)

## Project Status

**Current**: Production Ready - Core implementation complete with comprehensive test coverage

| Component | Status | Version |
|-----------|--------|---------|
| Foundation | ✅ Complete | v0.1.0 |
| Core Integration | ✅ Complete | v0.2.0 |
| Chat Widget | ✅ Complete | v0.2.0 |
| Bot Logic | ✅ Complete | v0.2.1 |

**Latest Commit**: Production-ready with 34 passing tests  
**Documentation**: Core guidance documents (9 files, 2,900+ lines)  
**Code**: 797 lines of production code + 420 lines of tests  

**Get Started**: See [Quick Start](#quick-start) section above