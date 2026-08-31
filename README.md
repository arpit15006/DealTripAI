# DealTrip

**The agentic deal desk for travel.** Don't search for a trip — let your AI make the deal.

Built for the **Razorpay AI Buildathon**, Track 01 — *AI Growth & Agentic Commerce*.

A traveller says what they want. DealTrip turns it into hard constraints, negotiates with
merchant agents that each defend their own margin, blocks anything outside policy, and
settles through Razorpay — with every money decision explainable, bounded, gated and
recorded.

---

## The idea in one paragraph

Travel commerce is built for browsing. The buyer knows their constraints; the merchant
knows its flexibility; neither has a way to exchange them. DealTrip is that exchange. A
buyer-side **Deal Orchestrator** represents the traveller's constraints. **Merchant agents**
compose and revise packages while defending their own revenue. A deterministic **Commerce
Guard** authorises — or refuses — every offer before it can be seen, ranked or paid for.

## The one design decision everything rests on

> **Agents choose packages. Code computes money.**

A merchant agent picks a room, a set of add-ons, a check-in date and a discount percentage.
It never emits a rupee figure — [`pricing.ts`](frontend/src/lib/dealtrip/pricing.ts) is the
only module that produces one. The **Commerce Guard** then re-derives the entire quote from
the catalog and compares it line by line.

So *"the AI cannot invent a price"* is not a claim in a pitch deck. It is a checked property,
and there is [a test for it](frontend/src/lib/dealtrip/__tests__/commerce-guard.test.ts):
hand the guard a tampered quote and it refuses.

---

## Meeting Track 01's bar

> *Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully.*

| The bar | How |
|---|---|
| **Explainable** | Every ranked deal shows its score term by term, each with the sentence that justifies it. Every offer carries the guard's 13 named checks. |
| **Bounded** | Two independent floors per merchant — a discount ceiling *and* a margin floor — plus round limits, locked inclusions and a date window. The higher floor binds. |
| **Gated** | Nothing is charged until the traveller approves one specific offer. The guard then re-runs **from scratch** before an order exists, and the amount sent to Razorpay is recomputed server-side. |
| **Audit trail** | Append-only. ~26 events for a typical run, every row expandable to its raw payload, plus a step-through replay. |
| **A failure, handled** | Several — see below. |

### Failures the system handles, live

1. **A merchant tries to breach its own policy.** PalmStay's only beachfront villa cannot
   legally reach a ₹60,000 budget — its 26% margin floor binds at ₹63,582. The guard blocks
   the offer, the desk sends a counter-request, and the agent restructures. *This is
   arithmetic, not a staged outcome — there's a test asserting the floor.*
2. **A merchant declines honestly.** Kokum Cliffs is cliff-top, not beachfront. It withdraws
   rather than proposing something that would be refused.
3. **A forged payment signature.** Verified server-side against the key secret; nothing is
   marked booked.
4. **A payment that doesn't complete.** Nothing is charged, nothing is booked, and the
   negotiated price is *held* — the traveller retries without negotiating again.
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
Commerce Guard  ◄── 13 deterministic checks, recomputes every price from the catalog
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

### Where AI is used — and where it deliberately isn't

| Decision | Made by | Why |
|---|---|---|
| Reading a traveller's request | **Model** | Natural language is what models are for. Bound to a closed vocabulary and confirmed by the user. |
| Which room, add-ons and dates make a package | **Model** | A combinatorial choice over semantically-labelled options. It read *"anniversary trip"* and kept the couples spa — the planner has no way to know that; "anniversary" isn't in the attribute vocabulary. |

Both are recorded on every merchant turn, and the UI shows them side by side —
what the deterministic planner *would* have chosen against what the agent actually
proposed. It says "the agent and the planner agreed" when they did; a comparison
that only appeared when it flattered the model would not be evidence of anything.

| Every rupee | **Code** | Arithmetic. A model has no business here. |
| Whether an offer is permissible | **Code** | Determinism is the entire point of a guard. |
| Ranking the shortlist | **Code** | Same shortlist, same ranking, every time. |
| Retrieval over merchant catalogs | **Neither** | A merchant's whole catalog is ~40 lines of JSON and goes into the prompt in full. RAG would add a recall failure mode and buy nothing. |

Every model call is schema-bound and has a **deterministic fallback**: if the key is missing,
the API is down, or two attempts fail validation, the planner produces the answer instead.
The revenue simulator runs entirely on that path — thousands of negotiations, zero tokens.

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
      "args": ["tsx", "<repo>/frontend/src/mcp/server.ts"],
      "env": { "DEALTRIP_BASE_URL": "http://localhost:3000" }
    }
  }
}
```

Five tools — `discover_merchants`, `get_vocabulary`, `get_merchant_profile`,
`request_quote`, `negotiate` — over the same public endpoints DealTrip's own Deal
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

Then **try to break it** — demand a 40% discount against a 5% ceiling:

```bash
curl -sX POST localhost:3000/api/agent/oceanvista/quote \
  -H 'content-type: application/json' \
  -d '{"intent":{"destination":"Goa","travelers":2,"duration_nights":3,
       "budget":{"max":60000,"currency":"INR","type":"hard_constraint"},
       "requirements":{"beachfront":"required"},"date_flexibility_days":2,
       "check_in":null,"priority":"best_value","notes":""},
       "bundle":{"room_id":"ov-premium-beach","addon_ids":[],"discount_pct":40}}' | jq '.guard'
```

It returns **409** with both violations and the lowest legal price. These are the same
endpoints DealTrip's own orchestrator uses — there is no private side channel.

Discount ceilings and margin floors are deliberately **not** published. A profile says a
merchant negotiates and over what; how far it will go stays behind the guard, because
publishing it just means every buyer opens by demanding the limit.

---

## Running it

```bash
cd frontend
pnpm install
cp .env.example .env.local   # add your keys
pnpm dev                     # http://localhost:3000
pnpm test                    # 33 tests, ~100ms
```

Everything is optional. With no `DATABASE_URL` it runs in memory; with no `GROQ_API_KEY`
the agents run on the deterministic planner; with no Razorpay keys orders are simulated and
**clearly labelled as such**. `/api/health` tells you exactly what is live — the dashboard
leads with it, so a demo can't quietly fall back and let you believe otherwise.

| Variable | Purpose |
|---|---|
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Test-mode orders and signature verification |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Checkout, in the browser |
| `RAZORPAY_WEBHOOK_SECRET` | Confirms bookings even if the browser never calls back |
| `GROQ_API_KEY` / `GROQ_MODEL` | The agents. Provider-agnostic — one OpenAI-compatible `fetch` |
| `DATABASE_URL` | Postgres (Neon). Omit for in-memory |

---

## The screens

| Route | What it is |
|---|---|
| `/` | **Intent Composer** — natural language in, editable constraints out |
| `/desk/[id]` | **Live Deal Desk** — agents negotiating over SSE, guard rulings as they land |
| `/deal/[id]` | **Comparison** — shortlist, score breakdowns, what negotiation won |
| `/deal/[id]/checkout` | **Approval & Razorpay** — guard re-runs before an order exists |
| `/deal/[id]/timeline` | **Trust Timeline** — append-only, expandable to raw payloads |
| `/deal/[id]/replay` | **Replay** — step through the negotiation event by event |
| `/dashboard/merchants/[slug]` | **Policy Studio** — sliders show the rupee floor they imply |
| `/dashboard/merchants/onboard` | **Onboarding** — paste a rate card, get an Agent Commerce Profile |
| `/dashboard/simulator` | **Revenue simulator** — streamed live, one line per traveller |
| `/dashboard/agent-api` | Copy-paste `curl` for every agent endpoint |

Plus, outside the browser: an **MCP server** (`pnpm mcp`) and a signed
**Razorpay webhook** at `/api/payments/webhook`.

---

## Does negotiation actually earn anything?

The simulator runs the **same synthetic demand twice** — once where merchants may negotiate,
once where they may not — against identical catalogs and the same ranking function.

| | Static shelf | DealTrip |
|---|---|---|
| Conversion | 70.7% | **85.3%** |
| Revenue | ₹50.8L | **₹68.6L** *(+35%)* |
| Revenue per traveller | ₹33,887 | **₹45,755** |
| Deal-fit score | 83.4 | **85.6** |
| Margin retained | 44.5% | 43.1% |

137 offers blocked by the guard; **22 sales recovered** that the static shelf lost outright.
Margin holds within ~1.4 points — merchants sold *more*, not cheaper.

> ⚠️ **These are synthetic evaluation results.** Synthetic travellers, synthetic catalogs.
> This is not a measurement of real merchant performance and the UI says so above the numbers,
> not in a footnote. The baseline is deliberately not a strawman: it's what a competent
> booking site already does — see every room, tick the add-ons you need, pay the published
> price. Runs are deterministic from their seed.

---

## Tests

```
43 tests · 14 suites · 0 failures · ~110ms
```

Concentrated where correctness is load-bearing — pricing, the guard, scoring, inventory
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

UI built on [shadcn/studio](https://shadcnstudio.com)'s Tourix template (licensed), on
[shadcn/ui](https://ui.shadcn.com) and [Base UI](https://base-ui.com). Photography is
destination imagery from the template, chosen to match each property's character — it is
**not** photography of real rooms, and no room-level imagery is claimed.

**All merchants, inventory, prices and availability in this project are synthetic**,
published for the Buildathon. Nothing here is bookable. Razorpay runs in **test mode only**.
