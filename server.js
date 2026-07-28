#!/usr/bin/env node
/**
 * Praesago MCP server — stdio proxy to the hosted endpoint (Node port).
 *
 * Identical behaviour to server.py: speaks the MCP stdio transport
 * (newline-delimited JSON-RPC 2.0) and forwards every request to
 * https://praesago.com/api/mcp (Streamable HTTP). Zero dependencies.
 *
 * Two runtimes exist because build environments differ: Glama's builder
 * clones into its own base image rather than using this repo's Dockerfile,
 * and an MCP builder image reliably has Node but not necessarily Python
 * (and where Python exists it is often `python3`, not `python`). Node is the
 * safer default; server.py stays for Python-only environments and for the
 * repo's own Dockerfile.
 *
 * Optional: set PRAESAGO_API_KEY for full area context and higher limits.
 *
 * Usage:
 *   node server.js
 */

'use strict';

const ENDPOINT = process.env.PRAESAGO_MCP_URL || 'https://praesago.com/api/mcp';

async function forward(message) {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.PRAESAGO_API_KEY) {
    headers['X-API-Key'] = process.env.PRAESAGO_API_KEY;
  }
  try {
    // fetch follows 307/308 while preserving the method, so the apex
    // redirect that broke the Python version cannot bite here.
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
    });
    if (res.status === 202) return null;
    const text = await res.text();
    if (!text) return null;
    if (!res.ok) {
      return {
        jsonrpc: '2.0',
        id: message.id ?? null,
        error: { code: -32603, message: `Upstream HTTP ${res.status}` },
      };
    }
    return JSON.parse(text);
  } catch (e) {
    return {
      jsonrpc: '2.0',
      id: message.id ?? null,
      error: { code: -32603, message: `Upstream unreachable: ${e.message}` },
    };
  }
}

let buffer = '';
// In-flight forwards. stdin closing does NOT mean the work is done — with
// piped input ("echo ... | node server.js") 'end' fires immediately, and
// exiting there would kill every pending request and print nothing.
// Node exits on its own once stdin has ended and no promise is outstanding,
// so there is no explicit process.exit() — calling it while stdin is tearing
// down trips a libuv assertion on Windows.
const pending = new Set();

function handle(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    process.stdout.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      }) + '\n'
    );
    return;
  }

  // Notifications carry no id and must not be answered.
  const isNotification = message && typeof message === 'object' && !('id' in message);
  const task = forward(message).then((response) => {
    if (response !== null && !isNotification) {
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  });
  pending.add(task);
  task.finally(() => pending.delete(task));
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (line) handle(line);
  }
});

process.stdin.on('end', () => {
  const rest = buffer.trim();
  if (rest) handle(rest);   // final line without a trailing newline
  buffer = '';
});
