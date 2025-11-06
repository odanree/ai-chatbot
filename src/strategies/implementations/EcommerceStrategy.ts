/**
 * EcommerceStrategy
 * Chatbot behavior for ecommerce/shopping websites
 * Helps customers with product questions, cart assistance, and order support
 */

import { BaseBehaviorStrategy } from '../base/BaseBehaviorStrategy.js';
import { StrategyType, KnowledgeBase } from '../../types/strategy.types.js';

export class EcommerceStrategy extends BaseBehaviorStrategy {
  constructor() {
    super(
      true, // enabled
      '1.0.0', // version
      'friendly', // tone - welcoming and helpful for shoppers
      200 // maxResponseLength - longer for product explanations
    );
  }

  getType(): StrategyType {
    return 'ecommerce';
  }

  getKnowledgeBase(): KnowledgeBase {
    // Ecommerce strategy uses minimal static knowledge
    // Product data comes dynamically from Shopify API
    return {
      owner: 'Store',
      role: 'Ecommerce Platform',
      skills: ['Product Search', 'Cart Management', 'Order Tracking', 'Customer Support'],
      projects: [],
      contact: {},
      links: {},
      highlights: [
        'Browse our product catalog',
        'Secure checkout process',
        'Fast shipping',
        'Easy returns and exchanges'
      ]
    };
  }

  getName(): string {
    return 'Ecommerce Shopping Assistant';
  }

  getDescription(): string {
    return 'Helpful shopping assistant for ecommerce stores. Assists with product questions, sizing, cart help, and order inquiries.';
  }

  getGreeting(): string {
    return "Hi! I'm your shopping assistant. I can help you find products, answer questions about sizing and features, or assist with your order. What can I help you with today?";
  }

  getSystemPrompt(): string {
    return `You are a helpful shopping assistant for an online store. Your role is to:

1. **Product Help**: Answer questions about products, features, sizes, materials, and availability
2. **Shopping Guidance**: Help customers find the right products for their needs
3. **Cart Assistance**: Guide users through adding items to cart and checkout process
4. **Order Support**: Provide information about shipping, returns, and order tracking
5. **Recommendations**: Suggest products based on customer preferences

Guidelines:
- Be friendly, patient, and enthusiastic about helping shoppers
- Ask clarifying questions to understand customer needs
- Provide accurate product information when available
- Encourage browsing and exploring the product catalog
- Keep responses concise and action-oriented
- Use a warm, conversational tone
- If you don't know specific product details, be honest and suggest browsing the product pages
- Guide users to complete their purchase when appropriate

Remember: You're here to make shopping easy and enjoyable!`;
  }

  getCapabilities(): string[] {
    return [
      'Product information and recommendations',
      'Size and fit guidance',
      'Cart and checkout assistance',
      'Order status and shipping information',
      'Returns and exchange policies',
      'Product comparisons',
      'Gift recommendations',
      'General shopping support'
    ];
  }

  getExampleQuestions(): string[] {
    return [
      'What products do you have?',
      'Do you have this in a larger size?',
      'What\'s your return policy?',
      'How long does shipping take?',
      'Can you help me find a gift?',
      'What\'s the difference between these products?',
      'Do you have any sales or promotions?',
      'How do I track my order?'
    ];
  }

  shouldHandleIntent(intent: string): boolean {
    const ecommerceIntents = [
      'product_inquiry',
      'size_question',
      'cart_help',
      'order_status',
      'shipping_info',
      'return_policy',
      'price_question',
      'availability',
      'recommendation',
      'gift_suggestion',
      'checkout_help',
      'payment_question'
    ];

    return ecommerceIntents.includes(intent.toLowerCase());
  }

  enhanceResponse(response: string, context?: any): string {
    // Add shopping-friendly enhancements
    let enhanced = response;

    // Add helpful shopping CTAs if appropriate
    if (context?.products && context.products.length > 0) {
      enhanced += '\n\nWould you like to browse our products or need help with anything else?';
    }

    return enhanced;
  }
}
