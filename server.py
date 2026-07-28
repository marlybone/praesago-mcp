#!/usr/bin/env python3
"""
Praesago MCP server — stdio proxy to the hosted endpoint.

Speaks the MCP stdio transport (newline-delimited JSON-RPC 2.0) and forwards
every request to https://www.praesago.com/api/mcp (Streamable HTTP). Zero
dependencies — Python 3.9+ standard library only.

Optional: set PRAESAGO_API_KEY to unlock full area context and higher limits.

Usage:
    python server.py
    docker build -t praesago-mcp . && docker run -i -e PRAESAGO_API_KEY praesago-mcp
"""

import json
import os
import sys
import urllib.request

# Apex, not www: praesago.com 308-redirects www -> apex, and urllib does not
# follow a 308 on POST (it raises). Pointing at www made every call fail with
# "Upstream HTTP 308" — the proxy, the Docker image and every README install
# were broken by one hostname. The redirect handler below is belt and braces
# in case the canonical host ever moves again.
ENDPOINT = os.environ.get('PRAESAGO_MCP_URL', 'https://praesago.com/api/mcp')


class _KeepMethodRedirect(urllib.request.HTTPRedirectHandler):
    """Follow 307/308 without downgrading POST to GET (RFC 7231 requires the
    method be preserved; urllib's default handler refuses these outright)."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if code in (307, 308):
            return urllib.request.Request(
                newurl, data=req.data, headers=req.headers,
                origin_req_host=req.origin_req_host, unverifiable=True,
                method=req.get_method(),
            )
        return super().redirect_request(req, fp, code, msg, headers, newurl)


_opener = urllib.request.build_opener(_KeepMethodRedirect)


def forward(message: dict) -> dict | None:
    data = json.dumps(message).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    api_key = os.environ.get('PRAESAGO_API_KEY')
    if api_key:
        headers['X-API-Key'] = api_key
    req = urllib.request.Request(ENDPOINT, data=data, headers=headers, method='POST')
    try:
        with _opener.open(req, timeout=60) as resp:
            body = resp.read()
            return json.loads(body) if body and resp.status != 202 else None
    except urllib.error.HTTPError as e:
        return {
            'jsonrpc': '2.0',
            'id': message.get('id'),
            'error': {'code': -32603, 'message': f'Upstream HTTP {e.code}'},
        }
    except Exception as e:
        return {
            'jsonrpc': '2.0',
            'id': message.get('id'),
            'error': {'code': -32603, 'message': f'Upstream unreachable: {e}'},
        }


def main() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            message = json.loads(line)
        except json.JSONDecodeError:
            print(json.dumps({'jsonrpc': '2.0', 'id': None,
                              'error': {'code': -32700, 'message': 'Parse error'}}),
                  flush=True)
            continue

        is_notification = isinstance(message, dict) and 'id' not in message
        response = forward(message)
        if response is not None and not is_notification:
            print(json.dumps(response), flush=True)


if __name__ == '__main__':
    main()
