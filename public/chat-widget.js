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
    userId: null, // Optional: host page can pass a stable user id (e.g. Shopify customer id) for Langfuse attribution
  };

  // localStorage key for the per-browser session id used to correlate Langfuse traces
  const SESSION_ID_KEY = 'ai-chatbot-session-id';

  // Chat widget instance
  let chatWidget = null;
  let messages = [];

  /**
   * Get or create a stable per-browser session id. Persisted in localStorage so
   * refreshes/tab-switches stay in the same Langfuse session; regenerated only
   * if the user clears storage. Falls back to a per-load random id in browsers
   * where localStorage is disabled (private mode / cookie-blocked embeds).
   */
  function getOrCreateSessionId() {
    try {
      const existing = localStorage.getItem(SESSION_ID_KEY);
      if (existing) return existing;
      const fresh = generateId();
      localStorage.setItem(SESSION_ID_KEY, fresh);
      return fresh;
    } catch (_) {
      return generateId();
    }
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'sess-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
  }

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

    // Create mobile FAB (Floating Action Button)
    const fab = document.createElement('button');
    fab.id = 'ai-chatbot-fab';
    fab.className = config.position;
    fab.innerHTML = '💬';
    fab.setAttribute('aria-label', 'Open chat');
    fab.onclick = () => openWidget();

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
      background: #0056b3;
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

    // Add focus handler for accessibility
    input.addEventListener('focus', function() {
      this.style.outline = '3px solid #0056b3';
      this.style.outlineOffset = '2px';
      this.style.borderColor = '#0056b3';
    });

    input.addEventListener('blur', function() {
      this.style.outline = 'none';
      this.style.borderColor = '#e0e0e0';
    });

    const sendBtn = document.createElement('button');
    sendBtn.type = 'submit';
    sendBtn.textContent = 'Send';
    sendBtn.style.cssText = `
      background: #0056b3;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    `;

    // Add focus handler for accessibility
    sendBtn.addEventListener('focus', function() {
      this.style.outline = '3px solid #0056b3';
      this.style.outlineOffset = '2px';
    });

    sendBtn.addEventListener('blur', function() {
      this.style.outline = 'none';
    });

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
        // Compact prior turns into the shape the OpenAI messages array expects.
        // We exclude the message the user just typed (server appends it) and any
        // 'error' rows (those are widget-side render markers, not real assistant turns).
        const conversationHistory = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(0, -1)
          .map((m) => ({ role: m.role, content: m.content }));

        const body = {
          message,
          strategyType: config.strategyType,
          sessionId: chatWidget.sessionId,
          conversationHistory,
        };
        if (config.userId) body.userId = config.userId;

        const response = await fetch(`${config.apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
    document.body.appendChild(fab);
    document.body.appendChild(container);

    // Store references
    chatWidget = {
      container,
      messagesContainer,
      input,
      sendBtn,
      config,
      fab,
      sessionId: getOrCreateSessionId(),
    };

    // Restore persisted closed state
    if (localStorage.getItem('ai-chatbot-state') === 'closed') {
      container.style.display = 'none';
      fab.style.display = 'flex';
    }

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
      background: ${role === 'user' ? '#0056b3' : '#f0f0f0'};
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
   * Open the widget (for mobile FAB button)
   */
  function openWidget() {
    if (!chatWidget) return;

    chatWidget.container.style.display = 'flex';
    chatWidget.container.classList.add('open'); // Add class for mobile CSS
    chatWidget.fab.style.display = 'none';
    localStorage.removeItem('ai-chatbot-state');
    
    // Focus input
    setTimeout(() => chatWidget.input.focus(), 100);
  }

  /**
   * Toggle widget visibility
   */
  function toggleWidget() {
    if (!chatWidget) return;

    const isVisible = chatWidget.container.style.display !== 'none';
    
    if (isVisible) {
      // Close widget
      chatWidget.container.style.display = 'none';
      chatWidget.container.classList.remove('open'); // Remove class for mobile CSS
      chatWidget.fab.style.display = 'flex';
      localStorage.setItem('ai-chatbot-state', 'closed');
    } else {
      // Open widget
      openWidget();
    }
  }

  /**
   * Get conversation history
   */
  function getHistory() {
    return messages;
  }

  /**
   * Clear chat history. Rotates the sessionId so the next turn starts a fresh
   * Langfuse session — otherwise old + new turns coalesce into one session with
   * a hole where the cleared messages used to be.
   */
  function clearHistory() {
    messages = [];
    if (chatWidget) {
      try {
        localStorage.removeItem(SESSION_ID_KEY);
      } catch (_) {}
      chatWidget.sessionId = getOrCreateSessionId();
      chatWidget.messagesContainer.innerHTML = '';
      addMessage('assistant', 'Chat cleared. How can I help?');
    }
  }

  // Expose API
  window.AIChatbot = {
    init,
    toggle: toggleWidget,
    open: openWidget,
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
