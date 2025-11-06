# Simple Analytics Viewer
# Run this after testing to see conversation metrics

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  AI Chatbot Analytics Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# In production, you'd query Vercel logs or your log aggregator
# For now, this shows what data you're collecting

Write-Host "📊 Metrics Being Tracked:" -ForegroundColor Green
Write-Host ""
Write-Host "  ✅ Event type (chat_message, chat_error)"
Write-Host "  ✅ Timestamp (ISO format)"
Write-Host "  ✅ Strategy used (portfolio, ecommerce, default)"
Write-Host "  ✅ Message length"
Write-Host "  ✅ Conversation history length"
Write-Host "  ✅ Has context (product data, etc.)"
Write-Host "  ✅ Success/failure status"
Write-Host "  ✅ Error types and messages"
Write-Host ""

Write-Host "📍 Where to View Logs:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Local Development:"
Write-Host "    - Check terminal where 'npm run dev' is running"
Write-Host "    - Look for JSON objects like: {""event"":""chat_message"",...}"
Write-Host ""
Write-Host "  Vercel Production:"
Write-Host "    1. Visit: https://vercel.com/odanree/ai-chatbot"
Write-Host "    2. Click 'Logs' tab"
Write-Host "    3. Filter by 'chat_message' or 'chat_error'"
Write-Host "    4. Export logs for analysis"
Write-Host ""
Write-Host "  Vercel Analytics (Built-in):"
Write-Host "    1. Visit: https://vercel.com/odanree/ai-chatbot/analytics"
Write-Host "    2. See: Request count, response times, error rates"
Write-Host "    3. Geographic data, device types"
Write-Host ""

Write-Host "💡 Next Steps:" -ForegroundColor Magenta
Write-Host ""
Write-Host "  1. Test your chatbot (use .\chat-test.ps1)"
Write-Host "  2. Check server logs for JSON analytics"
Write-Host "  3. Deploy to Vercel"
Write-Host "  4. View production analytics at Vercel dashboard"
Write-Host ""
Write-Host "  Advanced (Optional):"
Write-Host "    - Pipe logs to file: npm run dev > logs/chat.log"
Write-Host "    - Parse with jq: cat chat.log | Select-String 'chat_message' | ConvertFrom-Json"
Write-Host "    - Send to logging service (Datadog, Logtail, etc.)"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
