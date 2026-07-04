/**
 * Build-time RAG indexer.
 *
 * Fetches the public portfolio snapshot at PORTFOLIO_JSON_URL (defaults to
 * https://danhle.net/data/portfolio.json — see portfolio ADR 002), chunks
 * each project and experience entry, embeds each chunk with
 * text-embedding-3-small, and writes the resulting KnowledgeIndex to
 * data/knowledge.json.
 *
 * The chatbot's runtime loads that JSON once at cold-start and does an
 * in-memory cosine-similarity search per user query. No live calls to the
 * portfolio site at chat time — the snapshot is baked into the deployment.
 *
 * Run before the chatbot's build:
 *   OPENAI_API_KEY=... npm run build:knowledge
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import OpenAI from "openai";
import type { KnowledgeChunk, KnowledgeIndex } from "./types.js";

const PORTFOLIO_JSON_URL =
  process.env.PORTFOLIO_JSON_URL || "https://danhle.net/data/portfolio.json";
const EMBEDDING_MODEL = "text-embedding-3-small";
const OUT_PATH = join(process.cwd(), "data", "knowledge.json");

interface PortfolioSnapshot {
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    features: string[];
    githubUrl?: string;
    liveUrl?: string;
  }>;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    period: string;
    location?: string;
    achievements: string[];
  }>;
  site: {
    name: string;
    url: string;
    socialLinks: Array<{ id: string; name: string; url: string }>;
  };
}

function chunkProject(p: PortfolioSnapshot["projects"][number]): KnowledgeChunk {
  const parts: string[] = [`# Project: ${p.title}`, "", p.description, ""];
  if (p.technologies.length) parts.push(`Technologies: ${p.technologies.join(", ")}`, "");
  if (p.features.length) {
    parts.push("Key features:");
    for (const f of p.features) parts.push(`- ${f}`);
    parts.push("");
  }
  if (p.githubUrl) parts.push(`GitHub: ${p.githubUrl}`);
  if (p.liveUrl) parts.push(`Live demo: ${p.liveUrl}`);
  return {
    id: `project:${p.id}`,
    title: p.title,
    text: parts.join("\n"),
    embedding: [],
    kind: "project",
  };
}

function chunkExperience(e: PortfolioSnapshot["experience"][number]): KnowledgeChunk {
  const parts: string[] = [
    `# Experience: ${e.title} @ ${e.company}`,
    `Period: ${e.period}`,
  ];
  if (e.location) parts.push(`Location: ${e.location}`);
  parts.push("", "Achievements:");
  for (const a of e.achievements) parts.push(`- ${a}`);
  return {
    id: `experience:${e.id}`,
    title: `${e.title} @ ${e.company}`,
    text: parts.join("\n"),
    embedding: [],
    kind: "experience",
  };
}

function chunkSite(site: PortfolioSnapshot["site"]): KnowledgeChunk {
  const socials = site.socialLinks.map((s) => `${s.name}: ${s.url}`).join("\n");
  return {
    id: "site:contact",
    title: "Contact / social",
    text: `# Contact and social links\n\nSite: ${site.name} (${site.url})\n\n${socials}`,
    embedding: [],
    kind: "site",
  };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is required to build the RAG index. Set it in the build environment.",
    );
  }

  console.log(`[rag-build] fetching portfolio snapshot from ${PORTFOLIO_JSON_URL}`);
  const res = await fetch(PORTFOLIO_JSON_URL);
  if (!res.ok) {
    throw new Error(
      `Portfolio snapshot fetch failed: ${res.status} ${res.statusText}. URL: ${PORTFOLIO_JSON_URL}`,
    );
  }
  const snap = (await res.json()) as PortfolioSnapshot;

  const chunks: KnowledgeChunk[] = [
    chunkSite(snap.site),
    ...snap.projects.map(chunkProject),
    ...snap.experience.map(chunkExperience),
  ];
  console.log(
    `[rag-build] chunked ${snap.projects.length} projects + ${snap.experience.length} experience entries + 1 site = ${chunks.length} chunks`,
  );

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embeddingRes = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: chunks.map((c) => c.text),
  });
  for (let i = 0; i < chunks.length; i++) {
    chunks[i].embedding = embeddingRes.data[i].embedding;
  }
  console.log(
    `[rag-build] embedded ${chunks.length} chunks with ${EMBEDDING_MODEL} (${embeddingRes.usage.total_tokens} tokens, $${((embeddingRes.usage.total_tokens / 1_000_000) * 0.02).toFixed(5)})`,
  );

  const index: KnowledgeIndex = {
    generatedAt: new Date().toISOString(),
    sourceUrl: PORTFOLIO_JSON_URL,
    embeddingModel: EMBEDDING_MODEL,
    chunks,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`[rag-build] wrote ${OUT_PATH}`);
}

main().catch((e) => {
  console.error("[rag-build] FAILED:", e);
  process.exit(1);
});
