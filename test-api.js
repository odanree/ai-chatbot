#!/usr/bin/env node

/**
 * API Deployment Test Script
 * Tests the production API with bypass token
 */

import 'dotenv/config';

const API_URL = 'https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app';
const BYPASS_TOKEN = process.env.VERCEL_PROTECTION_BYPASS;

if (!BYPASS_TOKEN) {
  console.error('❌ Error: VERCEL_PROTECTION_BYPASS not set in .env.local');
  console.error('   Get your token from: Vercel Dashboard → ai-chatbot → Settings → Protection');
  process.exit(1);
}

console.log('🚀 Testing AI Chatbot API Deployment\n');
console.log(`📍 API URL: ${API_URL}`);
console.log(`🔐 Using bypass token: ${BYPASS_TOKEN.substring(0, 20)}...`);
console.log('');

const headers = {
  'x-vercel-protection-bypass': BYPASS_TOKEN,
  'Content-Type': 'application/json',
};

async function testEndpoint(method, path, body = null) {
  const url = `${API_URL}${path}`;
  console.log(`\n📡 ${method} ${path}`);
  console.log(`   ${url}`);

  try {
    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const results = [];

  // Test 1: Root endpoint
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 1: GET / (API Info)');
  console.log('═══════════════════════════════════════════');
  results.push(await testEndpoint('GET', '/'));

  // Test 2: Health check
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 2: GET /api/health (Health Check)');
  console.log('═══════════════════════════════════════════');
  results.push(await testEndpoint('GET', '/api/health'));

  // Test 3: Rate limit status
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 3: GET /api/rate-limit (Rate Limit Status)');
  console.log('═══════════════════════════════════════════');
  results.push(await testEndpoint('GET', '/api/rate-limit'));

  // Test 4: Chat endpoint
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 4: POST /api/chat (Chat Message)');
  console.log('═══════════════════════════════════════════');
  results.push(
    await testEndpoint('POST', '/api/chat', {
      message: 'Hello! What is the AI Chatbot?',
      conversationHistory: [],
    })
  );

  // Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════');
  const passed = results.filter((r) => r).length;
  const total = results.length;
  console.log(`✅ Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! API is working correctly.\n');
    process.exit(0);
  } else {
    console.log(
      `\n⚠️  ${total - passed} test(s) failed. Check the output above.\n`
    );
    process.exit(1);
  }
}

runTests();
