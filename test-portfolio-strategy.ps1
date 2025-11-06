# Test Portfolio Strategy
Write-Host "Testing Portfolio Strategy..." -ForegroundColor Cyan

# Test 1: Get strategy info
Write-Host "`n1. Testing GET /api/strategy/portfolio..." -ForegroundColor Yellow
$strategyResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/strategy/portfolio" -Method Get
Write-Host "Strategy Type: $($strategyResponse.strategyType)" -ForegroundColor Green
Write-Host "Greeting: $($strategyResponse.greeting)" -ForegroundColor Green
Write-Host "Tone: $($strategyResponse.tone)" -ForegroundColor Green
Write-Host "Suggested Questions:" -ForegroundColor Green
$strategyResponse.suggestedQuestions | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }

# Test 2: List all strategies
Write-Host "`n2. Testing GET /api/strategies..." -ForegroundColor Yellow
$strategiesResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/strategies" -Method Get
Write-Host "Available Strategies:" -ForegroundColor Green
$strategiesResponse.strategies | ForEach-Object { 
    Write-Host "  - $($_.type): $($_.description) (Enabled: $($_.enabled))" -ForegroundColor Cyan 
}

# Test 3: Chat with portfolio strategy
Write-Host "`n3. Testing POST /api/chat with portfolio strategy..." -ForegroundColor Yellow
$chatBody = @{
    message = "What's Danh's experience with React?"
    strategyType = "portfolio"
} | ConvertTo-Json

$chatResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/chat" -Method Post -Body $chatBody -ContentType "application/json"
Write-Host "Question: What's Danh's experience with React?" -ForegroundColor Green
Write-Host "AI Response: $($chatResponse.response)" -ForegroundColor Cyan

# Test 4: Chat with default strategy
Write-Host "`n4. Testing POST /api/chat with default strategy..." -ForegroundColor Yellow
$defaultBody = @{
    message = "What's Danh's experience with React?"
    strategyType = "default"
} | ConvertTo-Json

$defaultResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/chat" -Method Post -Body $defaultBody -ContentType "application/json"
Write-Host "Question: What's Danh's experience with React?" -ForegroundColor Green
Write-Host "AI Response: $($defaultResponse.response)" -ForegroundColor Cyan

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
