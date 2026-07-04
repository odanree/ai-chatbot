import { Langfuse, observeOpenAI } from 'langfuse';
import type OpenAI from 'openai';

let lf: Langfuse | null | undefined;

function getLangfuse(): Langfuse | null {
  if (lf !== undefined) return lf;
  const { LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY } = process.env;
  if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
    lf = null;
    return lf;
  }
  lf = new Langfuse({
    publicKey: LANGFUSE_PUBLIC_KEY,
    secretKey: LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_HOST,
    environment: process.env.LANGFUSE_ENVIRONMENT ?? 'development',
  });
  const flush = (): void => {
    lf?.flushAsync().catch(() => {});
  };
  process.once('SIGTERM', flush);
  process.once('beforeExit', flush);
  return lf;
}

export interface TraceOpts {
  generationName: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export function traced<T extends OpenAI>(openai: T, opts: TraceOpts): T {
  if (!getLangfuse()) return openai;
  return observeOpenAI(openai, opts) as unknown as T;
}

// Ships queued events to Langfuse. Serverless runtimes (Vercel, Lambda) freeze
// the process between requests without firing `beforeExit`, so the SDK's
// in-memory queue is discarded unless we flush explicitly per request.
// Safe to call on the raw client too — it's a no-op when observeOpenAI didn't wrap.
export async function flush(client: unknown): Promise<void> {
  const fn = (client as { flushAsync?: () => Promise<unknown> })?.flushAsync;
  if (typeof fn === 'function') await fn.call(client).catch(() => {});
}
