# ADR 002 — Beacon as an alternative RAG source

**Status:** Accepted, 2026-07-03.

**Decision:** `src/knowledge/build.ts` now accepts two sources for its
knowledge corpus, picked at runtime based on env:

1. **Beacon** — when `BEACON_API_URL` and `BEACON_JWT` are set. Fetches
   `/api/profile/projects` and `/api/profile/experiences` directly.
   Includes ALL profile entries, even ones not shown on the public
   portfolio site. This is the source used by
   `beacon-mcp`'s `beacon_refresh_chatbot_rag` tool.

2. **Portfolio JSON snapshot** — the default fallback. Fetches
   `PORTFOLIO_JSON_URL` (defaults to `https://danhle.net/data/portfolio.json`,
   see portfolio ADR 002). Only includes visible-on-site projects.

Beacon is the preferred source when creds are available.

## Why add a second source

ADR 001 grounded the RAG on the public portfolio.json snapshot. That
works when everything the chatbot should know about is also visible on
danhle.net — which was true when we built it (13 projects both places).

Real-world drift: the operator wants to add projects to Beacon (the
canonical career-profile store) without necessarily promoting them to
the public site. Examples: work-in-progress projects that aren't ready
for public display, experiments, projects tailored for a specific job
application but not for general audiences. These should still be in the
chatbot's knowledge base — a recruiter chatting with the bot should get
grounded answers about them.

With portfolio.json as the only source, the operator has to either add
the project to the visible site (leaking it publicly) or accept that
the chatbot doesn't know about it.

## Why not deprecate portfolio.json entirely

Two reasons to keep it as a fallback:

- **The public snapshot is auth-free.** Anyone (including CI systems,
  future consumers, or the operator's own laptop before the Beacon JWT
  is set) can build a working index without needing credentials. Useful
  as a default.
- **It documents the shape.** The `PortfolioSnapshot` schema at
  `danhle.net/data/portfolio.json` is a stable public contract; the
  Beacon API is a private one that can change. Keeping the fallback
  means the ADR-002 change doesn't couple the chatbot to Beacon's
  internal API shape.

## Normalization layer

Beacon and portfolio.json return different field shapes (Beacon has
`name` + `outcome`, portfolio has `title` + `features` array). A
`NormalizedSnapshot` shape sits between the fetcher and the chunker;
both fetchers map into it. If the shapes diverge further, only the
fetcher-side mappers need updating — the chunkers and everything
downstream stay stable.

## What to watch for

- **JWT staleness.** `BEACON_JWT` expires. When the refresh tool
  reports `HTTP 401 (JWT expired — refresh BEACON_JWT)`, the operator
  updates `beacon-mcp/.env` and re-runs. Same failure mode as the rest
  of the Beacon MCP surface — no new operational surprise.
- **Chunk count grows.** Portfolio has 13 projects, Beacon has 30. The
  index went from 20 chunks (~900 KB) to 37 chunks (~1.7 MB in the
  committed JSON). Still well within Vercel deploy limits and
  in-memory cosine-similarity search remains sub-millisecond. Reassess
  when Beacon crosses ~150 projects.
- **Divergence between chatbot and site.** With Beacon as source, the
  chatbot will discuss projects not visible on danhle.net. That is by
  design, but the honesty contract (from ADR 001) still requires the
  bot to answer using only retrieved context — it should never invent
  content. The system prompt already handles this.
