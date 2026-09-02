#!/usr/bin/env node
/**
 * DealTrip MCP server.
 *
 * Lets any MCP-capable agent (Claude Desktop, or anything else) discover
 * DealTrip's merchants, request quotes and negotiate, over exactly the same
 * public endpoints DealTrip's own Deal Orchestrator calls.
 *
 * That equivalence is the point. A marketplace where only its author's agent
 * can transact proves nothing about agent-to-agent commerce; this server exists
 * so a buyer nobody here wrote can sit on the other side of the table, and be
 * refused by the same Commerce Guard when it asks for something out of policy.
 *
 * Transport is stdio, so it runs under any MCP client without a network listener
 * of its own. It holds no credentials and has no privileged access. Everything
 * it can do, anyone with the base URL can do.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const BASE_URL = (process.env.DEALTRIP_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Every tool returns the marketplace's own JSON, unedited. */
const call = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', accept: 'application/json', ...(init?.headers ?? {}) }
  })

  const body = await response.text()

  // A refusal is a legitimate result, not a transport failure: the guard's
  // verdict is the most informative thing this server ever returns, so a 409
  // is handed back in full rather than thrown away as an error.
  return {
    content: [
      {
        type: 'text' as const,
        text: `HTTP ${response.status}\n\n${body}`
      }
    ],
    isError: response.status >= 500
  }
}

const IntentShape = {
  destination: z.string().describe('City or region, e.g. "Goa". Must match a destination the marketplace serves.'),
  travelers: z.number().int().min(1).max(20),
  duration_nights: z.number().int().min(1).max(30),
  budget_max: z.number().int().positive().describe('Total trip budget in whole rupees.'),
  budget_is_hard: z
    .boolean()
    .default(true)
    .describe('True if the traveller will not exceed it. A hard budget causes the guard to refuse dearer offers outright.'),
  requirements: z
    .record(z.string(), z.enum(['required', 'preferred', 'avoid']))
    .default({})
    .describe(
      'Attribute -> strength. Attributes MUST come from the published vocabulary; call get_vocabulary first. "required" is a hard gate.'
    ),
  check_in: z.string().nullable().default(null).describe('ISO date (YYYY-MM-DD), or null to let the merchant propose.'),
  date_flexibility_days: z.number().int().min(0).max(14).default(0),
  priority: z.enum(['lowest_price', 'best_value', 'best_experience']).default('best_value'),
  notes: z.string().default('').describe('Anything else in the traveller\'s own words. Merchants read this.')
}

type IntentArgs = { [K in keyof typeof IntentShape]: z.infer<(typeof IntentShape)[K]> }

/** Map the flattened tool arguments onto the marketplace's TravelIntent. */
const toIntent = (args: IntentArgs) => ({
  destination: args.destination,
  travelers: args.travelers,
  duration_nights: args.duration_nights,
  budget: { max: args.budget_max, currency: 'INR' as const, type: args.budget_is_hard ? 'hard_constraint' : 'soft_target' },
  requirements: args.requirements,
  date_flexibility_days: args.date_flexibility_days,
  check_in: args.check_in,
  priority: args.priority,
  notes: args.notes
})

const server = new McpServer({ name: 'dealtrip', version: '1.0.0' })

server.registerTool(
  'discover_merchants',
  {
    title: 'Discover merchants',
    description:
      'List every merchant in the DealTrip marketplace, with the destination each serves and whether it negotiates. Start here.',
    inputSchema: {}
  },
  async () => call('/.well-known/agent-commerce.json')
)

server.registerTool(
  'get_vocabulary',
  {
    title: 'Get the requirement vocabulary',
    description:
      'The closed list of attributes a traveller requirement may use. Matching is a set operation, so a term outside this list is refused rather than approximated. Call this before composing an intent.',
    inputSchema: {}
  },
  async () => call('/api/agent/vocabulary')
)

server.registerTool(
  'get_merchant_profile',
  {
    title: 'Read a merchant catalog',
    description:
      "A merchant's machine-readable storefront: rooms, add-ons, what it will negotiate over. Its discount ceiling and margin floor are deliberately not published, they are enforced server-side.",
    inputSchema: { slug: z.string().describe('Merchant slug, e.g. "oceanvista", from discover_merchants.') }
  },
  async ({ slug }) => call(`/api/agent/${encodeURIComponent(slug)}/profile`)
)

server.registerTool(
  'request_quote',
  {
    title: 'Request a quote',
    description:
      "Ask a merchant to compose a package for a traveller's constraints. Optionally propose your own bundle instead, including a deliberately illegal one, to see the Commerce Guard refuse it. Every response carries the guard's full verdict, pass or fail.",
    inputSchema: {
      slug: z.string(),
      ...IntentShape,
      room_id: z.string().optional().describe('Propose a specific room instead of letting the merchant choose.'),
      addon_ids: z.array(z.string()).optional(),
      discount_pct: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe('The discount you are asking for. Exceeding the merchant’s ceiling returns 409 with the reason.')
    }
  },
  async ({ slug, room_id, addon_ids, discount_pct, ...intentArgs }) => {
    const proposing = room_id !== undefined || discount_pct !== undefined

    return call(`/api/agent/${encodeURIComponent(slug)}/quote`, {
      method: 'POST',
      body: JSON.stringify({
        intent: toIntent(intentArgs as IntentArgs),
        ...(proposing
          ? { bundle: { room_id: room_id ?? '', addon_ids: addon_ids ?? [], discount_pct: discount_pct ?? 0 } }
          : {})
      })
    })
  }
)

server.registerTool(
  'negotiate',
  {
    title: 'Send a counter-request',
    description:
      'Push a merchant on a quote. Name a target price, the attributes that must survive, and the groups you will let it change. It revises within its own policy, or declines honestly. Bounded by the merchant’s permitted number of rounds.',
    inputSchema: {
      slug: z.string(),
      ...IntentShape,
      previous_room_id: z.string().describe('The room from the quote you are countering.'),
      previous_addon_ids: z.array(z.string()).default([]),
      previous_discount_pct: z.number().min(0).max(100).default(0),
      max_price: z.number().int().positive().describe('The price the merchant must come to, or under.'),
      preserve: z.array(z.string()).default([]).describe('Attributes that must survive the revision.'),
      preferred: z.array(z.string()).default([]).describe('Attributes worth keeping if affordable.'),
      substitution_allowed: z
        .array(z.string())
        .default([])
        .describe('Add-on groups, or "room_category", you will accept changes to.'),
      message: z.string().default('').describe('A sentence to the merchant explaining the ask.'),
      round: z.number().int().min(1).max(5).default(1)
    }
  },
  async ({
    slug,
    previous_room_id,
    previous_addon_ids,
    previous_discount_pct,
    max_price,
    preserve,
    preferred,
    substitution_allowed,
    message,
    round,
    ...intentArgs
  }) =>
    call(`/api/agent/${encodeURIComponent(slug)}/negotiate`, {
      method: 'POST',
      body: JSON.stringify({
        intent: toIntent(intentArgs as IntentArgs),
        previous_bundle: {
          room_id: previous_room_id,
          addon_ids: previous_addon_ids,
          discount_pct: previous_discount_pct
        },
        counter: {
          type: 'COUNTER_REQUEST',
          max_price,
          preserve,
          preferred,
          substitution_allowed,
          message: message || `Come to ${max_price} while keeping the must-haves.`
        },
        round
      })
    })
)

const main = async () => {
  await server.connect(new StdioServerTransport())

  // stderr only: stdout is the transport.
  console.error(`[dealtrip-mcp] connected · marketplace ${BASE_URL}`)
}

main().catch(error => {
  console.error('[dealtrip-mcp] failed to start:', error)
  process.exit(1)
})
