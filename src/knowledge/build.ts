/**
 * Build-time RAG indexer.
 *
 * Sources projects + experiences, chunks them, embeds each chunk with
 * text-embedding-3-small, and writes the resulting KnowledgeIndex to
 * data/knowledge.json.
 *
 * Two supported sources — the build picks based on env:
 *
 *   1. Beacon (private profile DB) — when BEACON_API_URL + BEACON_JWT are set.
 *      Fetches /api/profile/projects + /api/profile/experiences. Includes ALL
 *      profile entries — even ones not shown on the public portfolio site.
 *      Used by beacon-mcp's refresh_chatbot_rag tool.
 *
 *   2. Portfolio JSON snapshot — the fallback. Fetches PORTFOLIO_JSON_URL
 *      (defaults to https://danhle.net/data/portfolio.json). Only includes
 *      projects visible on the site. Used by local `npm run build:knowledge`
 *      when no Beacon creds are configured.
 *
 * Beacon is the preferred source when available — it lets the operator add a
 * project to Beacon without touching the portfolio site and still have the
 * chatbot know about it.
 *
 * Run:
 *   OPENAI_API_KEY=... npm run build:knowledge                     # portfolio.json
 *   BEACON_API_URL=... BEACON_JWT=... OPENAI_API_KEY=... npm run build:knowledge   # Beacon
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import OpenAI from "openai";
import { traced } from "../integrations/langfuse.js";
import type { KnowledgeChunk, KnowledgeIndex } from "./types.js";

const PORTFOLIO_JSON_URL =
  process.env.PORTFOLIO_JSON_URL || "https://danhle.net/data/portfolio.json";
const EMBEDDING_MODEL = "text-embedding-3-small";
const OUT_PATH = join(process.cwd(), "data", "knowledge.json");

// Normalized shape the chunkers consume. Both Beacon and portfolio.json get
// funneled into this before chunking.
interface NormalizedProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  features: string[];
  githubUrl?: string;
  liveUrl?: string;
}
interface NormalizedExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  location?: string;
  achievements: string[];
}
interface NormalizedSite {
  name: string;
  url: string;
  socialLinks: Array<{ id: string; name: string; url: string }>;
}
interface NormalizedSnapshot {
  projects: NormalizedProject[];
  experience: NormalizedExperience[];
  site: NormalizedSite;
  sourceLabel: string;
}

const FALLBACK_SITE: NormalizedSite = {
  name: "Danh Le - Full Stack Developer",
  url: "https://danhle.net",
  socialLinks: [
    { id: "linkedin", name: "LinkedIn", url: "https://www.linkedin.com/in/dtle82" },
    { id: "github", name: "GitHub", url: "https://www.github.com/odanree" },
    { id: "email", name: "Email", url: "mailto:danhle@danhle.net" },
  ],
};

async function fetchFromPortfolioJson(url: string): Promise<NormalizedSnapshot> {
  console.log(`[rag-build] source: portfolio JSON snapshot (${url})`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Portfolio snapshot fetch failed: ${res.status} ${res.statusText}`);
  }
  const snap = (await res.json()) as {
    projects: NormalizedProject[];
    experience: NormalizedExperience[];
    site?: NormalizedSite;
  };
  return {
    projects: snap.projects,
    experience: snap.experience,
    site: snap.site ?? FALLBACK_SITE,
    sourceLabel: url,
  };
}

async function fetchFromBeacon(apiUrl: string, jwt: string): Promise<NormalizedSnapshot> {
  console.log(`[rag-build] source: Beacon (${apiUrl})`);
  const headers = { Authorization: `Bearer ${jwt}` };

  const [projectsRes, experiencesRes] = await Promise.all([
    fetch(`${apiUrl}/api/profile/projects`, { headers }),
    fetch(`${apiUrl}/api/profile/experiences`, { headers }),
  ]);
  if (!projectsRes.ok) {
    throw new Error(
      `Beacon /api/profile/projects fetch failed: ${projectsRes.status} ${projectsRes.statusText}` +
        (projectsRes.status === 401 ? " (JWT expired — refresh BEACON_JWT)" : ""),
    );
  }
  if (!experiencesRes.ok) {
    throw new Error(
      `Beacon /api/profile/experiences fetch failed: ${experiencesRes.status} ${experiencesRes.statusText}`,
    );
  }

  const beaconProjects = (await projectsRes.json()) as Array<{
    id: string;
    name: string;
    url?: string;
    tech_stack?: string[];
    description?: string;
    outcome?: string;
    start_date?: string;
    end_date?: string;
  }>;
  const beaconExperiences = (await experiencesRes.json()) as Array<{
    id: string;
    company: string;
    title: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    location?: string;
    description?: string;
    tech_stack?: string[];
    impact_metrics?: string;
  }>;

  const projects: NormalizedProject[] = beaconProjects.map((p) => {
    // Beacon uses `description` as prose + `outcome` for the results paragraph.
    // Fold outcome into the description text and treat any bulleted lines in
    // description as features so the chunker's "Key features" block still fires.
    const combined = [p.description, p.outcome].filter(Boolean).join("\n\n");
    const bulletLines = combined
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- ") || l.startsWith("• "));
    const features = bulletLines.map((l) => l.replace(/^[-•]\s+/, ""));
    return {
      id: p.id,
      title: p.name,
      description: combined,
      technologies: p.tech_stack ?? [],
      features,
      githubUrl: p.url,
      liveUrl: undefined,
    };
  });

  const experience: NormalizedExperience[] = beaconExperiences.map((e) => {
    // description is prose; split into bulleted achievements if we can, else
    // fall back to a single-line paragraph so the chunker still has something.
    const rawLines = (e.description ?? "").split("\n").map((l) => l.trim());
    const bullets = rawLines
      .filter((l) => l.startsWith("- ") || l.startsWith("• "))
      .map((l) => l.replace(/^[-•]\s+/, ""));
    const achievements = bullets.length > 0 ? bullets : [e.description ?? ""].filter(Boolean);
    const period = [e.start_date, e.is_current ? "Present" : e.end_date]
      .filter(Boolean)
      .join(" – ");
    return {
      id: e.id,
      title: e.title,
      company: e.company,
      period,
      location: e.location,
      achievements,
    };
  });

  return {
    projects,
    experience,
    site: FALLBACK_SITE,
    sourceLabel: `beacon:${apiUrl}`,
  };
}

function chunkProject(p: NormalizedProject): KnowledgeChunk {
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

function chunkExperience(e: NormalizedExperience): KnowledgeChunk {
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

function chunkSite(site: NormalizedSite): KnowledgeChunk {
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

  const snap =
    process.env.BEACON_API_URL && process.env.BEACON_JWT
      ? await fetchFromBeacon(process.env.BEACON_API_URL, process.env.BEACON_JWT)
      : await fetchFromPortfolioJson(PORTFOLIO_JSON_URL);

  const chunks: KnowledgeChunk[] = [
    chunkSite(snap.site),
    ...snap.projects.map(chunkProject),
    ...snap.experience.map(chunkExperience),
  ];
  console.log(
    `[rag-build] chunked ${snap.projects.length} projects + ${snap.experience.length} experience entries + 1 site = ${chunks.length} chunks`,
  );

  const openai = traced(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), {
    generationName: 'rag.build.embed',
    metadata: { chunkCount: chunks.length, model: EMBEDDING_MODEL },
  });
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
    sourceUrl: snap.sourceLabel,
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
