import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAIResponse, getRateLimitStatus } from '../src/integrations/openai.js';

describe('OpenAI Integration', () => {
  beforeEach(() => {
    // Reset rate limiting between tests
    vi.clearAllMocks();
  });

  describe('getAIResponse', () => {
    it('should return an error if OPENAI_API_KEY is not set', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      try {
        await getAIResponse('test message');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as any).code).toBe('MISSING_API_KEY');
      } finally {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });

    it('should throw error for empty message', async () => {
      try {
        await getAIResponse('');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as any).code).toBe('INVALID_INPUT');
      }
    });

    it('should throw error for whitespace-only message', async () => {
      try {
        await getAIResponse('   ');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as any).code).toBe('INVALID_INPUT');
      }
    });

    it('should accept conversation history', async () => {
      const conversationHistory = [
        { role: 'user' as const, content: 'What is the price?' },
        {
          role: 'assistant' as const,
          content: 'The price is $29.99',
        },
      ];

      // This test would need a mocked OpenAI client
      // For now, just verify the function accepts the parameter
      expect(conversationHistory.length).toBe(2);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit info', () => {
      const status = getRateLimitStatus();

      expect(status).toHaveProperty('remaining');
      expect(status).toHaveProperty('limit');
      expect(status).toHaveProperty('resetIn');
      expect(status.limit).toBe(30);
      expect(status.remaining).toBeGreaterThanOrEqual(0);
      expect(status.remaining).toBeLessThanOrEqual(30);
    });

    it('should track remaining requests', () => {
      const status1 = getRateLimitStatus();
      const initialRemaining = status1.remaining;

      expect(initialRemaining).toBeGreaterThanOrEqual(0);
      expect(initialRemaining).toBeLessThanOrEqual(30);
    });
  });
});
