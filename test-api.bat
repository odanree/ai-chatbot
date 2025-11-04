@echo off
REM API Deployment Test Script
REM Tests the production API with bypass token

setlocal enabledelayedexpansion

REM Check if bypass token is in .env.local
set BYPASS_TOKEN=thisisa32charsecretsoletsdoit111

if "!BYPASS_TOKEN!"=="" (
    echo ❌ Error: Bypass token not found
    echo    Add your bypass token to this script or .env.local
    exit /b 1
)

set API_URL=https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app

echo.
echo 🚀 Testing AI Chatbot API Deployment
echo.
echo 📍 API URL: !API_URL!
echo 🔐 Bypass token configured
echo.

REM Test 1: Root endpoint
echo ═══════════════════════════════════════════
echo TEST 1: GET / (API Info)
echo ═══════════════════════════════════════════
powershell -Command "Invoke-WebRequest -Uri '!API_URL!/' -Headers @{'x-vercel-protection-bypass'='!BYPASS_TOKEN!'} -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json"
echo.

REM Test 2: Health check
echo ═══════════════════════════════════════════
echo TEST 2: GET /api/health (Health Check)
echo ═══════════════════════════════════════════
powershell -Command "Invoke-WebRequest -Uri '!API_URL!/api/health' -Headers @{'x-vercel-protection-bypass'='!BYPASS_TOKEN!'} -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json"
echo.

REM Test 3: Rate limit status
echo ═══════════════════════════════════════════
echo TEST 3: GET /api/rate-limit (Rate Limit Status)
echo ═══════════════════════════════════════════
powershell -Command "Invoke-WebRequest -Uri '!API_URL!/api/rate-limit' -Headers @{'x-vercel-protection-bypass'='!BYPASS_TOKEN!'} -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json"
echo.

REM Test 4: Chat endpoint
echo ═══════════════════════════════════════════
echo TEST 4: POST /api/chat (Chat Message)
echo ═══════════════════════════════════════════
powershell -Command "Invoke-WebRequest -Uri '!API_URL!/api/chat' -Method POST -Headers @{'x-vercel-protection-bypass'='!BYPASS_TOKEN!'; 'Content-Type'='application/json'} -Body '{\"message\": \"Hello! What is the AI Chatbot?\", \"conversationHistory\": []}' -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json"
echo.

echo ═══════════════════════════════════════════
echo 📊 TEST SUMMARY
echo ═══════════════════════════════════════════
echo ✅ All tests completed
echo.
echo 🎉 API testing complete!
echo.

endlocal
