/**
 * AI Chatbot - Embeddable Chat Widget
 * 
 * Usage:
 * <script src="https://your-domain.com/chat-widget.js"></script>
 * <script>
 *   AIChatbot.init({
 *     apiUrl: 'https://your-api.com',
 *     position: 'bottom-right',
 *     theme: 'light'
 *   });
 * </script>
 */

(function() {
  'use strict';

  // Default configuration
  const DEFAULT_CONFIG = {
    apiUrl: window.location.origin,
    position: 'bottom-right',
    title: 'Chat Assistant',
    placeholder: 'Type your message...',
    theme: 'light',
    width: '400px',
    height: '500px',
    strategyType: 'default', // NEW: Strategy type
  };

  // Chat widget instance
  let chatWidget = null;
  let messages = [];

  /**
   * Initialize the chat widget
   */
  async function init(config = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Create and inject widget
    await createWidget(finalConfig);
    
    console.log('[AIChatbot] Widget initialized', finalConfig);
  }

  /**
   * Create the chat widget DOM
   */
  async function createWidget(config) {
    // Fetch strategy greeting
    let greeting = 'Hello! How can I help you today?';
    try {
      const strategyResponse = await fetch(`${config.apiUrl}/api/strategy/${config.strategyType}`);
      if (strategyResponse.ok) {
        const strategyData = await strategyResponse.json();
        if (strategyData.success && strategyData.data.greeting) {
          greeting = strategyData.data.greeting;
        }
      }
    } catch (error) {
      console.warn('[AIChatbot] Could not fetch strategy greeting, using default');
    }

    // Create container
    const container = document.createElement('div');
    container.id = 'ai-chatbot-widget';
    container.className = `ai-chatbot ${config.position} ${config.theme}`;
    container.style.cssText = `
      position: fixed;
      ${config.position.includes('right') ? 'right' : 'left'}: 20px;
      ${config.position.includes('bottom') ? 'bottom' : 'top'}: 20px;
      width: ${config.width};
      height: ${config.height};
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      z-index: 999999;
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'ai-chatbot-header';
    header.style.cssText = `
      padding: 16px;
      background: #007bff;
      color: white;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e0e0e0;
    `;

    const title = document.createElement('h3');
    title.textContent = config.title;
    title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = () => toggleWidget();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'ai-chatbot-messages';
    messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Input form
    const form = document.createElement('form');
    form.style.cssText = `
      padding: 12px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = config.placeholder;
    input.style.cssText = `
      flex: 1;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      font-family: inherit;
    `;

    const sendBtn = document.createElement('button');
    sendBtn.type = 'submit';
    sendBtn.textContent = 'Send';
    sendBtn.style.cssText = `
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    `;

    form.appendChild(input);
    form.appendChild(sendBtn);

    // Form submit handler
    form.onsubmit = async (e) => {
      e.preventDefault();
      const message = input.value.trim();

      if (!message) return;

      // Add user message
      addMessage('user', message);
      input.value = '';

      // Send to API
      try {
        sendBtn.disabled = true;
        const response = await fetch(`${config.apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message,
            strategyType: config.strategyType, // Send strategy type
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle API response format
        if (data.success && data.data) {
          addMessage('assistant', data.data.message);
        } else {
          addMessage('assistant', 'I could not generate a response.');
        }
      } catch (error) {
        addMessage('error', `Error: ${error.message}`);
      } finally {
        sendBtn.disabled = false;
      }
    };

    // Assemble widget
    container.appendChild(header);
    container.appendChild(messagesContainer);
    container.appendChild(form);

    // Inject into DOM
    document.body.appendChild(container);

    // Store references
    chatWidget = {
      container,
      messagesContainer,
      input,
      sendBtn,
      config,
    };

    // Add initial message from strategy
    addMessage('assistant', greeting);
  }

  /**
   * Add a message to the chat
   */
  function addMessage(role, content) {
    if (!chatWidget) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chatbot-message ai-chatbot-${role}`;
    messageDiv.style.cssText = `
      display: flex;
      justify-content: ${role === 'user' ? 'flex-end' : 'flex-start'};
      margin-bottom: 8px;
    `;

    const messageBubble = document.createElement('div');
    messageBubble.style.cssText = `
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 8px;
      background: ${role === 'user' ? '#007bff' : '#f0f0f0'};
      color: ${role === 'user' ? 'white' : 'black'};
      font-size: 14px;
      word-wrap: break-word;
      ${role === 'error' ? 'background: #ff6b6b; color: white;' : ''}
    `;
    messageBubble.textContent = content;

    messageDiv.appendChild(messageBubble);
    chatWidget.messagesContainer.appendChild(messageDiv);

    // Auto-scroll to bottom
    chatWidget.messagesContainer.scrollTop = chatWidget.messagesContainer.scrollHeight;

    // Store message
    messages.push({ role, content, timestamp: new Date() });
  }

  /**
   * Toggle widget visibility
   */
  function toggleWidget() {
    if (!chatWidget) return;

    const isVisible = chatWidget.container.style.display !== 'none';
    chatWidget.container.style.display = isVisible ? 'none' : 'flex';
  }

  /**
   * Get conversation history
   */
  function getHistory() {
    return messages;
  }

  /**
   * Clear chat history
   */
  function clearHistory() {
    messages = [];
    if (chatWidget) {
      chatWidget.messagesContainer.innerHTML = '';
      addMessage('assistant', 'Chat cleared. How can I help?');
    }
  }

  // Expose API
  window.AIChatbot = {
    init,
    toggle: toggleWidget,
    getHistory,
    clearHistory,
    version: '1.0.0', // Updated for strategy pattern
  };

  // Auto-initialize if data attribute is present
  document.addEventListener('DOMContentLoaded', () => {
    const scripts = document.querySelectorAll('script[data-ai-chatbot]');
    if (scripts.length > 0) {
      init();
    }
  });
})();
