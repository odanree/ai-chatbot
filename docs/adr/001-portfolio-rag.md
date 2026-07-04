# ADR 001 — Portfolio Strategy uses RAG grounded on the public portfolio JSON snapshot

**Status:** Accepted, 2026-07-03.

**Decision:** The `PortfolioStrategy` no longer relies on the hardcoded
`knowledgeBase` that used to live inside the class. Instead, an RAG index is
built at deploy time from [`https://danhle.net/data/portfolio.json`](https://danhle.net/data/portfolio.json)
(see portfolio's [ADR 002](https://github.com/odanree/portfolio/blob/main/docs/adr/002-public-portfolio-json-snapshot.md)),
each project + experience is embedded with `text-embedding-3-small`, and the
top-k cosine-similar chunks are injected into the system prompt on every user
message. The system prompt now instructs the model to answer only from the
RETRIEVED CONTEXT block and to refuse to invent projects, features, or
metrics not covered.

## Why

An audit surfaced that the Portfolio chatbot was inventing capabilities that
did not exist. When a user asked "does this chatbot track popular queries?",
the model happily claimed a full analytics dashboard, engagement scoring, and
performance-optimization loops — none of which the code actually does. Root
cause: the strategy's hardcoded `knowledgeBase` listed 4 stale projects
(portfolio grew to 30+ in the last year) and made no factual assertion
about the chatbot's own instrumentation, so the model filled the vacuum with
plausible-sounding fabrications.

Retrieval-first fixes the class of bug:

- The knowledge changes with the site. Adding a project to
  `portfolio/lib/constants.ts` and redeploying the portfolio automatically
  updates the JSON snapshot; the chatbot picks it up on the next
  `build:knowledge` run.
- The system prompt now has an explicit "answer only from retrieved context"
  instruction and a capabilities guardrail. Together these push the model
  toward "I don't have that information" instead of confabulation when the
  retrieved context is empty or unrelated.

## Why not runtime beacon-mcp

Alternative considered: the chatbot runs an MCP client and calls `beacon-mcp`
tools on every user message to fetch fresh profile data. Rejected because:

- The Beacon JWT rotates on the operator's schedule; putting a rotating secret
  in a public unauthenticated chatbot's runtime env is a security smell.
- Beacon's DB has private data (job applications, private notes) that a public
  chatbot MUST NOT expose. Separating public JSON snapshot from private DB is
  structurally safer than trusting policy checks.
- MCP stdio transport doesn't fit Vercel serverless (assumes long-lived
  process).
- Portfolio content changes maybe once a week — freshness argument is weak.

The `beacon-mcp` server still exists and is exposed for Claude Desktop / Code
consumption — it's just not what the public chatbot calls.

## Build wiring

`src/knowledge/build.ts` fetches the snapshot, chunks each project /
experience / site entry, calls `openai.embeddings.create` in one batch, and
writes `data/knowledge.json` (see the file for the full pipeline).
`src/knowledge/retrieve.ts` loads the JSON once at cold-start and does an
in-memory cosine-similarity top-k with a minimum similarity floor of 0.2
(below that, chunks are dropped even if they're in the top-k — prevents
unrelated content from leaking in on off-topic questions).

**The index (`data/knowledge.json`) is committed to git.** Vercel's legacy
`builds` config in `vercel.json` doesn't reliably invoke a `vercel-build`
script per-function, so relying on Vercel to regenerate the index at deploy
time would fail closed (retrieval disabled) when the build step doesn't run.
Committing the index makes deploys deterministic — what you push is what
runs. Trade-off: manual `npm run build:knowledge && git commit` is required
after the portfolio snapshot changes. Weekly cadence at most, and the smoke
script in `src/knowledge/smoke.ts` verifies retrieval quality before commit.

## What to watch for

- **The retrieval failure mode is silent.** If `data/knowledge.json` is
  missing, malformed, or the OpenAI embedding call fails at query time,
  retrieval returns `[]` and the chat continues on the strategy's static
  system prompt. Watch for `[rag-retrieve] no index at ...` and
  `[rag-retrieve] query embedding failed` in production logs — those are
  the signals that retrieval is inert.
- **The similarity floor (`MIN_SIMILARITY = 0.2`) is calibrated for the
  current corpus of 20 chunks.** If the corpus grows past ~100, the floor
  may need re-tuning — currently a completely off-topic query still gets
  chunks scoring 0.2–0.3, which is fine because the system prompt handles
  the "context doesn't cover the question" branch. If the model starts
  citing unrelated projects, tighten the floor.
- **`text-embedding-3-small` is 1536-dim, ~48 KB per vector, ~900 KB total
  for the current 20-chunk index.** If chunk count grows past ~500, consider
  moving to `text-embedding-3-small` at reduced dimensions (256 dims still
  performs well) or Base64-encoded Float32 storage to keep the git blob
  reasonable.
- **`build:knowledge` costs ~$0.0001 per rebuild.** Effectively free. No
  budget guard needed.
- **When updating `PortfolioStrategy.getKnowledgeBase()`**, remember it is
  now the minimal "always-in-prompt" data (name, contact, links) — anything
  project- or experience-related must go through the RAG index, not the
  strategy's hardcoded fields.
