# Phase 4 Design Patterns - Comprehensive Summary

## 🎨 4 Core Design Patterns Used

---

## 1. **Singleton Pattern** ⭐

### Purpose
Ensure only ONE instance of a class exists throughout the application lifetime.

### Implementation
```typescript
// File: src/bot/context.ts
class ContextManager {
  private sessions: Map<string, ConversationSession> = new Map();
  // ... implementation
}

// Singleton instance (created once)
export const contextManager: ContextManager = new ContextManager();
export default contextManager;
```

```typescript
// File: src/bot/intents.ts
class IntentRecognizer {
  private readonly productKeywords: string[] = [...];
  // ... implementation
}

// Singleton instance (created once)
export const intentRecognizer: IntentRecognizer = new IntentRecognizer();
export default intentRecognizer;
```

### How It's Used
```typescript
// Anywhere in the code:
import { contextManager } from './context.js';
import { intentRecognizer } from './intents.js';

// Always the SAME instance - no duplication
contextManager.addMessage(...);
intentRecognizer.recognize(...);
```

### Benefits
✅ **Single Instance**: Only one context manager in memory  
✅ **Consistency**: All code uses the same session data  
✅ **Resource Efficient**: No duplicate objects  
✅ **State Sharing**: All modules see the same state  

### Real-World Analogy
Like having ONE shared address book for the entire office instead of each person maintaining their own copy.

---

## 2. **Factory Pattern** 🏭

### Purpose
Create objects using a dedicated factory method instead of using `new` directly.

### Implementation
```typescript
// File: src/bot/context.ts
class ContextManager {
  // Factory method - creates sessions
  private createNewSession(userId: string, sessionId: string): ConversationSession {
    const session: ConversationSession = {
      sessionId,
      userId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      context: {
        userId,
        sessionId,
      },
    };

    const key: string = `${userId}:${sessionId}`;
    this.sessions.set(key, session);
    return session;
  }

  // Public method uses the factory
  public getOrCreateSession(userId: string, sessionId: string): ConversationSession {
    const key: string = `${userId}:${sessionId}`;

    if (this.sessions.has(key)) {
      // Retrieve existing
      const session = this.sessions.get(key);
      if (session) {
        return session;
      }
    }

    // Use factory to create new
    return this.createNewSession(userId, sessionId);
  }
}
```

### How It's Used
```typescript
// Instead of directly creating sessions:
// ❌ DON'T do this:
// const session = new ConversationSession(...);

// ✅ DO use the factory:
const session = contextManager.getOrCreateSession(userId, sessionId);
```

### Factory Methods in Phase 4
1. **`createNewSession()`** - Creates ConversationSession objects
2. **`recognize()`** - Creates IntentResult objects
3. **`addMessage()`** - Creates Message objects

### Benefits
✅ **Encapsulation**: Object creation logic is hidden  
✅ **Flexibility**: Can change creation logic in one place  
✅ **Validation**: Can validate during creation  
✅ **Consistency**: All created objects follow same pattern  

### Real-World Analogy
Like using a bakery to bake custom cakes instead of baking them yourself. The bakery knows how to do it right.

---

## 3. **Strategy Pattern** 🎯

### Purpose
Choose different algorithms/handlers at runtime based on conditions.

### Implementation
```typescript
// File: src/bot/index.ts
async function processBotMessage(request: BotRequest): Promise<BotResponse> {
  const { message, userId, sessionId } = request;

  // Recognize intent
  const intentResult: IntentResult = intentRecognizer.recognize(message, userId, sessionId);

  // Step 4: Route to appropriate HANDLER/STRATEGY
  let response: string = '';

  try {
    // Different STRATEGIES based on suggestedHandler
    if (intentResult.suggestedHandler === 'shopify') {
      // STRATEGY 1: Use Shopify Handler
      response = await handleShopifyIntent(intentResult, message, userContext);
    } else if (intentResult.suggestedHandler === 'openai') {
      // STRATEGY 2: Use OpenAI Handler
      response = await handleOpenAIIntent(intentResult, message, history);
    } else {
      // STRATEGY 3: Use Hybrid Handler (Try Shopify first, fallback to OpenAI)
      try {
        response = await handleShopifyIntent(intentResult, message, userContext);
        if (!response || response.length === 0) {
          response = await handleOpenAIIntent(intentResult, message, history);
        }
      } catch (error) {
        console.log('[Bot] Shopify handler failed, falling back to OpenAI');
        response = await handleOpenAIIntent(intentResult, message, history);
      }
    }
  } catch (error) {
    console.error('[Bot] Error processing message:', error);
    response = "I apologize, but I'm having trouble processing your request.";
  }

  return { response, intent: intentResult.intent, confidence: intentResult.confidence, handler: intentResult.suggestedHandler };
}
```

### The Three Strategies
```typescript
// STRATEGY 1: Shopify Handler
async function handleShopifyIntent(
  intentResult: IntentResult,
  message: string,
  userContext: Record<string, unknown>
): Promise<string> {
  // Strategy: Search Shopify for products
  switch (intentResult.intent) {
    case Intent.PRODUCT_INQUIRY:
      return await searchProducts(productType);
    case Intent.PRICING_QUESTION:
      return await searchProducts(productType);
    case Intent.ORDER_STATUS:
      return await getOrderStatus(orderId);
    default:
      return `How can I help with our products?`;
  }
}

// STRATEGY 2: OpenAI Handler
async function handleOpenAIIntent(
  intentResult: IntentResult,
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // Strategy: Use AI for conversation
  const response = await getAIResponse(message);
  return response;
}

// STRATEGY 3: Hybrid Handler
// Try Shopify first, fallback to OpenAI (automatic retry strategy)
```

### Handler Selection Logic
```
Message: "Do you have blue shirts?"
    ↓
Intent: PRODUCT_INQUIRY
    ↓
Select Strategy: Shopify
    ↓
Execute: searchProducts("blue shirts")
    ↓
Return: "I found 5 blue shirts..."

---

Message: "Hello there!"
    ↓
Intent: SMALL_TALK
    ↓
Select Strategy: OpenAI
    ↓
Execute: getAIResponse("Hello there!")
    ↓
Return: "Hi! How can I help you today?"
```

### Benefits
✅ **Flexibility**: Easy to switch between handlers  
✅ **Testability**: Can test each strategy independently  
✅ **Extensibility**: Easy to add new strategies (e.g., custom handler)  
✅ **Runtime Selection**: Choose strategy based on data  

### Real-World Analogy
Like choosing different payment methods (credit card, PayPal, Apple Pay) based on what's available and best for the situation.

---

## 4. **Auto-Cleanup Initialization Pattern** 🔄

### Purpose
Initialize background processes at module load time without explicit calls.

### Implementation
```typescript
// File: src/bot/context.ts (end of file)

// IIFE (Immediately Invoked Function Expression)
// This runs automatically when the module is loaded
setInterval(() => {
  const cleaned: number = contextManager.cleanupExpiredSessions();
  if (cleaned > 0) {
    console.log(`[Context] Cleaned up ${cleaned} expired sessions`);
  }
}, 5 * 60 * 1000); // Every 5 minutes
```

### How It Works
```typescript
// When this module is imported anywhere:
import { contextManager } from './context.js';

// The setInterval at the bottom runs automatically:
// 1. First run: 5 minutes after import
// 2. Then every 5 minutes thereafter
// 3. Automatically removes expired sessions (30+ min old)
```

### Lifecycle
```
Module Load
    ↓
setInterval() runs
    ↓
Every 5 minutes:
  ├─ Check all sessions
  ├─ Find expired ones (older than 30 min)
  ├─ Delete expired sessions
  └─ Log how many were cleaned
    ↓
[Repeats until process exits]
```

### What Gets Cleaned
```typescript
public cleanupExpiredSessions(): number {
  let cleanedCount: number = 0;
  const now: number = Date.now();

  for (const [key, session] of this.sessions.entries()) {
    // If session hasn't been used in 30 minutes
    if (now - session.updatedAt > this.SESSION_TIMEOUT) {
      this.sessions.delete(key); // Delete it
      cleanedCount++;
    }
  }

  return cleanedCount;
}
```

### Benefits
✅ **Automatic**: No need to manually trigger cleanup  
✅ **Hands-off**: Runs in background without user code  
✅ **Memory Efficient**: Prevents memory leaks from old sessions  
✅ **Simple**: Encapsulated in one place  

### Real-World Analogy
Like an automatic sprinkler system that waters your garden on a schedule without you having to remember.

---

## 📊 Pattern Comparison Table

| Pattern | When Used | What It Does | Example |
|---------|-----------|-------------|---------|
| **Singleton** | System-wide resources | Only ONE instance | `contextManager` |
| **Factory** | Object creation | Encapsulates creation logic | `createNewSession()` |
| **Strategy** | Multiple algorithms | Choose algorithm at runtime | Handler selection |
| **Auto-Cleanup** | Background tasks | Automatic initialization | Session expiration |

---

## 🔄 How They Work Together

### Flow Example: Processing a User Message

```
1. USER SENDS MESSAGE
   ↓
2. SINGLETON PATTERN
   • Use single instance: contextManager
   • Get or create session (uses FACTORY PATTERN)
   ↓
3. FACTORY PATTERN
   • createNewSession() creates ConversationSession
   • Returns properly initialized object
   ↓
4. MESSAGE STORAGE
   • Add to contextManager.messages (singleton)
   ↓
5. INTENT RECOGNITION
   • Use single instance: intentRecognizer (singleton)
   • Recognizes intent (creates IntentResult via factory)
   ↓
6. STRATEGY PATTERN
   • Select handler based on intent:
     - PRODUCT_INQUIRY → Shopify Strategy
     - SMALL_TALK → OpenAI Strategy
     - GENERAL → OpenAI Strategy
   ↓
7. EXECUTE STRATEGY
   • Call selected handler function
   ↓
8. RESPONSE STORED
   • Add response via contextManager (singleton)
   ↓
9. AUTO-CLEANUP (Background)
   • Every 5 minutes, check for expired sessions
   • Automatically clean up old ones
```

---

## 💻 Code Examples for Each Pattern

### Singleton in Action
```typescript
// Module A
import { contextManager } from './context.js';
contextManager.addMessage(userId, sessionId, 'user', 'Hello');

// Module B (different file)
import { contextManager } from './context.js';
const history = contextManager.getHistory(userId, sessionId);

// ✅ Same instance! Both see the same messages
```

### Factory in Action
```typescript
// Factory creates different objects based on parameters
const session1 = contextManager.getOrCreateSession('user1', 'session1');
const session2 = contextManager.getOrCreateSession('user2', 'session2');
const session3 = contextManager.getOrCreateSession('user1', 'session1'); // Returns same as session1

// Each object is unique, properly initialized
```

### Strategy in Action
```typescript
// Same function, different behavior based on intent
const result1 = intentRecognizer.recognize('Do you have shirts?');
// → suggestedHandler: 'shopify'

const result2 = intentRecognizer.recognize('Hello!');
// → suggestedHandler: 'openai'

// processBotMessage() picks different strategies automatically
```

### Auto-Cleanup in Action
```typescript
// Automatic background process
// No code needed - it just works!

// Session created at 2:00 PM
contextManager.getOrCreateSession('user1', 'session1');

// At 2:30 PM - still active
contextManager.getHistory('user1', 'session1'); // Works fine

// At 2:35 PM - AUTO-CLEANUP runs (5 min interval)
// Session not used for 35 minutes > 30 min timeout
// → Automatically deleted!

// At 2:36 PM - Session is gone
contextManager.getHistory('user1', 'session1');
// → Creates NEW session automatically
```

---

## 🎯 Why These Patterns?

| Pattern | Problem It Solves |
|---------|------------------|
| **Singleton** | Need to share state across modules without global variables |
| **Factory** | Complex object creation should be encapsulated |
| **Strategy** | Need flexible handler selection based on conditions |
| **Auto-Cleanup** | Memory management should be automatic, not manual |

---

## 📚 References in Code

### Singleton
- `src/bot/context.ts` (line 281-282): `export const contextManager`
- `src/bot/intents.ts` (line 217): `export const intentRecognizer`

### Factory
- `src/bot/context.ts` (lines 61-79): `private createNewSession()`

### Strategy
- `src/bot/index.ts` (lines 38-68): Handler selection logic
- `src/bot/index.ts` (lines 74-136): `handleShopifyIntent()`
- `src/bot/index.ts` (lines 138-178): `handleOpenAIIntent()`

### Auto-Cleanup
- `src/bot/context.ts` (lines 284-290): `setInterval()` cleanup

---

## ✅ Benefits Summary

### Singleton ✅
- Single source of truth
- No duplicate objects in memory
- Consistent state across application
- Easy to test with mocks

### Factory ✅
- Encapsulation of creation logic
- Easy to modify creation without changing callers
- Can add validation/processing
- Type-safe object creation

### Strategy ✅
- Easy to add new handlers without modifying existing code
- Runtime selection based on conditions
- Each strategy is independent
- Easy to test each strategy separately

### Auto-Cleanup ✅
- Prevents memory leaks
- Automatic process
- No manual intervention needed
- Scales with number of sessions

---

## 🎓 Learning Summary

These 4 patterns work together to create:
1. **Organized Code**: Each pattern has a specific purpose
2. **Maintainable Code**: Easy to understand and modify
3. **Testable Code**: Each component can be tested independently
4. **Scalable Code**: Easy to add new features without breaking existing ones

---

**Date**: November 3, 2025  
**Project**: AI Chatbot - Phase 4  
**Status**: ✅ Production Ready
