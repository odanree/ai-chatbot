#!/usr/bin/env powershell

# Simple API Test Debug Script

$API_URL = "https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app"
$TOKEN = "thisisa32charsecretsoletsdoit111"

Write-Host "`n🔍 API Test Debug" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📍 API URL: $API_URL" -ForegroundColor Cyan
Write-Host "🔐 Token Length: $($TOKEN.Length)" -ForegroundColor Cyan
Write-Host "🔐 Token Preview: $($TOKEN.Substring(0, 10))..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing with bypass token in header..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$API_URL/" `
        -Headers @{"x-vercel-protection-bypass" = $TOKEN} `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5)
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $errorMsg = $_.Exception.Message
    
    Write-Host "❌ Error: $errorMsg" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "`n⚠️  Authentication/Authorization Issue" -ForegroundColor Yellow
        Write-Host "   Token might be invalid or expired" -ForegroundColor Yellow
        Write-Host "   Get a new token from Vercel Dashboard" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "`n⚠️  404 Not Found" -ForegroundColor Yellow
        Write-Host "   The route might not exist or the API is not responding correctly" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Yellow
    Write-Host "Could not read full response body from error"
}
