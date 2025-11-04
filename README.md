# AI Chatbot

An intelligent, embeddable chatbot for ecommerce and customer support. Integrates with Shopify, OpenAI, and modern web frameworks.

**Status**: 75% Complete (Phase 4 Done, Phase 5 Planned)  
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
- 🚧 **Phase 5** - Testing & QA (100+ tests planned)
- 🚧 **Phase 6** - Docker & Vercel deployment
- 🚧 **Phase 7** - Enhancements & analytics

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
| **Phase 5 Planning** | [/docs/planning/PHASE_5_PLAN.md](docs/planning/PHASE_5_PLAN.md) |
| **Architecture** | [/docs/architecture/DESIGN_PATTERNS.md](docs/architecture/DESIGN_PATTERNS.md) |
| **Code Review** | [/docs/code-review/](docs/code-review/) (4 documents) |
| **Current Status** | [/docs/status/SESSION_SUMMARY.md](docs/status/SESSION_SUMMARY.md) |

### By Role

- **👤 New to Project** → Start with [INDEX.md](INDEX.md) → Read your role's path
- **👨‍💻 Developer** → [/docs/planning/PHASE_5_QUICK_START.md](docs/planning/PHASE_5_QUICK_START.md)
- **🔍 Code Reviewer** → [/docs/code-review/PR_5_OVERVIEW.md](docs/code-review/PR_5_OVERVIEW.md)
- **📊 Stakeholder** → [/docs/status/SESSION_SUMMARY.md](docs/status/SESSION_SUMMARY.md)

## Project Status

**Current**: 75% Complete (12 of 16 core tasks done)

| Phase | Status | Version | Date |
|-------|--------|---------|------|
| Phase 1: Foundation | ✅ Complete | v0.1.0 | Nov 3 |
| Phase 2: Core Integration | ✅ Complete | v0.2.0 | Nov 3 |
| Phase 3: Chat Widget | ✅ Complete | v0.2.0 | Nov 3 |
| Phase 4: Bot Logic | ✅ Complete | v0.2.1 | Nov 3 |
| Phase 5: Testing & QA | ⏳ Planned | v0.3.0 | Nov 10-17 |
| Phase 6: Deployment | ⏳ Planned | v0.4.0 | Nov 18-24 |
| Phase 7: Enhancements | ⏳ Optional | v1.0.0 | Nov 25-Dec 2 |

**Latest Commit**: Phase 4 complete with 34 passing tests  
**Documentation**: 16 comprehensive guides created (5,700+ lines)  
**Code**: 797 lines of production code + 420 lines of tests  

**Next Step**: Code review of PR #5 → Merge → Start Phase 5