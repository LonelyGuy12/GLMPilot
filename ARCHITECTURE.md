# GLMPilot Architecture

GLMPilot is built as a modern, full-stack monorepo designed to provide a seamless, rich browser-based IDE experience. It leverages React for the frontend, Node.js/Express for the backend, and WebSockets for real-time bidirectional communication.

## 🏗️ Repository Structure

The project uses npm workspaces to manage its packages. 

```text
GLMPilot/
├── packages/
│   ├── client/    # React frontend application
│   ├── server/    # Node.js Express backend & WebSocket server
│   └── shared/    # Shared TypeScript types, constants, and utilities
```

### 1. `packages/client` (Frontend)

The frontend is a Single Page Application (SPA) built with React 18 and bundled using Vite.

**Key Technologies:**
- **React 18**: UI component library.
- **React Router**: For client-side routing (`/` for Landing, `/ide` for environment selection, `/ide/:env` for the IDE shell).
- **Zustand**: For lightweight, global state management (e.g., Editor state, File system state, AI chat state).
- **Tailwind CSS**: For utility-first styling.
- **Monaco Editor**: The core code editor component (same engine as VS Code).

**Core Components (`src/`):**
- `components/layout/IDEShell.tsx`: The main IDE interface containing the file explorer, Monaco editor, and terminal/preview panes.
- `components/ide/EnvironmentSelector.tsx`: Allows users to choose their development environment (e.g., Web, Node, Python).
- `stores/`: Contains Zustand stores for managing global application state.
- `services/`: API client wrappers and WebSocket connections to the backend.

### 2. `packages/server` (Backend)

The backend is an Express.js server that handles API requests, serves the frontend in production, and manages real-time WebSocket connections.

**Key Technologies:**
- **Node.js & Express**: HTTP server framework.
- **Socket.io**: For real-time bi-directional event-based communication (Terminal, Code Sync).
- **Redis** (Optional/External): Used for pub/sub and state management across potential multiple instances.

**Core Components (`src/`):**
- `index.ts`: The main entry point. Sets up Express middleware, API routes, Socket.io, and serves the static React build in production.
- `websocket/handler.ts`: Manages incoming WebSocket connections for real-time terminal emulation and IDE collaboration events.
- `agents/`: Contains the logic for the different Multi-Agent AI Code Reviewers (Security, Performance, Style, Documentation). These interfaces communicate with the GLM model.
- `routes/`: Express API endpoints (e.g., authentication, project importing, AI proxy).
- `config/env.ts`: Centralized environment variable parsing and validation.

### 3. `packages/shared` (Shared Logic)

This package contains code that is utilized by both the `client` and the `server` to guarantee type safety and consistency across the stack.

**Core Components (`src/`):**
- `types.ts`: TypeScript interfaces for payloads, events, and data models (e.g., WebSocket event definitions, File abstractions).
- `constants.ts`: Shared static values (e.g., Event names, Environment types).
- `utils.ts`: Helper functions safe to run in both Node.js and Browser environments.

## 🔄 Data Flow & Communication

1. **HTTP/REST**: The client uses standard HTTP requests for one-off operations such as fetching initial configuration, authenticating, or triggering a specific AI agent review.
2. **WebSocket (Socket.io)**: Once the IDE shell is loaded, a persistent WebSocket connection is established. This channel is used for:
   - Streaming terminal input/output.
   - Live code collaboration/syncing.
   - Streaming AI chat responses.
3. **AI Integration**: The Express server acts as a proxy for the GLM Mini API. When the client requests an AI action (like a code completion or chat), it sends the request to the backend. The backend constructs the prompt (often reading workspace context), queries the AI model securely (using `GLM_API_KEY`), and streams the response back to the client.

## 🚢 Deployment Architecture

In a production environment like Hugging Face Spaces or a standard Docker container:
- The `client` is built into static HTML/JS/CSS files (`packages/client/dist`).
- The `server` is built to JavaScript (`packages/server/dist`).
- When the Node application (server) starts, it serves the React `dist` folder natively on the same port alongside the API and WebSocket server. This allows single-port deployment configurations heavily favored by containerized platforms.
