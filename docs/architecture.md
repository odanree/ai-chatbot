# AI Chatbot Architecture

## Overview
This document describes the architecture for the AI-powered chatbot project.

### Components
- **Frontend Chat Widget**: Embeddable UI for Next.js or Shopify theme
- **API Layer**: Express server for chat requests
- **AI Service Integration**: Connects to OpenAI, Dialogflow, etc.
- **Shopify Integration**: Fetches product/order data
- **Logging & Analytics**: Tracks chat interactions

## Data Flow
1. User sends message via chat widget
2. API receives message, forwards to AI service
3. AI service processes and responds
4. API fetches Shopify data if needed
5. Response sent back to widget
6. Interaction logged

## Tech Stack
- Node.js, TypeScript, Express
- OpenAI API (default)
- Shopify Storefront/Admin API
- React (for widget)

## Security
- API keys in .env
- HTTPS required
- GDPR compliance
