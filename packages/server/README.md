# 🌐 GLMPilot Server

The `server` package is the core backend for the GLMPilot IDE. It handles real-time coordination, acts as a secure proxy to the GLM Mini AI, and manages containerized terminal sessions.

## Key Responsibilities

1. **API Proxy**: Securely routes requests to the GLM Mini API without exposing the `GLM_API_KEY` to the client.
2. **WebSocket Management**: Uses `Socket.io` to provide real-time connection channels for the IDE. These channels include:
   - **Terminal Events**: Streams `stdout` and `stderr` to the client's xterm.js UI, while receiving `stdin`.
   - **Code Sync**: Relays editor state and file system changes between the client, the backend file system, and the AI context.
3. **Multi-Agent Reviewers**: Houses the logic for specialized AI agents (Security, Performance, Style, Documentation) situated in `src/agents/`. These agents can be triggered to analyze workspace code and summarize issues or generate auto-fixes.

## Main Entry Point

- `src/index.ts`: Straps Express, Socket.io, and the API routes together.

## Development

Run `npm run dev` (or `npm run dev:server` from the root) to start the server with hot-reloading using `ts-node-dev` or `nodemon`.
