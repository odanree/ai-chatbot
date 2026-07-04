import { observeOpenAI } from 'langfuse';
import type OpenAI from 'openai';

// Env vars used (all read by the langfuse SDK's internal singleton):
//   LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY  — required, gate the no-op path
//   LANGFUSE_BASEURL                          — e.g. https://us.cloud.langfuse.com
//   LANGFUSE_TRACING_ENVIRONMENT              — e.g. production
function enabled(): boolean {
  return !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
}

export interface TraceOpts {
  generationName: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export function traced<T extends OpenAI>(openai: T, opts: TraceOpts): T {
  const on = enabled();
  console.log(
    '[langfuse:diag] traced()',
    JSON.stringify({
      generationName: opts.generationName,
      enabled: on,
      pk: !!process.env.LANGFUSE_PUBLIC_KEY,
      sk: !!process.env.LANGFUSE_SECRET_KEY,
      baseurl: process.env.LANGFUSE_BASEURL ?? null,
      env: process.env.LANGFUSE_TRACING_ENVIRONMENT ?? null,
    }),
  );
  if (!on) return openai;
  const wrapped = observeOpenAI(openai, opts) as unknown as T;
  console.log(
    '[langfuse:diag] wrapped',
    JSON.stringify({
      hasFlushAsync: typeof (wrapped as { flushAsync?: unknown }).flushAsync === 'function',
    }),
  );
  return wrapped;
}

// Ships queued events to Langfuse. Serverless runtimes (Vercel, Lambda) freeze
// the process between requests without firing `beforeExit`, so the SDK's
// in-memory queue is discarded unless we flush explicitly per request.
// Safe to call on the raw client too — it's a no-op when observeOpenAI didn't wrap.
export async function flush(client: unknown): Promise<void> {
  const fn = (client as { flushAsync?: () => Promise<unknown> })?.flushAsync;
  console.log('[langfuse:diag] flush()', JSON.stringify({ hasFn: typeof fn === 'function' }));
  if (typeof fn === 'function') {
    try {
      const t0 = Date.now();
      await fn.call(client);
      console.log('[langfuse:diag] flush ok', JSON.stringify({ ms: Date.now() - t0 }));
    } catch (e) {
      console.error('[langfuse:diag] flush error', e);
    }
  }
}
