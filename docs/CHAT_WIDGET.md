# Chat Widget - Implementation Guide

## Overview

The AI Chatbot Chat Widget is an embeddable JavaScript component that can be added to any website to provide instant customer support and product information through AI-powered conversations.

## Features

- ✅ **Cross-Origin Support**: Load from any domain
- ✅ **Customizable Appearance**: Light/dark themes, position options, custom colors
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop
- ✅ **API Integration**: Connects to your AI Chatbot backend
- ✅ **Conversation History**: Tracks messages within session
- ✅ **Error Handling**: Graceful error messages and recovery

## Installation

### 1. Basic Setup

Add the following to your HTML file (typically in the `<head>` or before `</body>`):

```html
<!-- Load Chat Widget CSS (optional, for styling) -->
<link rel="stylesheet" href="https://your-domain.com/chat-widget.css">

<!-- Load Chat Widget Script -->
<script src="https://your-domain.com/chat-widget.js"></script>

<!-- Initialize Widget -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    AIChatbot.init({
      apiUrl: 'https://your-api-domain.com',
      title: 'Customer Support',
      position: 'bottom-right',
      theme: 'light'
    });
  });
</script>
```

### 2. Auto-Initialize

Alternatively, add the `data-ai-chatbot` attribute to auto-initialize:

```html
<script src="https://your-domain.com/chat-widget.js" data-ai-chatbot></script>
```

## Configuration Options

### init(config)

Initialize the chat widget with custom options:

```javascript
AIChatbot.init({
  // API endpoint for chat requests
  apiUrl: 'https://your-api.com',              // Default: window.location.origin
  
  // Widget appearance
  title: 'Chat Assistant',                     // Default: 'Chat Assistant'
  placeholder: 'Type your message...',         // Default: 'Type your message...'
  
  // Position on screen
  position: 'bottom-right',                    // Options: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  
  // Theme
  theme: 'light',                              // Options: 'light', 'dark'
  
  // Dimensions
  width: '400px',                              // Default: '400px'
  height: '500px'                              // Default: '500px'
});
```

## API Methods

### AIChatbot.init(config)
Initialize the chat widget with custom configuration.

### AIChatbot.toggle()
Show/hide the chat widget.

```javascript
AIChatbot.toggle();
```

### AIChatbot.getHistory()
Get the current conversation history.

```javascript
const messages = AIChatbot.getHistory();
console.log(messages);
// Output: [
//   { role: 'assistant', content: 'Hello!', timestamp: Date },
//   { role: 'user', content: 'Hi there', timestamp: Date }
// ]
```

### AIChatbot.clearHistory()
Clear the chat history and reset the conversation.

```javascript
AIChatbot.clearHistory();
```

## Usage Examples

### Example 1: Basic Setup (Ecommerce Store)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Store</title>
  <link rel="stylesheet" href="https://chatbot.example.com/chat-widget.css">
</head>
<body>
  <h1>Welcome to My Store!</h1>
  
  <script src="https://chatbot.example.com/chat-widget.js"></script>
  <script>
    AIChatbot.init({
      apiUrl: 'https://chatbot.example.com',
      title: 'Product Assistant',
      position: 'bottom-right',
      theme: 'light'
    });
  </script>
</body>
</html>
```

### Example 2: Dark Theme with Custom Position

```javascript
AIChatbot.init({
  apiUrl: 'https://api.example.com',
  title: 'Support Chat',
  position: 'bottom-left',
  theme: 'dark',
  width: '350px',
  height: '450px'
});
```

### Example 3: Get Conversation History

```javascript
// Get all messages
const history = AIChatbot.getHistory();

// Send to backend for logging
fetch('https://api.example.com/chat-history', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: history })
});
```

### Example 4: Toggle Widget Programmatically

```javascript
// Hide on page load
AIChatbot.toggle();

// Show widget after user scrolls
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    AIChatbot.toggle();
  }
});
```

## API Endpoint Requirements

The chat widget sends requests to `{apiUrl}/api/chat` with the following format:

### Request

```json
{
  "message": "What is the price of the blue t-shirt?"
}
```

### Response

```json
{
  "response": "The blue t-shirt is available for $29.99 with fast shipping."
}
```

## Styling & Customization

### Custom CSS

Override widget styles with custom CSS:

```css
/* Change header color */
#ai-chatbot-widget.light .ai-chatbot-header {
  background-color: #ff6b6b !important;
}

/* Change message bubble style */
#ai-chatbot-widget.light .ai-chatbot-message.ai-chatbot-user .ai-message-bubble {
  background-color: #ff6b6b !important;
}

/* Adjust widget size */
#ai-chatbot-widget {
  width: 500px !important;
  height: 600px !important;
}
```

### Theme Customization

```javascript
// Add custom theme in your CSS
AIChatbot.init({
  apiUrl: 'https://api.example.com'
  // Add custom class to widget for styling
});

// Then in your CSS:
/*
#ai-chatbot-widget.custom-theme {
  --primary-color: #ff6b6b;
  --message-color: #333;
}
*/
```

## Security Considerations

1. **CORS**: Ensure your API allows requests from the domains where the widget is embedded
2. **API Key**: Store API keys securely; don't expose them in client-side code
3. **Content Validation**: Validate and sanitize all user input and API responses
4. **Rate Limiting**: Implement rate limiting on your `/api/chat` endpoint

## Error Handling

The widget gracefully handles errors:

- Network errors → "Error: Network request failed"
- API errors → "Error: API error: [status]"
- Invalid responses → "I could not generate a response."

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Script size: ~15KB (minified)
- CSS size: ~8KB (minified)
- Load time: <500ms on typical connections
- Memory usage: ~2-5MB per instance

## Troubleshooting

### Widget not appearing?
1. Check browser console for errors
2. Verify `apiUrl` is correct
3. Ensure scripts are loaded in correct order

### Messages not sending?
1. Check CORS configuration on your API
2. Verify API endpoint responds with correct format
3. Check network tab in browser developer tools

### Styling issues?
1. Import `chat-widget.css` before initializing
2. Check for CSS conflicts with your site's styles
3. Use CSS specificity or `!important` to override

## Version

Current version: **0.2.0**

## Support

For issues or feature requests, please open an issue on GitHub or contact support.
