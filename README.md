# DealTrip

**The agentic deal desk for travel.** Don't search for a trip. Let your AI make the deal.

Built for the **Razorpay AI Buildathon**, Track 01 - *AI Growth & Agentic Commerce*.

**Live: [dealtripai.vercel.app](https://dealtripai.vercel.app)** - a negotiation takes about a
minute; five merchant agents are working while the desk streams.

A traveller says what they want. DealTrip turns it into hard constraints, negotiates with
merchant agents that each defend their own margin, blocks anything outside policy, and
settles through Razorpay, with every money decision explainable, bounded, gated and
recorded.

---

## The idea in one paragraph

Travel commerce is built for browsing. The buyer knows their constraints; the merchant
knows its flexibility; neither has a way to exchange them. DealTrip is that exchange. A
buyer-side **Deal Orchestrator** represents the traveller's constraints. **Merchant agents**
compose and revise packages while defending their own revenue. A deterministic **Commerce
Guard** authorises (or refuses) every offer before it can be seen, ranked or paid for.

## The one design decision everything rests on

> **Agents choose packages. Code computes money.**

A merchant agent picks a room, a set of add-ons, a check-in date and a discount percentage.
It never emits a rupee figure - [`pricing.ts`](src/lib/dealtrip/pricing.ts) is the
only module that produces one. The **Commerce Guard** then re-derives the entire quote from
the catalog and compares it line by line.

So *"the AI cannot invent a price"* is not a claim in a pitch deck. It is a checked property,
and there is [a test for it](src/lib/dealtrip/__tests__/commerce-guard.test.ts):
hand the guard a tampered quote and it refuses.

---

## Meeting Track 01's bar

> *Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully.*

| The bar | How |
|---|---|
| **Explainable** | Every ranked deal shows its score term by term, each with the sentence that justifies it. Every offer carries the guard's 13 named checks. |
| **Bounded** | Two independent floors per merchant (a discount ceiling *and* a margin floor) plus round limits, locked inclusions and a date window. The higher floor binds. |
| **Gated** | Nothing is charged until the traveller approves one specific offer. The guard then re-runs **from scratch** before an order exists, and the amount sent to Razorpay is recomputed server-side. |
| **Audit trail** | Append-only. ~26 events for a typical run, every row expandable to its raw payload, plus a step-through replay. |
| **A failure, handled** | Several. See below. |

### Failures the system handles, live

1. **A merchant tries to breach its own policy.** PalmStay's only beachfront villa cannot
   legally reach a ₹60,000 budget, its 26% margin floor binds at ₹63,582. The guard blocks
   the offer, the desk sends a counter-request, and the agent restructures. *This is
   arithmetic, not a staged outcome. There's a test asserting the floor.*
2. **A merchant declines honestly.** Kokum Cliffs is cliff-top, not beachfront. It withdraws
   rather than proposing something that would be refused.
3. **A forged payment signature.** Verified server-side against the key secret; nothing is
   marked booked.
4. **A payment that doesn't complete.** Nothing is charged, nothing is booked, and the
   negotiated price is *held*, the traveller retries without negotiating again.
   Verified in a real browser against a real gateway rejection, not just in tests.
5. **Two travellers want the last room.** Approving takes an atomic hold, so the
   capacity check and the write happen together. The second approval is refused
   rather than overselling; a failed payment returns the unit.
6. **The traveller closes the tab after paying.** A signed Razorpay webhook confirms
   the booking independently of the browser, so money moving and nothing being
   booked is not a reachable state.

---

## Architecture

```
Traveller
   │  natural language
   ▼
Intent extraction ─────► confirmed by the traveller before anything negotiates
   │  TravelIntent (closed attribute vocabulary)
   ▼
Deal Orchestrator ◄────────────────► Merchant Agents  (one per merchant, own objectives)
   │  structured COUNTER_REQUESTs         │  choose room + add-ons + dates + discount
   ▼                                       ▼
Commerce Guard  ◄── 14 deterministic checks, recomputes every price from the catalog
                    (15 at payment: the offer must also be the one approved)
   │  authorised offers only
   ▼
Deal scoring ──► ranked shortlist, hard constraints as a gate
   │
   ▼
Traveller approves ──► guard re-runs ──► Razorpay order ──► signature verified ──► booked
                                                                  │
                                                      append-only audit trail
```

Single Next.js app. API routes, SSE for live negotiation, Neon Postgres with an in-memory
fallback, Groq for the agents with a deterministic planner behind every model call.

### Where AI is used, and where it deliberately isn't

| Decision | Made by | Why |
|---|---|---|
| Reading a traveller's request | **Model** | Natural language is what models are for. Bound to a closed vocabulary and confirmed by the user. |
| Which room, add-ons and dates make a package | **Model** | A combinatorial choice over semantically-labelled options. It read *"anniversary trip"* and kept the couples spa, the planner has no way to know that; "anniversary" isn't in the attribute vocabulary. |

Both are recorded on every merchant turn, and the UI shows them side by side -
what the deterministic planner *would* have chosen against what the agent actually
proposed. It says "the agent and the planner agreed" when they did; a comparison
that only appeared when it flattered the model would not be evidence of anything.

| Every rupee | **Code** | Arithmetic. A model has no business here. |
| Whether an offer is permissible | **Code** | Determinism is the entire point of a guard. |
| Ranking the shortlist | **Code** | Same shortlist, same ranking, every time. |
| Retrieval over merchant catalogs | **Neither** | A merchant's whole catalog is ~40 lines of JSON and goes into the prompt in full. RAG would add a recall failure mode and buy nothing. |

Every model call is schema-bound and has a **deterministic fallback**: if the key is missing,
the API is down, or two attempts fail validation, the planner produces the answer instead.
The revenue simulator runs entirely on that path. Thousands of negotiations, zero tokens.

---

## Be the buyer yourself

A marketplace where only its author's agent can transact proves nothing about
agent-to-agent commerce. So DealTrip ships an **MCP server**: point any MCP client
at it and negotiate against these merchants with an agent nobody here wrote.

```jsonc
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "dealtrip": {
      "command": "npx",
      "args": ["tsx", "<repo>/src/mcp/server.ts"],
      "env": { "DEALTRIP_BASE_URL": "http://localhost:3000" }
    }
  }
}
```

Five tools - `discover_merchants`, `get_vocabulary`, `get_merchant_profile`,
`request_quote`, `negotiate`. Over the same public endpoints DealTrip's own Deal
Orchestrator calls. The server holds no credentials and has no privileged access.
Ask it for a trip, or ask it for a 40% discount and watch the Commerce Guard refuse
*your* agent exactly as it refuses ours.

A scripted run of the same thing, no client needed:

```bash
pnpm dev              # terminal 1
pnpm mcp:example      # terminal 2
```

```
1. quote      HTTP 409  ₹62,392   ✗ exceeds the traveller's hard limit by ₹2,392
2. negotiate  HTTP 200  ₹62,392 → ₹57,999  (saved ₹4,393)
              · room changed from ov-premium-beach to ov-garden
              · discount reduced from 5% to 1.08%
              guard 13/13 passed · rounds left 1
```

## Agent-readable, and you can check

Underneath MCP it is plain HTTP, so `curl` works too:

```bash
# Discover the marketplace
curl -s localhost:3000/.well-known/agent-commerce.json | jq

# Read a merchant's machine-readable storefront
curl -s localhost:3000/api/agent/oceanvista/profile | jq
```

Then **try to break it**. Demand a 40% discount against a 5% ceiling:

```bash
curl -sX POST localhost:3000/api/agent/oceanvista/quote \
  -H 'content-type: application/json' \
  -d '{"intent":{"destination":"Goa","travelers":4,"rooms":2,"duration_nights":3,
       "budget":{"max":60000,"currency":"INR","type":"hard_constraint"},
       "requirements":{"beachfront":"required"},"date_flexibility_days":2,
       "check_in":null,"priority":"best_value","notes":""},
       "bundle":{"room_id":"ov-premium-beach","addon_ids":[],"discount_pct":40}}' | jq '.guard'
```

It returns **409** with both violations and the lowest legal price. These are the same
endpoints DealTrip's own orchestrator uses. There is no private side channel.

Discount ceilings and margin floors are deliberately **not** published. A profile says a
merchant negotiates and over what; how far it will go stays behind the guard, because
publishing it just means every buyer opens by demanding the limit.

---

## Layout

```
src/lib/dealtrip/     the engine
  pricing.ts          the only module that produces a rupee figure
  commerce-guard.ts   14 deterministic checks; recomputes every price
  merchant-agent.ts   merchant-side agent (model, with a planner fallback)
  merchant-planner.ts exhaustive legal-package search: the fallback, and the floor
  orchestrator.ts     buyer-side desk: discovery, counters, ranking
  scoring.ts          deterministic deal scoring
  store.ts            Postgres + in-memory, incl. atomic inventory holds
  seed.ts             15 merchants across 3 destinations
  __tests__/          45 tests

src/mcp/server.ts     MCP server, lets any external agent transact
src/app/api/          REST + SSE, the public agent endpoints, the Razorpay webhook
src/views/dealtrip/   the screens
src/components/ui/    shadcn/ui + Base UI primitives (from the Tourix template)
```

## Running it

```bash
pnpm install
cp .env.example .env.local   # add your keys
pnpm dev                     # http://localhost:3000
pnpm test                    # 45 tests, ~150ms
```

Everything is optional. With no `DATABASE_URL` it runs in memory; with no `GROQ_API_KEY`
the agents run on the deterministic planner; with no Razorpay keys orders are simulated and
**clearly labelled as such**. `/api/health` tells you exactly what is live, the dashboard
leads with it, so a demo can't quietly fall back and let you believe otherwise.

| Variable | Purpose |
|---|---|
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Test-mode orders and signature verification |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Checkout, in the browser |
| `RAZORPAY_WEBHOOK_SECRET` | Confirms bookings even if the browser never calls back |
| `GROQ_API_KEY` / `GROQ_MODEL` | The agents. Provider-agnostic, one OpenAI-compatible `fetch` |
| `DATABASE_URL` | Postgres (Neon). Omit for in-memory |

---

## Deploying to Vercel

```bash
vercel            # link the project
vercel --prod
```

Set these in **Project Settings → Environment Variables** before the first deploy:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | **Required.** Serverless invocations do not share memory, so the in-memory fallback cannot carry a negotiation between requests |
| `GROQ_API_KEY`, `GROQ_MODEL` | Without these the agents run on the deterministic planner |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Test mode |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Needed in the browser, so it must be `NEXT_PUBLIC_` |
| `RAZORPAY_WEBHOOK_SECRET` | Point the webhook at `https://<your-domain>/api/payments/webhook` |

Everything renders on demand, so nothing is baked in at build time and no
database is needed to build. Agent-facing URLs come from the incoming request,
so preview deployments advertise their own domain without configuration.

**One thing to check before demoing on Hobby.** A full negotiation is five
merchants over two rounds and takes roughly 60 seconds against Groq's free tier.
The stream route declares `maxDuration = 300`, but Vercel clamps that to the
plan limit, and Hobby caps function execution at 60 seconds. If the stream is
cut off mid-negotiation, the fix is a faster inference tier rather than a
smaller marketplace.

To point an MCP client at the deployed marketplace rather than localhost, set
`DEALTRIP_BASE_URL=https://<your-domain>` in the client config.

## The screens

| Route | What it is |
|---|---|
| `/` | **Intent Composer**. Natural language in, editable constraints out |
| `/desk/[id]` | **Live Deal Desk**. Agents negotiating over SSE, guard rulings as they land |
| `/deal/[id]` | **Comparison**. Shortlist, score breakdowns, what negotiation won |
| `/deal/[id]/checkout` | **Approval & Razorpay**. Guard re-runs before an order exists |
| `/deal/[id]/timeline` | **Trust Timeline**. Append-only, expandable to raw payloads |
| `/deal/[id]/replay` | **Replay**. Step through the negotiation event by event |
| `/dashboard/merchants/[slug]` | **Policy Studio**. Sliders show the rupee floor they imply |
| `/dashboard/merchants/onboard` | **Onboarding**. Paste a rate card, get an Agent Commerce Profile |
| `/dashboard/simulator` | **Revenue simulator**. Streamed live, one line per traveller |
| `/dashboard/agent-api` | Copy-paste `curl` for every agent endpoint |

Plus, outside the browser: an **MCP server** (`pnpm mcp`) and a signed
**Razorpay webhook** at `/api/payments/webhook`.

---

## The marketplace

**15 merchants across 3 destinations**, five apiece, deliberately non-overlapping so that
any single requirement has an obvious winner and an obvious set of near-misses.

| | Goa (beach) | Manali (mountains) | Udaipur (lakes) |
|---|---|---|---|
| **Premium** | OceanVista | Cloudveil Chalets | Pichola Palace |
| **Family** | Sunset Bay | Alpine Rowan | Saheli Courtyard |
| **Budget** | Casa Aurora | Hadimba Inn | Ambrai House |
| **Self-catering / pets** | PalmStay | Beas Workstay | Fateh Lake Villas |
| **The one that cannot** | Kokum Cliffs (not beachfront) | Solang Peaks | Haveli Amrit |

Each destination has 11 to 14 attributes contested by two or more merchants, 7 to 11 that
only one merchant offers, and 2 to 5 nobody offers at all, so a hard constraint has
something real to exclude. Verified per-archetype:

```
Couple, anniversary    Goa      ≤ ₹60,000  →  OceanVista Resort        ₹44,889  (4 eligible)
Family of four         Goa      ≤ ₹95,000  →  Sunset Bay Retreat       ₹84,680
Backpacker, cheapest   Udaipur  ≤ ₹18,000  →  Ambrai Backpacker House  ₹13,944
Remote worker, 5n      Manali   ≤ ₹55,000  →  Beas Workstay            ₹45,888
Dog owner              Udaipur  ≤ ₹70,000  →  Fateh Lake Villas        ₹64,960
Adventure group        Manali   ≤ ₹80,000  →  Solang Peaks Resort      ₹76,500  (5 eligible)
Wants a beach          Manali   ≤ ₹60,000  →  NO DEAL, there is no beachfront in the mountains
```

## Does negotiation actually earn anything?

The simulator runs the **same synthetic demand twice**. Once where merchants may negotiate,
once where they may not. Against identical catalogs and the same ranking function.

| | Static shelf | DealTrip |
|---|---|---|
| Conversion | 70.7% | **85.3%** |
| Revenue | ₹50.8L | **₹68.6L** *(+35%)* |
| Revenue per traveller | ₹33,887 | **₹45,755** |
| Deal-fit score | 83.4 | **85.6** |
| Margin retained | 44.5% | 43.1% |

137 offers blocked by the guard; **22 sales recovered** that the static shelf lost outright.
Margin holds within ~1.4 points. Merchants sold *more*, not cheaper.

Holds across all three destinations, at 120 synthetic travellers each:

```
Goa      conv 75% -> 83%   revenue +28.5%   margin 48.1% -> 45.9%   102 guard blocks
Manali   conv 73% -> 75%   revenue +27.1%   margin 47.9% -> 46.3%    44 guard blocks
Udaipur  conv 71% -> 72%   revenue +43.4%   margin 48.5% -> 48.6%    43 guard blocks
```

> ⚠️ **These are synthetic evaluation results.** Synthetic travellers, synthetic catalogs.
> This is not a measurement of real merchant performance and the UI says so above the numbers,
> not in a footnote. The baseline is deliberately not a strawman: it's what a competent
> booking site already does. See every room, tick the add-ons you need, pay the published
> price. Runs are deterministic from their seed.

---

## Tests

```
45 tests · 12 suites · 0 failures · ~150ms
```

Concentrated where correctness is load-bearing. Pricing, the guard, scoring, inventory
reservations and webhook signatures. Node's built-in runner; no test framework added.

Two bugs these caught, both real:

- **Ranking wasn't deterministic.** Two offers alike on every criterion sorted by arrival
  order, so the same shortlist could rank two ways. Fixed with a stable final tie-break.
- **A test of mine encoded a wrong assumption** about negotiation credit. The code was right;
  the test was corrected.

And one the tests were written *because* of: inventory was checked but never decremented,
so the last room could be sold twice. Closed with an atomic hold.

---

## Attribution & disclosure

**All merchants, inventory, prices and availability in this project are synthetic**,
published for the Buildathon. Nothing here is bookable. Razorpay runs in **test mode only**.
