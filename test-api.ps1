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

$API_URL = "https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app"
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

$results = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Body
    )

    $url = "$API_URL$Path"
    Write-Host "`n📡 $Method $Path" -ForegroundColor Cyan
    Write-Host "   $url"

    try {
        $headers = @{
            "x-vercel-protection-bypass" = $BYPASS_TOKEN
            "Content-Type" = "application/json"
        }

        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Compress)
        }

        $response = Invoke-WebRequest @params
        $data = $response.Content | ConvertFrom-Json

        Write-Host "✅ Success ($($response.StatusCode))" -ForegroundColor Green
        Write-Host "   Response:" ($data | ConvertTo-Json -Depth 3) | Out-String
        return $true
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test 1: Root endpoint
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "TEST 1: GET / (API Info)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
$results += Test-Endpoint -Method "GET" -Path "/"

# Test 2: Health check
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "TEST 2: GET /api/health (Health Check)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
$results += Test-Endpoint -Method "GET" -Path "/api/health"

# Test 3: Rate limit status
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "TEST 3: GET /api/rate-limit (Rate Limit Status)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
$results += Test-Endpoint -Method "GET" -Path "/api/rate-limit"

# Test 4: Chat endpoint
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "TEST 4: POST /api/chat (Chat Message)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
$results += Test-Endpoint -Method "POST" -Path "/api/chat" -Body @{
    message = "Hello! What is the AI Chatbot?"
    conversationHistory = @()
}

# Summary
Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "📊 TEST SUMMARY" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta

$passed = ($results | Where-Object { $_ -eq $true }).Count
$total = $results.Count

Write-Host "✅ Passed: $passed/$total" -ForegroundColor Green

if ($passed -eq $total) {
    Write-Host "`n🎉 All tests passed! API is working correctly.`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  $($total - $passed) test(s) failed. Check the output above.`n" -ForegroundColor Yellow
    exit 1
}
