# Praesago MCP Server

UK property area intelligence inside Claude, ChatGPT, Cursor or any MCP client.

Ask your AI assistant "is Walthamstow up and coming?" or "find areas in the
North West under £250k with strong fundamentals" and get live, validated
answers from Praesago's data — 2,292 England & Wales postcode districts scored
monthly from 30+ government data sources (Land Registry, ONS, police.uk, EPC,
planning registers and more).

This is a **hosted (remote) MCP server** — no install, no local process.

```
https://praesago.com/api/mcp
```

Transport: Streamable HTTP (JSON-RPC 2.0, protocol `2025-03-26`).

## Tools

| Tool | What it answers |
|---|---|
| `get_area_score` | Trajectory Score (0-100), percentile, gentrification stage, backtested calibration |
| `get_market_pulse` | **Live asking market**: active listings, price reductions, median asking, time on market |
| `get_area_context` | Full district profile: demographics, income, tenure, IMD, health, education, broadband, flood risk, prices |
| `search_areas` | Screen districts by score, region and price ceiling |
| `compare_areas` | Two districts side by side |
| `search` / `fetch` | ChatGPT deep-research compatible aliases |

`get_market_pulse` is collected weekly from property portals and exists
nowhere else: Land Registry reports completions months after the fact, and
the portals themselves do not publish reduction rates or time-on-market.

## Connect

**Claude (web / desktop):** Settings → Connectors → Add custom connector →
paste the URL above.

**Claude Code:**

```bash
claude mcp add --transport http praesago https://praesago.com/api/mcp
```

**Cursor / other clients:** add a remote server with transport `http` and the
URL above.

**Local stdio (any MCP client, or air-gapped configs):** this repo ships a
zero-dependency stdio proxy to the hosted endpoint, in both runtimes:

```bash
node server.js                         # Node 18+, no npm install needed
python server.py                       # Python 3.9+, no pip install needed
# or
docker build -t praesago-mcp . && docker run -i praesago-mcp
```

Set `PRAESAGO_API_KEY` in the environment to unlock full area context.

## Tools

| Tool | Access | What it does |
|---|---|---|
| `get_area_score` | Free | Trajectory Score (0–100), national percentile, gentrification early-warning stage and measured historical calibration for any postcode district or full postcode |
| `search_areas` | Free | Screen all 2,292 districts by minimum score, region and maximum median price |
| `compare_areas` | Free | Two districts side by side |
| `get_area_context` | API key | Full area payload: demographics, income, tenure, deprivation (IMD), health, education, broadband, flood risk, council tax, politics, 12-month prices |
| `search` / `fetch` | Free / key | Aliases for ChatGPT deep-research connector compatibility |

Free tier: 30 calls/day, no key needed. Full access: add a
[Praesago API key](https://praesago.com/pricing) as `Authorization: Bearer`
or `X-API-Key`.

## Honesty notes

The Trajectory Score measures the strength of signals that have **historically
preceded** property price growth. It is a screening aid, not a prediction —
and the server's instructions tell your assistant exactly that. Praesago
publishes its full validation record, including the windows where the model
failed: [praesago.com/validation](https://praesago.com/validation).

Calibration (measured across ~36,700 backtested district-windows): districts
scoring 60+ beat their county's median price growth in 63% of three-year
windows; districts under 40 managed 37%.

## Example prompts

- "Is Walthamstow up and coming?"
- "Find postcode districts in Greater Manchester under £250k with strong fundamentals"
- "Compare E17 and N15 for a buy-to-let"

## Links

- Docs: https://praesago.com/docs/mcp
- Methodology: https://praesago.com/methodology
- Validation: https://praesago.com/validation
- REST API: https://praesago.com/developer

Data sources: HM Land Registry, ONS, police.uk, DfE, Environment Agency,
Ofcom, DLUHC and more (Crown copyright / OGL). Coverage: England & Wales.
