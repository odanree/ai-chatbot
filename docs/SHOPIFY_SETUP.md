# Shopify Integration Setup Guide

This guide walks through setting up and testing the Shopify integration for the AI Chatbot.

## Prerequisites

- Shopify store (free or paid)
- Node.js 18+
- npm or yarn

## Step 1: Get Shopify API Credentials

### Storefront API Token (Public - for product searches)

1. Go to your Shopify Admin: https://admin.shopify.com
2. Navigate to **Settings** → **Apps and integrations** → **Develop apps**
3. Create a new app
4. In **Configuration**, find **Storefront API**
5. Click **Storefront API access scopes**
6. Check these scopes:
   - `products:read` - Read product data
   - `orders:read` - Read order info
7. Click **Save**
8. Scroll to **Admin API access tokens**
9. Copy the **Storefront API access token**

### Admin API Token (Private - for orders and customers)

1. In the same app configuration:
2. Scroll to **Admin API**
3. Click **Admin API access scopes**
4. Check these scopes:
   - `read_orders` - Read orders
   - `read_customers` - Read customer data
   - `read_products` - Read products
4. Click **Save**
5. Scroll to **Tokens**
6. Copy the **Admin API access token**

### Store Domain

1. In Shopify Admin, go to **Settings** → **General**
2. Look for "Store address"
3. Your domain is in format: `your-store.myshopify.com`

## Step 2: Configure Environment Variables

1. Edit `.env.local`:
   ```bash
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
   SHOPIFY_ADMIN_API_TOKEN=your-admin-token
   ```

2. Save the file (it's in `.gitignore`, won't be committed)

## Step 3: Test Shopify Integration

### Health Check
```bash
curl http://localhost:4000/api/health
```

### Search Products
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What t-shirts do you have?"}'
```

The bot will search Shopify and return products!

### Get Order Status
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the status of order #1234?"}'
```

### Get Customer Info
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Can you look up my account? My email is customer@example.com"}'
```

## Features Implemented

### ✅ Core Functions

1. **`getProductInfo(productId)`**
   - Fetch product details from Shopify
   - Returns: product title, description, price, image, variants

2. **`searchProducts(query, limit)`**
   - Search products by keyword
   - Default limit: 10 products
   - Returns: list of matching products

3. **`getOrderStatus(orderId)`** (Requires Admin API)
   - Get order details by ID
   - Returns: order number, status, items, total price
   - Requires `SHOPIFY_ADMIN_API_TOKEN`

4. **`getCustomerData(email)`** (Requires Admin API)
   - Fetch customer info by email
   - Returns: name, contact, address, order history
   - Requires `SHOPIFY_ADMIN_API_TOKEN`

### ✅ Error Handling

- Store domain validation
- Token validation
- GraphQL error handling
- Specific error codes:
  - `MISSING_STORE_DOMAIN` - Store domain not configured
  - `MISSING_STOREFRONT_TOKEN` - Storefront token not configured
  - `MISSING_ADMIN_TOKEN` - Admin token not configured
  - `PRODUCT_NOT_FOUND` - Product doesn't exist
  - `ORDER_NOT_FOUND` - Order doesn't exist
  - `CUSTOMER_NOT_FOUND` - Customer not found
  - `GRAPHQL_ERROR` - GraphQL query error

### ✅ TypeScript Types

```typescript
interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  image?: string;
  variants?: ShopifyVariant[];
}

interface ShopifyOrder {
  id: string;
  orderNumber: number;
  status: string;
  createdAt: string;
  totalPrice: string;
  lineItems: ShopifyLineItem[];
}
```

## API Versions

- Storefront API: 2024-01
- Admin API: 2024-01

These match the versions configured in the code.

## Troubleshooting

### Error: "SHOPIFY_STORE_DOMAIN environment variable is not set"

**Solution**: Add to `.env.local`:
```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

### Error: "SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not set"

**Solution**: Get token from Shopify Admin and add to `.env.local`:
```bash
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token
```

### Error: "401 Unauthorized"

**Solution**: Token may be expired or incorrect
1. Check token in `.env.local` matches Shopify Admin
2. Verify token has correct scopes
3. Create a new token if needed

### Error: "Product not found"

**Solution**: Verify product ID is correct
1. Get product ID from Shopify Admin URL: `/products/123456`
2. Format must be numeric or GraphQL ID

### Error: "GraphQL error"

**Solution**: Check GraphQL query syntax
- Verify field names match Shopify schema
- Check variables are properly formatted
- Review Shopify GraphQL API docs

## Integration with AI Bot

The bot can now:
1. **Search products** when customers ask about products
2. **Check order status** when customers provide order info
3. **Look up customer data** to provide personalized support
4. **Answer product questions** with real inventory data

## Shopify GraphQL API Documentation

- [Storefront API Reference](https://shopify.dev/api/storefront)
- [Admin API Reference](https://shopify.dev/api/admin)
- [GraphQL Playground](https://shopify.dev/api/admin/graphql-playground)

## Example Integration

In the bot logic, you could use Shopify like this:

```typescript
import { searchProducts, getOrderStatus } from '../integrations/shopify.js';

// Search for products
const products = await searchProducts('t-shirt', 5);
console.log(`Found ${products.length} t-shirts`);

// Get order details
const order = await getOrderStatus('123456');
console.log(`Order #${order.orderNumber} status: ${order.status}`);
```

## Next Steps

1. ✅ Shopify integration complete
2. 🚧 Chat widget component (Task #3)
3. 🔄 Bot context management (Task #5)
4. 🔄 Testing and deployment

## Scopes Reference

### Storefront API Scopes
- `products:read` - Read product data
- `orders:read` - Read public order data
- `customer_account:read` - Read customer account

### Admin API Scopes
- `read_orders` - View orders
- `read_customers` - View customers
- `read_products` - View products
- `read_inventory` - View inventory

---

**Last Updated**: November 3, 2025
