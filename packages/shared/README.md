# 🔗 GLMPilot Shared

The `shared` package is a pure TypeScript module designed to hold contracts and utilities shared between the `client` and `server`.

## Key Responsibilities

1. **Type Safety**: Provides shared TypeScript interfaces (`src/types.ts`) ensuring the client and server speak the exact same language. This includes:
   - WebSocket event payloads.
   - API request/response schemas.
   - File abstraction types.
2. **Constants**: Shared enumerations and constant strings (`src/constants.ts`) like event names (`WS_EVENTS.TERMINAL_DATA`) and environment identifiers.
3. **Utilities**: Helper functions (`src/utils.ts`) that are environment-agnostic (run identically in Node.js and the browser), such as specialized path parsers or formatters.

## Building

This package must be built (`npm run build:shared`) before the client or server can safely consume its output. In local development, TypeScript path aliases or workspace links usually handle this automatically, but a strict build is required for production.
