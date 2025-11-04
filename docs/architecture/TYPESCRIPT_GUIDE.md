# TypeScript vs JavaScript - Factory Pattern Example

## 📝 Original TypeScript Code

```typescript
/**
 * Create a new conversation session
 */
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
```

---

## 🔄 JavaScript Equivalent

### Option 1: Direct JavaScript Translation
```javascript
/**
 * Create a new conversation session
 */
createNewSession(userId, sessionId) {
  const session = {
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

  const key = `${userId}:${sessionId}`;
  this.sessions.set(key, session);
  return session;
}
```

---

## 📊 Differences Explained

### TypeScript Version
```typescript
private createNewSession(userId: string, sessionId: string): ConversationSession {
```

### JavaScript Version
```javascript
createNewSession(userId, sessionId) {
```

### What Changed?

| TypeScript | JavaScript | What It Means |
|-----------|-----------|--------------|
| `private` | (removed) | TypeScript keyword - in JS, just omit it |
| `userId: string` | `userId` | Type annotation removed |
| `sessionId: string` | `sessionId` | Type annotation removed |
| `: ConversationSession` | (removed) | Return type annotation removed |

---

## 💡 Key Differences

### 1. **Type Annotations Removed**
```typescript
// TypeScript - specifies types
const session: ConversationSession = { ... }
const key: string = `${userId}:${sessionId}`
```

```javascript
// JavaScript - no type info
const session = { ... }
const key = `${userId}:${sessionId}`
```

### 2. **Access Modifiers Removed**
```typescript
// TypeScript
private createNewSession(...) { }
```

```javascript
// JavaScript - no access modifiers
createNewSession(...) { }
```

### 3. **Everything Else Is The Same**
```typescript
// Both use:
Date.now()           // Get current timestamp
this.sessions.set()  // Store in Map
Object literals      // Create objects
Template literals    // ${} syntax
```

---

## 🎯 Full Class Comparison

### TypeScript Version
```typescript
class ContextManager {
  private sessions: Map<string, ConversationSession> = new Map();
  private readonly MAX_HISTORY: number = 20;
  private readonly SESSION_TIMEOUT: number = 30 * 60 * 1000;

  public getOrCreateSession(userId: string, sessionId: string): ConversationSession {
    // ... implementation
  }

  private createNewSession(userId: string, sessionId: string): ConversationSession {
    // ... implementation
  }

  public addMessage(
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, unknown>
  ): Message {
    // ... implementation
  }
}
```

### JavaScript Equivalent
```javascript
class ContextManager {
  constructor() {
    this.sessions = new Map();
    this.MAX_HISTORY = 20;
    this.SESSION_TIMEOUT = 30 * 60 * 1000;
  }

  getOrCreateSession(userId, sessionId) {
    // ... implementation
  }

  createNewSession(userId, sessionId) {
    // ... implementation
  }

  addMessage(userId, sessionId, role, content, metadata) {
    // ... implementation
  }
}
```

### Differences:
1. **No type annotations** (string, number, etc.)
2. **No access modifiers** (private, public)
3. **No readonly keyword**
4. **Need explicit constructor** for property initialization
5. **No parameter types** or **return types**

---

## ✅ Full JavaScript Translation

Here's the complete JavaScript version of the entire file:

```javascript
/**
 * Conversation Context Management (JavaScript Version)
 * Handles conversation history, session management, and user context enrichment
 */

class ContextManager {
  constructor() {
    this.sessions = new Map();
    this.MAX_HISTORY = 20;
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Create or get a conversation session
   */
  getOrCreateSession(userId, sessionId) {
    const key = `${userId}:${sessionId}`;

    if (this.sessions.has(key)) {
      const session = this.sessions.get(key);
      if (session) {
        // Check if session is still valid
        if (Date.now() - session.updatedAt > this.SESSION_TIMEOUT) {
          this.sessions.delete(key);
          return this.createNewSession(userId, sessionId);
        }
        session.updatedAt = Date.now();
        return session;
      }
    }

    return this.createNewSession(userId, sessionId);
  }

  /**
   * Create a new conversation session
   */
  createNewSession(userId, sessionId) {
    const session = {
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

    const key = `${userId}:${sessionId}`;
    this.sessions.set(key, session);
    return session;
  }

  /**
   * Add a message to conversation history
   */
  addMessage(userId, sessionId, role, content, metadata) {
    const session = this.getOrCreateSession(userId, sessionId);

    const message = {
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };

    session.messages.push(message);

    // Keep only recent messages to manage memory
    if (session.messages.length > this.MAX_HISTORY) {
      session.messages = session.messages.slice(-this.MAX_HISTORY);
    }

    session.updatedAt = Date.now();
    return message;
  }

  /**
   * Get conversation history
   */
  getHistory(userId, sessionId, limit) {
    const session = this.getOrCreateSession(userId, sessionId);
    const messages = session.messages;

    if (limit && limit > 0) {
      return messages.slice(-limit);
    }

    return messages;
  }

  /**
   * Get formatted history for AI context
   */
  getFormattedHistory(userId, sessionId, limit) {
    const messages = this.getHistory(userId, sessionId, limit);
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Update user context information
   */
  updateContext(userId, sessionId, contextData) {
    const session = this.getOrCreateSession(userId, sessionId);
    session.context = {
      ...session.context,
      ...contextData,
    };
    session.updatedAt = Date.now();
  }

  /**
   * Get user context
   */
  getContext(userId, sessionId) {
    const session = this.getOrCreateSession(userId, sessionId);
    return session.context;
  }

  /**
   * Get full session data
   */
  getSession(userId, sessionId) {
    return this.getOrCreateSession(userId, sessionId);
  }

  /**
   * Clear conversation history
   */
  clearHistory(userId, sessionId) {
    const session = this.getOrCreateSession(userId, sessionId);
    session.messages = [];
    session.updatedAt = Date.now();
  }

  /**
   * Clear entire session
   */
  clearSession(userId, sessionId) {
    const key = `${userId}:${sessionId}`;
    this.sessions.delete(key);
  }

  /**
   * Get conversation summary for context
   */
  getSummary(userId, sessionId) {
    const messages = this.getHistory(userId, sessionId, 10);

    if (messages.length === 0) {
      return 'No previous conversation history.';
    }

    const userMessages = messages.filter((msg) => msg.role === 'user');
    const assistantMessages = messages.filter((msg) => msg.role === 'assistant');

    const summary = `Conversation Summary:
- Total messages: ${messages.length}
- User messages: ${userMessages.length}
- Assistant responses: ${assistantMessages.length}
- Last message: ${messages[messages.length - 1].content.substring(0, 100)}...`;

    return summary;
  }

  /**
   * Check if session has context
   */
  hasContext(userId, sessionId) {
    const session = this.getOrCreateSession(userId, sessionId);
    return session.messages.length > 0;
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions() {
    let cleanedCount = 0;
    const now = Date.now();

    for (const [key, session] of this.sessions.entries()) {
      if (now - session.updatedAt > this.SESSION_TIMEOUT) {
        this.sessions.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get session statistics
   */
  getStats() {
    let totalMessages = 0;

    for (const session of this.sessions.values()) {
      totalMessages += session.messages.length;
    }

    return {
      totalSessions: this.sessions.size,
      totalMessages,
      averageMessagesPerSession: this.sessions.size > 0 ? totalMessages / this.sessions.size : 0,
    };
  }
}

// Singleton instance
const contextManager = new ContextManager();

// Periodic cleanup (every 5 minutes)
setInterval(() => {
  const cleaned = contextManager.cleanupExpiredSessions();
  if (cleaned > 0) {
    console.log(`[Context] Cleaned up ${cleaned} expired sessions`);
  }
}, 5 * 60 * 1000);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { contextManager, ContextManager };
}
```

---

## 🎯 Quick Reference Table

| TypeScript | JavaScript | Note |
|-----------|-----------|------|
| `private method()` | `method()` | Remove access modifiers |
| `param: string` | `param` | Remove type annotations |
| `(): ReturnType` | `)` | Remove return type |
| `const x: Type = ...` | `const x = ...` | Remove type on variables |
| `readonly MAX = 20` | `this.MAX = 20` | In constructor |
| `Map<K, V>` | `Map()` | Generic types removed |
| `Record<string, T>` | Object or Map | Use plain objects |

---

## 💡 Why TypeScript?

**TypeScript adds:**
- ✅ Type checking at compile time (catches bugs early)
- ✅ Better IDE autocomplete/suggestions
- ✅ Self-documenting code (types show intent)
- ✅ Refactoring safety (rename safely across codebase)

**JavaScript:**
- ✅ Simpler, no compilation step
- ❌ Types checked at runtime (bugs appear in production)
- ❌ Less IDE support
- ❌ Harder to refactor safely

---

## 🔄 How to Use in JavaScript

```javascript
// Create context manager instance
const manager = new ContextManager();

// Use it just like TypeScript version
manager.getOrCreateSession('user-123', 'session-456');
manager.addMessage('user-123', 'session-456', 'user', 'Hello!');
const history = manager.getHistory('user-123', 'session-456');

// Everything works the same!
```

---

## 📝 Summary

**TypeScript** = JavaScript + Types + Access Modifiers  
**JavaScript** = Just the code, without type declarations

The **logic is identical**, only the type information is removed!

---

**Date**: November 3, 2025  
**Context**: Phase 4 - Bot Logic  
**Reference**: `src/bot/context.ts`
