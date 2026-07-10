/**
 * EcommerceStrategy
 * Chatbot behavior for ecommerce/shopping websites
 * Helps customers with product questions, cart assistance, and order support
 */

import type {
	KnowledgeBase,
	StrategyType,
} from "../../types/strategy.types.js";
import { BaseBehaviorStrategy } from "../base/BaseBehaviorStrategy.js";

// Shape of the context object enhanceResponse() reads from. Fields are all
// optional — the method just branches on presence to pick the appropriate CTA.
interface EcommerceEnhanceContext {
	orderId?: string;
	orderStatus?: string;
	products?: unknown[];
	customer?: unknown;
	email?: string;
}

export class EcommerceStrategy extends BaseBehaviorStrategy {
	constructor() {
		super(
			true, // enabled
			"1.0.0", // version
			"friendly", // tone - welcoming and helpful for shoppers
			200, // maxResponseLength - longer for product explanations
		);
	}

	getType(): StrategyType {
		return "ecommerce";
	}

	getKnowledgeBase(): KnowledgeBase {
		// Ecommerce strategy uses minimal static knowledge
		// Product data comes dynamically from Shopify API (Storefront + Admin APIs)
		return {
			owner: "Store",
			role: "Ecommerce Platform",
			skills: [
				"Product Search",
				"Cart Management",
				"Order Tracking",
				"Customer Support",
				"Inventory Information",
				"Order History Lookup",
			],
			projects: [],
			contact: {},
			links: {},
			highlights: [
				"Browse our product catalog",
				"Secure checkout process",
				"Real-time order tracking",
				"Fast shipping",
				"Easy returns and exchanges",
				"Customer order history access",
			],
		};
	}

	getName(): string {
		return "Ecommerce Shopping Assistant";
	}

	getDescription(): string {
		return "Helpful shopping assistant for ecommerce stores. Assists with product questions, sizing, cart help, order tracking, and customer support via Shopify Admin API.";
	}

	getGreeting(): string {
		return "Hi! I'm your shopping assistant. I can help you find products, track your order, answer questions about sizing and features, or look up your order history. What can I help you with today?";
	}

	getSystemPrompt(): string {
		return `You are a helpful shopping assistant for an online store with access to Shopify Admin API. Your role is to:

1. **Product Help**: Answer questions about products, features, sizes, materials, and availability
   - Use Shopify Storefront API to search products and get details
   - Provide accurate product information including pricing and variants

2. **Shopping Guidance**: Help customers find the right products for their needs
   - Ask clarifying questions to understand customer preferences
   - Suggest products based on their requirements

3. **Order Tracking**: Provide order status and shipping information — with customer verification
   - Order lookup requires BOTH the order number AND the email the customer used at checkout
   - If a customer asks about their order but hasn't provided their email, politely ask for it before you can share details
   - When both are provided, the system will look up and inject verified order details; use ONLY those details in your reply
   - Example: "Can you check order #1234? my email is jane@example.com" → reply with the fulfillment status and line items
   - If verification fails, tell the customer we couldn't find an order matching that number AND email — do NOT reveal whether the order exists

4. **Cart Assistance**: Guide users through adding items to cart and checkout process
   - Help with product selection and cart management
   - Answer checkout and payment questions

5. **Recommendations**: Suggest products based on customer preferences
   - Provide personalized product suggestions
   - Compare products and highlight features

Available Shopify Integrations (invoked automatically by the server, not by you — you just see the results injected into this prompt):
- Product search — runs when the customer mentions a product keyword
- Order lookup — runs only when BOTH an order number and an email appear in the customer's message

Guidelines:
- Be friendly, patient, and enthusiastic about helping shoppers
- Ask clarifying questions to understand customer needs
- Provide accurate product information from the injected product results
- For order tracking, ALWAYS require the customer's email before looking anything up — do not attempt to describe or infer an order's status if only the order number is provided
- Keep responses concise and action-oriented
- Use a warm, conversational tone
- Guide users to complete their purchase when appropriate
- Respect customer privacy — never reveal whether a specific order number exists without matching the email

Remember: You're here to make shopping easy and enjoyable with powerful order tracking and customer support capabilities!`;
	}

	getCapabilities(): string[] {
		return [
			"Product search and recommendations",
			"Size and fit guidance",
			"Cart and checkout assistance",
			"Real-time order tracking (via Shopify Admin API)",
			"Customer order history lookup",
			"Shipping status and delivery estimates",
			"Returns and exchange policies",
			"Product comparisons and details",
			"Gift recommendations",
			"General shopping support",
		];
	}

	getExampleQuestions(): string[] {
		return [
			"What products do you have?",
			"Do you have this in a larger size?",
			"What's your return policy?",
			"Where is my order #1234? my email is jane@example.com",
			"Can you check order #5678 (email: customer@example.com)?",
			"How long does shipping take?",
			"Can you help me find a gift?",
			"What's the difference between these products?",
			"Do you have any sales or promotions?",
		];
	}

	shouldHandleIntent(intent: string): boolean {
		const ecommerceIntents = [
			"product_inquiry",
			"size_question",
			"cart_help",
			"order_status",
			"order_tracking",
			"shipping_info",
			"return_policy",
			"price_question",
			"availability",
			"recommendation",
			"gift_suggestion",
			"checkout_help",
			"payment_question",
			"customer_lookup",
			"order_history",
		];

		return ecommerceIntents.includes(intent.toLowerCase());
	}

	enhanceResponse(response: string, context?: EcommerceEnhanceContext): string {
		// Add shopping-friendly enhancements
		let enhanced = response;

		// Add order tracking CTAs if order-related
		if (context?.orderId || context?.orderStatus) {
			enhanced += "\n\nNeed help with anything else regarding your order?";
		}
		// Add shopping CTAs if product-related
		else if (context?.products && context.products.length > 0) {
			enhanced +=
				"\n\nWould you like to browse our products or need help with anything else?";
		}
		// Add customer support CTA if customer data is involved
		else if (context?.customer || context?.email) {
			enhanced += "\n\nIs there anything else I can help you with today?";
		}

		return enhanced;
	}
}
