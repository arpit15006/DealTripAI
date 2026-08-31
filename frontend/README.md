# DealTrip — application

The Next.js application. **See the [project README](../README.md)** for what DealTrip is,
the architecture, and how it meets the Buildathon brief.

```bash
pnpm install
cp .env.example .env.local
pnpm dev     # http://localhost:3000
pnpm test    # 33 tests
```

## Layout

```
src/lib/dealtrip/     the engine — pricing, guard, agents, orchestrator, scoring
  pricing.ts          the only module that produces a rupee figure
  commerce-guard.ts   13 deterministic checks; recomputes every price
  merchant-agent.ts   merchant-side agent (model, with a planner fallback)
  merchant-planner.ts exhaustive legal-package search — the fallback, and the floor
  orchestrator.ts     buyer-side desk: discovery, counters, ranking
  scoring.ts          deterministic deal scoring
  __tests__/          33 tests over pricing, the guard and scoring

src/app/api/          REST + SSE, including the public agent endpoints
src/views/dealtrip/   the screens
src/components/ui/    shadcn/ui + Base UI primitives (from the Tourix template)
```

UI built on [shadcn/studio](https://shadcnstudio.com)'s Tourix template (licensed).
