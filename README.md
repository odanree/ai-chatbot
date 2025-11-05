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

### Run with Docker

```bash
# Build image
docker build -t ai-chatbot:latest .

# Run container
docker run -d \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=odanree.myshopify.com \
  -e SHOPIFY_STOREFRONT_ACCESS_TOKEN=... \
  -e SHOPIFY_ADMIN_API_TOKEN=... \
  -p 3000:3000 \
  ai-chatbot:latest

# Or with docker-compose
docker-compose up -d
```

## 🌍 Deployment

### Vercel (Recommended)
Deploy to production with **Vercel** (auto-deploy on main branch):

```bash
# Quick setup (5 minutes)
vercel link
vercel --prod
```

### Docker
Package for container deployment:

```bash
# Build image
docker build -t ai-chatbot:latest .

# Run locally
docker run -p 3000:3000 ai-chatbot:latest

# Push to registry
docker push yourusername/ai-chatbot:latest
```

**Complete Guides**:
- **[docs/VERCEL_QUICK_SETUP.md](docs/VERCEL_QUICK_SETUP.md)** - 5-minute setup
- **[docs/VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md)** - Complete guide

See [.github/BRANCHING_STRATEGY.md](.github/BRANCHING_STRATEGY.md) for CI/CD workflow.

## Architecture

- **Backend**: Express.js + TypeScript + Node.js 18+
- **Integrations**: OpenAI API, Shopify GraphQL API
- **Frontend**: Embeddable vanilla JavaScript widget
- **Deployment**: Vercel (auto-deploy on main branch)

See [docs/architecture.md](docs/architecture.md) for detailed architecture overview.

## 📚 Documentation

**Start Here**: [INDEX.md](INDEX.md) - Complete documentation map with reading paths by role

### Phase 5: Testing & QA (Latest)

| Document | Purpose |
|----------|---------|
| **[docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md)** | Quick overview - Start here! |
| **[docs/PHASE5_SUMMARY.md](docs/PHASE5_SUMMARY.md)** | Key metrics and test results |
| **[docs/PHASE5_TESTING_PLAN.md](docs/PHASE5_TESTING_PLAN.md)** | Complete testing strategy |
| **[docs/TEST_ARCHITECTURE.md](docs/TEST_ARCHITECTURE.md)** | Test structure & patterns |
| **[docs/PHASE5_COMPLETION_REPORT.md](docs/PHASE5_COMPLETION_REPORT.md)** | Detailed results & analysis |
| **[docs/PHASE5_DASHBOARD.md](docs/PHASE5_DASHBOARD.md)** | Visual status dashboard |
| **[docs/PHASE5_COMPLETION_CHECKLIST.md](docs/PHASE5_COMPLETION_CHECKLIST.md)** | Verification checklist |
| **[docs/DELIVERABLES.md](docs/DELIVERABLES.md)** | Complete file listing |

**Status**: ✅ 215 tests passing (99.5%) | ~20 second execution time | Production-ready

### Phase 6: Deployment (In Progress)

| Document | Purpose |
|----------|---------|
| **[docs/DOCKER_SETUP_GUIDE.md](docs/DOCKER_SETUP_GUIDE.md)** | Complete Docker guide |
| **[docs/DOCKER_QUICK_REFERENCE.md](docs/DOCKER_QUICK_REFERENCE.md)** | Quick Docker reference |
| **[docs/VERCEL_QUICK_SETUP.md](docs/VERCEL_QUICK_SETUP.md)** | 5-minute Vercel setup |
| **[docs/VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md)** | Complete Vercel guide |

**Status**: 🟡 In Progress | Docker configured (6.1 ✅) | Vercel configured (6.2 ✅) | Ready for deployment

### Quick Links

| Need | Read This |
|------|-----------|
| **Project Overview** | [INDEX.md](INDEX.md) (master index) |
| **Project Timeline** | [ROADMAP.md](ROADMAP.md) |
| **Testing Info** | [docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md) |
| **Architecture** | [/docs/architecture/DESIGN_PATTERNS.md](docs/architecture/DESIGN_PATTERNS.md) |
| **Code Review** | [/docs/code-review/](docs/code-review/) (5 documents) |
| **Current Status** | [/docs/status/SESSION_SUMMARY.md](docs/status/SESSION_SUMMARY.md) |

### By Role

- **👤 New to Project** → Start with [docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md) → [INDEX.md](INDEX.md)
- **👨‍💻 Developer** → [docs/TEST_ARCHITECTURE.md](docs/TEST_ARCHITECTURE.md) → [/docs/architecture/](docs/architecture/)
- **🧪 QA/Tester** → [docs/PHASE5_SUMMARY.md](docs/PHASE5_SUMMARY.md) → [docs/PHASE5_TESTING_PLAN.md](docs/PHASE5_TESTING_PLAN.md)
- **🔍 Code Reviewer** → [/docs/code-review/PR_5_OVERVIEW.md](docs/code-review/PR_5_OVERVIEW.md)
- **📊 Stakeholder** → [docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md)

## Project Status

**Current**: Testing & QA Complete (Phase 5) - 215 tests passing | Production-ready

| Component | Status | Version | Tests |
|-----------|--------|---------|-------|
| Foundation | ✅ Complete | v0.1.0 | 12 |
| Core Integration | ✅ Complete | v0.2.0 | 34 |
| Chat Widget | ✅ Complete | v0.2.0 | 0 |
| Bot Logic | ✅ Complete | v0.2.1 | 0 |
| **Testing & QA** | ✅ **Complete** | **Phase 5** | **170+** |

**Latest**: Phase 5 Testing & QA (215 passing tests, 99.5% pass rate, ~20 seconds)  
**Documentation**: Comprehensive (9 docs + 7 Phase 5 docs = 16 files, 3,400+ lines)  
**Code**: 797 lines of production code + 2,530 lines of test code  
**Next Phase**: Phase 6 - Deployment (Nov 11-24)