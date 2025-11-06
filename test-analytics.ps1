# Test Chat and Capture Analytics Logs
# This script sends test messages and saves analytics to a file

Write-Host "🚀 Starting AI Chatbot with log capture..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing npm dev process
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*ts-node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Create logs directory if it doesn't exist
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

$logFile = "logs/analytics-$(Get-Date -Format 'yyyy-MM-dd-HHmm').log"

Write-Host "📝 Logs will be saved to: $logFile" -ForegroundColor Yellow
Write-Host ""

# Start server in background and redirect output to log file
$job = Start-Job -ScriptBlock {
    param($workingDir)
    Set-Location $workingDir
    npm run dev 2>&1
} -ArgumentList (Get-Location).Path

Write-Host "⏳ Waiting for server to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Test messages
$testMessages = @(
    @{ message = "Hi, what can you help me with?"; strategy = "portfolio" },
    @{ message = "Tell me about your projects"; strategy = "portfolio" },
    @{ message = "Do you have any blue shirts?"; strategy = "ecommerce" }
)

Write-Host "💬 Sending test messages..." -ForegroundColor Green
Write-Host ""

foreach ($test in $testMessages) {
    try {
        Write-Host "   Sending: $($test.message)" -ForegroundColor White
        
        $body = $test | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:4000/api/chat" `
                                      -Method Post `
                                      -ContentType "application/json" `
                                      -Body $body `
                                      -ErrorAction Stop
        
        Write-Host "   ✅ Response: $($response.data.response.Substring(0, [Math]::Min(60, $response.data.response.Length)))..." -ForegroundColor Gray
        Write-Host ""
        
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Wait a bit for logs to flush
Start-Sleep -Seconds 2

# Get job output and save to file
$output = Receive-Job $job
$output | Out-File $logFile

# Stop the server
Stop-Job $job
Remove-Job $job

Write-Host "✅ Test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Extracting analytics from logs..." -ForegroundColor Cyan
Write-Host ""

# Parse and display analytics
$analyticsLines = Get-Content $logFile | Select-String -Pattern '"event":"chat'

if ($analyticsLines.Count -eq 0) {
    Write-Host "⚠️  No analytics found in logs" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Raw log content:" -ForegroundColor Gray
    Get-Content $logFile | Select-Object -Last 20
} else {
    Write-Host "Found $($analyticsLines.Count) analytics events:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($line in $analyticsLines) {
        try {
            $logEvent = $line.Line | ConvertFrom-Json
            
            if ($logEvent.event -eq "chat_message") {
                Write-Host "  📝 Chat Message" -ForegroundColor Cyan
                Write-Host "     Time: $($logEvent.timestamp)"
                Write-Host "     Strategy: $($logEvent.strategy)"
                Write-Host "     Message Length: $($logEvent.messageLength)"
                Write-Host "     History: $($logEvent.historyLength) messages"
                Write-Host "     Has Context: $($logEvent.hasContext)"
                Write-Host "     Success: $($logEvent.success)"
                Write-Host ""
            }
            elseif ($logEvent.event -eq "chat_error") {
                Write-Host "  ❌ Chat Error" -ForegroundColor Red
                Write-Host "     Time: $($logEvent.timestamp)"
                Write-Host "     Strategy: $($logEvent.strategy)"
                Write-Host "     Error: $($logEvent.errorType) - $($logEvent.errorMessage)"
                Write-Host ""
            }
        }
        catch {
            Write-Host "  ⚠️  Could not parse: $($line.Line.Substring(0, [Math]::Min(80, $line.Line.Length)))" -ForegroundColor Yellow
        }
    }
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Full logs saved to: $logFile" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
