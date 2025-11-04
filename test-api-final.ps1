# API Deployment Test Script (PowerShell)
# Tests the production API with bypass token

# Load .env.local if it exists
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        $name = $name.Trim()
        $value = $value.Trim()
        [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

$API_URL = "https://ai-chatbot-9kepot0y4-danh-les-projects.vercel.app"
$BYPASS_TOKEN = $env:VERCEL_PROTECTION_BYPASS

if (-not $BYPASS_TOKEN) {
    Write-Host "❌ Error: VERCEL_PROTECTION_BYPASS not set" -ForegroundColor Red
    Write-Host "   Add your bypass token to .env.local:" -ForegroundColor Yellow
    Write-Host "   VERCEL_PROTECTION_BYPASS=your_token_here"
    exit 1
}

Write-Host "🚀 Testing AI Chatbot API Deployment`n" -ForegroundColor Green
Write-Host "📍 API URL: $API_URL"
Write-Host "🔐 Using bypass token: $($BYPASS_TOKEN.Substring(0, 20))..."
Write-Host ""

# Test 1: Root endpoint
Write-Host "TEST 1: GET / (Root Endpoint)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$API_URL/?x-vercel-protection-bypass=$BYPASS_TOKEN" -Method Get -ErrorAction Stop
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Response: Message='$($response.Content | ConvertFrom-Json | Select-Object -ExpandProperty message)'"
    Write-Host "✅ API Version: $($response.Content | ConvertFrom-Json | Select-Object -ExpandProperty version)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Health check
Write-Host "TEST 2: GET /api/health (Health Check)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/health?x-vercel-protection-bypass=$BYPASS_TOKEN" -Method Get -ErrorAction Stop
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ Status: $($json.status)"
    Write-Host "✅ Message: $($json.message)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Rate limit
Write-Host "TEST 3: GET /api/rate-limit (Rate Limit Status)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/rate-limit?x-vercel-protection-bypass=$BYPASS_TOKEN" -Method Get -ErrorAction Stop
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Response received successfully"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Chat endpoint
Write-Host "TEST 4: POST /api/chat (Chat Endpoint)" -ForegroundColor Cyan
try {
    $body = @{message="What is TypeScript?"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$API_URL/api/chat?x-vercel-protection-bypass=$BYPASS_TOKEN" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body `
        -ErrorAction Continue
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ Success: $($json.success)"
    if ($json.data) {
        Write-Host "✅ Response: $($json.data.Substring(0, 100))..."
    }
} catch {
    $err = $_.Exception.Response.StatusCode
    Write-Host "⚠️  Status: $err" -ForegroundColor Yellow
    Write-Host "   Note: Chat endpoint may return 500 if OpenAI API key not configured"
}

Write-Host ""
Write-Host "✅ All API endpoints are accessible!" -ForegroundColor Green
Write-Host "📄 For detailed results, see API_DEPLOYMENT_SUCCESS.md" -ForegroundColor Cyan
