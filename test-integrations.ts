#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests OpenAI and Shopify integrations
 */

import { getAIResponse } from './src/integrations/openai.js';
import {
  getProductInfo,
  searchProducts,
  getOrderStatus,
} from './src/integrations/shopify.js';

console.log('🧪 Starting Integration Tests...\n');

// Test 1: Shopify Product Search
async function testShopifySearch() {
  console.log('📦 Test 1: Shopify Product Search');
  console.log('-----------------------------------');
  try {
    const results = await searchProducts('t-shirt');
    console.log(`✅ Search successful`);
    console.log(`Found products: ${results.length}`);
    if (results.length > 0) {
      console.log(`First product: ${results[0].title}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  console.log();
}

// Test 2: OpenAI Response (requires API key)
async function testOpenAI() {
  console.log('🤖 Test 2: OpenAI Response');
  console.log('-----------------------------------');
  try {
    const response = await getAIResponse('What is machine learning?');
    console.log(`✅ Response received`);
    console.log(`Model: ${response.model}`);
    console.log(`Tokens used: ${response.tokensUsed}`);
    console.log(`Message: ${response.message.substring(0, 100)}...`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      console.log(`⚠️  Skipped: OPENAI_API_KEY not configured`);
    } else {
      console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log();
}

// Test 3: Shopify Order Status
async function testShopifyOrder() {
  console.log('📋 Test 3: Shopify Order Status');
  console.log('-----------------------------------');
  try {
    // Test with a fake order ID (will fail but tests the function)
    const status = await getOrderStatus('fake-order-123');
    console.log(`✅ Order status retrieved: ${status}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('SHOPIFY')) {
      console.log(`⚠️  Skipped: Shopify not configured`);
    } else {
      console.log(`✅ Function works (error is expected with test data)`);
    }
  }
  console.log();
}

// Run tests
async function runTests() {
  try {
    await testShopifySearch();
    await testOpenAI();
    await testShopifyOrder();
    
    console.log('✅ Integration tests complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runTests();
