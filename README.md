# Praesago MCP Server

UK property area data for England and Wales, for AI assistants and developers. Ask Claude, ChatGPT, Cursor or any MCP client for the facts about an area: sold prices, rents, crime, flood risk, schools, deprivation and the live listings market. Every figure carries its source year or date. It describes areas as they are and does not forecast prices.

This is a **hosted (remote) MCP server**. There is nothing to install.

```
https://praesago.com/api/mcp
```

Transport: Streamable HTTP (JSON-RPC 2.0).

## Tools

| Tool | What it answers |
|---|---|
| `get_area_overview` | Headline facts for a postcode, district or place name: median sold price and 12-month change, income, population, private renters, deprivation, flood risk, broadband, council tax, live listings and rents, rental yield, crime and road casualties |
| `get_area_context` | The deeper profile of about 30 sections (demographics, tenure, health, schools, noise, green space, politics, local economy) |
| `get_area_profile` | Figures for a whole local authority, added up over its postcode districts |
| `screen_areas` | Screen districts by price, asking rent, listings, price-cut share and region (including Wales) |
| `search_areas` | Screen districts by price and region |
| `compare_areas` | Two areas side by side |
| `get_market_pulse` | Live asking market: active listings, price reductions, median asking price, time on market |
| `search` / `fetch` | Aliases for ChatGPT deep-research connectors |

Coverage: England and Wales. Scotland and Northern Ireland are not covered.

## Connect

**Claude (web or desktop):** Settings, Connectors, Add custom connector, paste the URL above.

**Claude Code:**

```bash
claude mcp add --transport http praesago https://praesago.com/api/mcp
```

**Cursor and other clients:** add a remote server with transport `http` and the URL above.

**Local stdio (any MCP client):** this repo includes a zero-dependency stdio proxy to the hosted endpoint.

```bash
node server.js      # Node 18+, no npm install needed
python server.py    # Python 3.9+, no pip install needed
# or
docker build -t praesago-mcp . && docker run -i praesago-mcp
```

Set `PRAESAGO_API_KEY` in the environment to send your key with each call.

## Example questions

- "What is the median sold price in E17, and how has it moved in 12 months?"
- "Find districts in Wales with a median price under £150k and live rents above £700 a month."
- "Compare E17 and N15 for a buy-to-let."

## Links

- Docs: https://praesago.com/docs/mcp
- REST API: https://praesago.com/developer
- Examples: https://github.com/Praesago/praesago-mcp-examples

Data sources include HM Land Registry, ONS, police.uk, DfE, Environment Agency, Ofcom and DLUHC (Crown copyright, Open Government Licence).
