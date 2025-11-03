import fetch from 'node-fetch';

// Type definitions
interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  image?: string;
  variants?: ShopifyVariant[];
}

interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  available: boolean;
}

interface ShopifyOrder {
  id: string;
  orderNumber: number;
  status: string;
  createdAt: string;
  totalPrice: string;
  lineItems: ShopifyLineItem[];
}

interface ShopifyLineItem {
  id: string;
  title: string;
  quantity: number;
  price: string;
}

interface ShopifyError extends Error {
  code?: string;
  status?: number;
}

// Initialize Shopify client
const SHOPIFY_DOMAIN: string = process.env.SHOPIFY_STORE_DOMAIN || '';
const STOREFRONT_TOKEN: string = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const ADMIN_TOKEN: string = process.env.SHOPIFY_ADMIN_API_TOKEN || '';

const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;
const ADMIN_API_URL = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`;

/**
 * Validate Shopify configuration
 */
function validateShopifyConfig(): void {
  if (!SHOPIFY_DOMAIN) {
    const error: ShopifyError = new Error(
      'SHOPIFY_STORE_DOMAIN environment variable is not set'
    );
    error.code = 'MISSING_STORE_DOMAIN';
    throw error;
  }

  if (!STOREFRONT_TOKEN) {
    const error: ShopifyError = new Error(
      'SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not set'
    );
    error.code = 'MISSING_STOREFRONT_TOKEN';
    throw error;
  }
}

/**
 * Make GraphQL request to Shopify Storefront API
 */
async function makeStorefrontRequest(query: string, variables: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(STOREFRONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const error: ShopifyError = new Error(
        `Shopify Storefront API error: ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const data = (await response.json()) as Record<string, unknown>;

    if ('errors' in data && data.errors) {
      const error: ShopifyError = new Error(
        `Shopify GraphQL error: ${JSON.stringify(data.errors)}`
      );
      error.code = 'GRAPHQL_ERROR';
      throw error;
    }

    return data as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error calling Shopify Storefront API');
  }
}

/**
 * Get product information by ID
 */
export async function getProductInfo(productId: string): Promise<ShopifyProduct> {
  validateShopifyConfig();

  const query = `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              available
            }
          }
        }
      }
    }
  `;

  try {
    const data = await makeStorefrontRequest(query, {
      id: `gid://shopify/Product/${productId}`,
    });

    const product = (data.data as Record<string, unknown>).product as Record<string, unknown>;

    if (!product) {
      const error: ShopifyError = new Error('Product not found');
      error.code = 'PRODUCT_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const priceRange = product.priceRange as Record<string, unknown>;
    const minPrice = (priceRange.minVariantPrice as Record<string, unknown>).amount;

    return {
      id: product.id as string,
      title: product.title as string,
      description: product.description as string,
      price: minPrice as string,
      image: ((product.featuredImage as Record<string, unknown>)?.url) as string | undefined,
      variants: [],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch product info');
  }
}

/**
 * Search products by query
 */
export async function searchProducts(query: string, limit: number = 10): Promise<ShopifyProduct[]> {
  validateShopifyConfig();

  const graphqlQuery = `
    query SearchProducts($query: String!, $first: Int!) {
      search(query: $query, first: $first, types: PRODUCT) {
        edges {
          node {
            ... on Product {
              id
              title
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                url
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await makeStorefrontRequest(graphqlQuery, {
      query,
      first: limit,
    });

    const searchResults = (data.data as Record<string, unknown>).search as Record<string, unknown>;
    const edges = searchResults.edges as Array<Record<string, Record<string, unknown>>>;

    return edges.map((edge) => {
      const product = edge.node;
      const priceRange = product.priceRange as Record<string, unknown>;
      const minPrice = (priceRange.minVariantPrice as Record<string, unknown>).amount;

      return {
        id: product.id as string,
        title: product.title as string,
        description: product.description as string,
        price: minPrice as string,
        image: ((product.featuredImage as Record<string, unknown>)?.url) as string | undefined,
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to search products');
  }
}

/**
 * Get order status by order ID
 * Requires Admin API token
 */
export async function getOrderStatus(orderId: string): Promise<ShopifyOrder> {
  if (!ADMIN_TOKEN) {
    const error: ShopifyError = new Error(
      'SHOPIFY_ADMIN_API_TOKEN environment variable is not set'
    );
    error.code = 'MISSING_ADMIN_TOKEN';
    throw error;
  }

  const query = `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        orderNumber
        displayFulfillmentStatus
        createdAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 10) {
          edges {
            node {
              id
              title
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables: { id: `gid://shopify/Order/${orderId}` } }),
    });

    if (!response.ok) {
      const error: ShopifyError = new Error(
        `Shopify Admin API error: ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const data = (await response.json()) as Record<string, unknown>;

    if ('errors' in data && data.errors) {
      const error: ShopifyError = new Error(
        `Shopify Admin GraphQL error: ${JSON.stringify(data.errors)}`
      );
      error.code = 'GRAPHQL_ERROR';
      throw error;
    }

    const order = (data.data as Record<string, unknown>).order as Record<string, unknown>;

    if (!order) {
      const error: ShopifyError = new Error('Order not found');
      error.code = 'ORDER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const totalPrice = ((order.totalPriceSet as Record<string, Record<string, unknown>>).shopMoney as Record<string, unknown>).amount;
    const lineItemsData = (order.lineItems as Record<string, unknown>).edges as Array<Record<string, Record<string, unknown>>>;

    return {
      id: order.id as string,
      orderNumber: order.orderNumber as number,
      status: order.displayFulfillmentStatus as string,
      createdAt: order.createdAt as string,
      totalPrice: totalPrice as string,
      lineItems: lineItemsData.map((item) => {
        const node = item.node;
        const price = ((node.originalUnitPriceSet as Record<string, Record<string, unknown>>).shopMoney as Record<string, unknown>).amount;
        return {
          id: node.id as string,
          title: node.title as string,
          quantity: node.quantity as number,
          price: price as string,
        };
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch order status');
  }
}

/**
 * Get customer data by email
 * Requires Admin API token
 */
export async function getCustomerData(email: string): Promise<Record<string, unknown>> {
  if (!ADMIN_TOKEN) {
    const error: ShopifyError = new Error(
      'SHOPIFY_ADMIN_API_TOKEN environment variable is not set'
    );
    error.code = 'MISSING_ADMIN_TOKEN';
    throw error;
  }

  const query = `
    query GetCustomer($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            firstName
            lastName
            phone
            defaultAddress {
              city
              province
              country
            }
            orders(first: 5) {
              totalCount
              edges {
                node {
                  id
                  orderNumber
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { query: `email:"${email}"` },
      }),
    });

    if (!response.ok) {
      const error: ShopifyError = new Error(
        `Shopify Admin API error: ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const data = (await response.json()) as Record<string, unknown>;

    if ('errors' in data && data.errors) {
      const error: ShopifyError = new Error(
        `Shopify Admin GraphQL error: ${JSON.stringify(data.errors)}`
      );
      error.code = 'GRAPHQL_ERROR';
      throw error;
    }

    const customersEdges = ((data.data as Record<string, unknown>).customers as Record<string, unknown>).edges as Array<Record<string, Record<string, unknown>>>;

    if (customersEdges.length === 0) {
      const error: ShopifyError = new Error('Customer not found');
      error.code = 'CUSTOMER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return customersEdges[0].node;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch customer data');
  }
}
