/**
 * Runtime RAG retrieval.
 *
 * Loads `data/knowledge.json` once at cold-start (built at deploy time by
 * `src/knowledge/build.ts`) and exposes a top-k cosine-similarity search over
 * the chunks. If the index is missing (e.g. build script wasn't run), lookups
 * fail closed: return empty context and log a warning, so the chat continues
 * on the strategy's static system prompt.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import { flush, traced } from "../integrations/langfuse.js";
import type { KnowledgeChunk, KnowledgeIndex } from "./types.js";

const INDEX_PATH = join(process.cwd(), "data", "knowledge.json");
const DEFAULT_TOP_K = 5;
// Any candidate whose cosine similarity is below this is dropped even if it's
// in the top-k. Prevents unrelated chunks from leaking in when the user asks
// off-topic questions.
const MIN_SIMILARITY = 0.2;

let cache: KnowledgeIndex | null = null;
let cacheLoadAttempted = false;

function loadIndex(): KnowledgeIndex | null {
	if (cacheLoadAttempted) return cache;
	cacheLoadAttempted = true;
	if (!existsSync(INDEX_PATH)) {
		console.warn(
			`[rag-retrieve] no index at ${INDEX_PATH} — retrieval disabled, falling back to static system prompt`,
		);
		return null;
	}
	try {
		cache = JSON.parse(readFileSync(INDEX_PATH, "utf8")) as KnowledgeIndex;
		console.log(
			`[rag-retrieve] loaded index: ${cache.chunks.length} chunks, generated ${cache.generatedAt}`,
		);
		return cache;
	} catch (e) {
		console.error(
			"[rag-retrieve] failed to parse index — retrieval disabled:",
			e,
		);
		return null;
	}
}

function cosine(a: number[], b: number[]): number {
	let dot = 0;
	let normA = 0;
	let normB = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}
	if (normA === 0 || normB === 0) return 0;
	return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedQuery(
	query: string,
	model: string,
): Promise<number[] | null> {
	if (!process.env.OPENAI_API_KEY) {
		console.warn("[rag-retrieve] OPENAI_API_KEY not set — retrieval disabled");
		return null;
	}
	try {
		const openai = traced(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), {
			generationName: "rag.retrieve.embed",
			metadata: { model },
		});
		const res = await openai.embeddings.create({ model, input: query });
		await flush(openai);
		return res.data[0].embedding;
	} catch (e) {
		console.error("[rag-retrieve] query embedding failed:", e);
		return null;
	}
}

/**
 * Return the top-k most relevant KnowledgeChunks for a query, or [] if the
 * index is missing / embedding fails. Fails closed — never throws.
 */
export async function retrieveRelevant(
	query: string,
	k: number = DEFAULT_TOP_K,
): Promise<KnowledgeChunk[]> {
	const index = loadIndex();
	if (!index) return [];
	const qVec = await embedQuery(query, index.embeddingModel);
	if (!qVec) return [];
	const scored = index.chunks.map((c) => ({
		c,
		score: cosine(qVec, c.embedding),
	}));
	scored.sort((a, b) => b.score - a.score);
	return scored
		.filter((s) => s.score >= MIN_SIMILARITY)
		.slice(0, k)
		.map((s) => s.c);
}

/**
 * Format retrieved chunks as a system-prompt context block, or empty string
 * if no chunks. Callers append this to the strategy's system prompt.
 */
export function formatContext(chunks: KnowledgeChunk[]): string {
	if (chunks.length === 0) return "";
	const body = chunks.map((c) => c.text).join("\n\n---\n\n");
	return `\n\nRETRIEVED CONTEXT (grounded from https://danhle.net/data/portfolio.json — answer using ONLY this context; if it doesn't cover the question, say you don't have that information):\n\n${body}\n\n---\nEND CONTEXT\n`;
}
