FROM python:3.12-slim

WORKDIR /app
COPY server.py .

# No dependencies — stdlib-only stdio proxy to the hosted Praesago MCP endpoint.
# Optional: -e PRAESAGO_API_KEY=... for full area context and higher limits.
ENTRYPOINT ["python", "server.py"]
