# Chat with AI - Interactive Test
# Make sure the server is running first: npm run dev

$API_URL = "http://localhost:4000"

Write-Host "AI Chatbot - Interactive Test" -ForegroundColor Green
Write-Host "Type 'exit' to quit" -ForegroundColor Yellow
Write-Host ""

$conversationHistory = @()

while ($true) {
    Write-Host "You: " -ForegroundColor Cyan -NoNewline
    $userMessage = Read-Host
    
    if ($userMessage -eq "exit") {
        Write-Host "Goodbye!" -ForegroundColor Green
        break
    }
    
    if ([string]::IsNullOrWhiteSpace($userMessage)) {
        continue
    }
    
    try {
        $body = @{
            message = $userMessage
            conversationHistory = $conversationHistory
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$API_URL/api/chat" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "AI: " -ForegroundColor Magenta -NoNewline
            Write-Host $response.data.message
            Write-Host ""
            
            # Add to conversation history
            $conversationHistory += @{role = "user"; content = $userMessage}
            $conversationHistory += @{role = "assistant"; content = $response.data.message}
        } else {
            Write-Host "Error: $($response.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Make sure the server is running (npm run dev)" -ForegroundColor Yellow
    }
}
