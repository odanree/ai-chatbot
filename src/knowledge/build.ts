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
 *      Used by beacon-mcp's refresh_chatbot_rag tool and by the Vercel build.
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
 * ## Vercel build integration (ADR-021, phase 1)
 *
 * `vercel-build` runs this before `tsc` so the deployed knowledge index is
 * always fresh from Beacon. To keep code-only deploys from failing when
 * BEACON_JWT expires, the Vercel build sets `KNOWLEDGE_BUILD_STRICT=false`,
 * which converts a failed rebuild into a warning-plus-exit-0 and preserves
 * the committed data/knowledge.json.
 *
 * The strict/lenient toggle:
 *
 *   KNOWLEDGE_BUILD_STRICT=true   (default, and what local/manual runs use)
 *     Any error (Beacon fetch failure, missing env var, embedding API 5xx)
 *     is fatal — exit 1. Use this locally so you notice broken creds fast.
 *
 *   KNOWLEDGE_BUILD_STRICT=false  (Vercel build sets this)
 *     On failure, log the error and exit 0 with a fallback notice. The
 *     committed data/knowledge.json is preserved unchanged. Use this on
 *     Vercel so a code-only deploy never breaks when BEACON_JWT is stale.
 *
 * Run:
 *   OPENAI_API_KEY=... bun run build:knowledge                     # portfolio.json, strict
 *   BEACON_API_URL=... BEACON_JWT=... OPENAI_API_KEY=... bun run build:knowledge   # Beacon, strict
 *   KNOWLEDGE_BUILD_STRICT=false bun run build:knowledge            # lenient — Vercel pattern
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
	startDate?: string;
	endDate?: string;
	location?: string;
	achievements: string[];
	technologies: string[];
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
		{
			id: "linkedin",
			name: "LinkedIn",
			url: "https://www.linkedin.com/in/dtle82",
		},
		{ id: "github", name: "GitHub", url: "https://www.github.com/odanree" },
		{ id: "email", name: "Email", url: "mailto:danhle@danhle.net" },
	],
};

// Parse portfolio.json's free-form period ("May 2022 - 2026", "Jan 2020 - May 2022")
// into ISO-ish start/end dates good enough for month-delta math. Returns
// { start: undefined, end: undefined } if we can't confidently parse.
const MONTHS: Record<string, number> = {
	jan: 0,
	feb: 1,
	mar: 2,
	apr: 3,
	may: 4,
	jun: 5,
	jul: 6,
	aug: 7,
	sep: 8,
	oct: 9,
	nov: 10,
	dec: 11,
};
function parsePeriod(period: string): { start?: string; end?: string } {
	const norm = period.replace(/–/g, "-");
	const [rawStart, rawEnd] = norm.split(/\s*-\s*/).map((s) => s.trim());
	const toISO = (s?: string): string | undefined => {
		if (!s) return undefined;
		if (/^present$/i.test(s)) return new Date().toISOString().slice(0, 10);
		const m = s.match(/^(?:(\w+)\s+)?(\d{4})$/);
		if (!m) return undefined;
		const mo = m[1] ? MONTHS[m[1].slice(0, 3).toLowerCase()] : 0;
		if (m[1] && mo === undefined) return undefined;
		return `${m[2]}-${String((mo ?? 0) + 1).padStart(2, "0")}-01`;
	};
	return { start: toISO(rawStart), end: toISO(rawEnd) };
}

interface PortfolioExperienceRaw {
	id: string;
	title: string;
	company: string;
	period: string;
	location?: string;
	achievements: string[];
	current?: boolean;
	technologies?: string[];
}

async function fetchFromPortfolioJson(
	url: string,
): Promise<NormalizedSnapshot> {
	console.log(`[rag-build] source: portfolio JSON snapshot (${url})`);
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(
			`Portfolio snapshot fetch failed: ${res.status} ${res.statusText}`,
		);
	}
	const snap = (await res.json()) as {
		projects: NormalizedProject[];
		experience: PortfolioExperienceRaw[];
		site?: NormalizedSite;
	};
	const experience: NormalizedExperience[] = snap.experience.map((e) => {
		const { start, end } = parsePeriod(e.period);
		return {
			id: e.id,
			title: e.title,
			company: e.company,
			period: e.period,
			startDate: start,
			endDate: e.current ? undefined : end,
			location: e.location,
			achievements: e.achievements,
			technologies: e.technologies ?? [],
		};
	});
	return {
		projects: snap.projects,
		experience,
		site: snap.site ?? FALLBACK_SITE,
		sourceLabel: url,
	};
}

async function fetchFromBeacon(
	apiUrl: string,
	jwt: string,
): Promise<NormalizedSnapshot> {
	console.log(`[rag-build] source: Beacon (${apiUrl})`);
	const headers = { Authorization: `Bearer ${jwt}` };

	const [projectsRes, experiencesRes] = await Promise.all([
		fetch(`${apiUrl}/api/profile/projects`, { headers }),
		fetch(`${apiUrl}/api/profile/experiences`, { headers }),
	]);
	if (!projectsRes.ok) {
		throw new Error(
			`Beacon /api/profile/projects fetch failed: ${projectsRes.status} ${projectsRes.statusText}` +
				(projectsRes.status === 401
					? " (JWT expired — refresh BEACON_JWT)"
					: ""),
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
		const achievements =
			bullets.length > 0 ? bullets : [e.description ?? ""].filter(Boolean);
		const period = [e.start_date, e.is_current ? "Present" : e.end_date]
			.filter(Boolean)
			.join(" – ");
		return {
			id: e.id,
			title: e.title,
			company: e.company,
			period,
			startDate: e.start_date,
			endDate: e.is_current ? undefined : e.end_date,
			location: e.location,
			achievements,
			technologies: e.tech_stack ?? [],
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
	if (p.technologies.length)
		parts.push(`Technologies: ${p.technologies.join(", ")}`, "");
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
	if (e.technologies.length)
		parts.push(`Technologies: ${e.technologies.join(", ")}`);
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

// Text patterns → canonical skill name. Lets us count PHP time spent on
// WordPress/WooCommerce/CakePHP/YII2 roles even when tech_stack tags are missing
// or use framework names instead of the base language. Case-insensitive, matched
// as whole-word substrings of the technology token and achievement text.
const SKILL_ALIASES: Record<string, string[]> = {
	PHP: [
		"php",
		"wordpress",
		"woocommerce",
		"cakephp",
		"yii2",
		"acf",
		"psr-4",
		"phpunit",
		"phpstan",
	],
	TypeScript: ["typescript", "next.js", "nextjs"],
	Python: [
		"python",
		"fastapi",
		"pydantic",
		"sqlalchemy",
		"pytest",
		"django",
		"celery",
	],
	React: ["react", "react.js", "react 18", "react 19", "next.js", "expo"],
	Node: ["node.js", "node ", "express", "vitest", "jest"],
	Docker: ["docker", "docker compose", "kubernetes"],
	AWS: ["aws", "lambda", "ec2", "s3", "iam", "eventbridge"],
	Shopify: ["shopify", "liquid", "storefront api", "admin api"],
	PostgreSQL: ["postgresql", "postgres"],
	Redis: ["redis"],
};

function detectSkills(...texts: string[]): Set<string> {
	const haystack = texts.join(" ").toLowerCase();
	const hit = new Set<string>();
	for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
		if (aliases.some((a) => haystack.includes(a))) hit.add(canonical);
	}
	return hit;
}

function monthsBetween(startISO: string, endISO: string): number {
	const s = new Date(startISO);
	const e = new Date(endISO);
	return Math.max(
		0,
		(e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()),
	);
}

// Aggregate skill mentions across all experience + projects into a single
// chunk. Callers asking summation questions ("how many years of X",
// "what's your Python experience") match this at the top and get a
// per-skill total + source-of-truth list to justify the number.
function chunkSkillsSummary(
	experience: NormalizedExperience[],
	projects: NormalizedProject[],
): KnowledgeChunk {
	interface Row {
		months: number;
		roles: string[];
		projects: string[];
	}
	const bySkill = new Map<string, Row>();
	const row = (s: string): Row => {
		let r = bySkill.get(s);
		if (!r) {
			r = { months: 0, roles: [], projects: [] };
			bySkill.set(s, r);
		}
		return r;
	};
	const today = new Date().toISOString().slice(0, 10);

	for (const e of experience) {
		const skills = detectSkills(...e.technologies, ...e.achievements, e.title);
		const start = e.startDate;
		const end = e.endDate ?? today;
		const months = start ? monthsBetween(start, end) : 0;
		const roleLabel = `${e.title} @ ${e.company} (${e.period})`;
		for (const s of skills) {
			const r = row(s);
			r.months += months;
			r.roles.push(roleLabel);
		}
	}
	for (const p of projects) {
		const skills = detectSkills(
			...p.technologies,
			p.description,
			...p.features,
			p.title,
		);
		for (const s of skills) row(s).projects.push(p.title);
	}

	const sorted = [...bySkill.entries()].sort(
		(a, b) => b[1].months - a[1].months,
	);
	// Intro deliberately front-loads the phrases visitors ask with — "how
	// many years of X", "how much experience with X", "which technologies"
	// — so the chunk embeds close to aggregate-skill queries. (This chunk
	// is also pinned in retrieve.ts as a belt-and-suspenders; the intro
	// helps if someone changes the pinning logic later.)
	const lines: string[] = [
		"# Skills summary — how many years of experience with each technology",
		"",
		"Authoritative per-technology totals. When asked 'how many years of X',",
		"'how much experience with X', or 'which technologies has Danh used',",
		"quote the numbers below verbatim rather than re-estimating from",
		"individual roles. Overlapping/concurrent role time is summed.",
		"",
	];
	for (const [skill, r] of sorted) {
		const years = (r.months / 12).toFixed(1);
		lines.push(`## ${skill}: ~${years} years`);
		if (r.roles.length) {
			lines.push("Used in roles:");
			for (const role of r.roles) lines.push(`- ${role}`);
		}
		if (r.projects.length) {
			lines.push("Also used in projects:");
			for (const proj of r.projects) lines.push(`- ${proj}`);
		}
		lines.push("");
	}
	return {
		id: "skills:summary",
		title: "Skills summary",
		text: lines.join("\n"),
		embedding: [],
		kind: "skills",
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
			? await fetchFromBeacon(
					process.env.BEACON_API_URL,
					process.env.BEACON_JWT,
				)
			: await fetchFromPortfolioJson(PORTFOLIO_JSON_URL);

	const chunks: KnowledgeChunk[] = [
		chunkSite(snap.site),
		chunkSkillsSummary(snap.experience, snap.projects),
		...snap.projects.map(chunkProject),
		...snap.experience.map(chunkExperience),
	];
	console.log(
		`[rag-build] chunked ${snap.projects.length} projects + ${snap.experience.length} experience entries + 1 site + 1 skills summary = ${chunks.length} chunks`,
	);

	const openai = traced(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), {
		generationName: "rag.build.embed",
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

// Strict mode is the default. Vercel's `vercel-build` explicitly overrides
// to `false` so a stale BEACON_JWT never breaks an otherwise-clean deploy.
const STRICT = process.env.KNOWLEDGE_BUILD_STRICT !== "false";

main().catch((e) => {
	console.error("[rag-build] FAILED:", e);
	if (STRICT) {
		process.exit(1);
	}
	console.error(
		"[rag-build] KNOWLEDGE_BUILD_STRICT=false — preserving committed data/knowledge.json and continuing",
	);
	process.exit(0);
});
