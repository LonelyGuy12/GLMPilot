---
title: GLMPilot
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# GLMPilot

GLMPilot is an AI-native, browser-based IDE built around GLM. It combines code editing, AI chat, code completion, multi-agent review, terminal execution, and GitHub workflows in a single application.

## Executive Summary

| Item | Details |
| --- | --- |
| Product Type | Browser-based AI IDE |
| Primary Use Case | Build, review, and ship code faster from one workspace |
| AI Backbone | GLM API (chat, completion, analysis, orchestration) |
| Deployment Model | Monorepo with Docker and Docker Compose support |
| Key Integrations | GitHub, Redis, WebSocket streaming |

## Key Capabilities

| Capability | Description | Business Value |
| --- | --- | --- |
| AI Chat and Streaming | Real-time GLM assistant integrated in the IDE | Faster iteration and lower context switching |
| Code Completion | Context-aware inline suggestions | Higher coding velocity |
| Multi-Agent Review | Security, performance, style, and documentation agents | Better code quality before PR |
| Monaco-Based Editor | Multi-file editing with VS Code-grade engine | Familiar professional developer experience |
| Integrated Terminal | Browser terminal over WebSocket | In-app execution and validation |
| Live Preview | Real-time HTML/CSS/JS preview | Rapid UI feedback loop |
| GitHub Workflow | Repository import and patch/PR flow | Shorter path from idea to merge |

## Architecture Overview

```text
Client (React + Monaco + Zustand)
  -> REST API (Express routes)
  -> WebSocket channel (chat tokens, terminal, execution events)

Server (Express + Agent Orchestrator)
  -> GLM service client
  -> GitHub service
  -> Redis (cache/pub-sub/coordination)
```

Detailed architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

## Repository Structure

| Path | Purpose |
| --- | --- |
| packages/client | React application, IDE shell, editor and UI components |
| packages/server | Express API, WebSocket handlers, AI services, agent orchestration |
| packages/shared | Shared types, constants, and cross-package utilities |
| Dockerfile | Production image build configuration |
| docker-compose.yml | Local multi-service orchestration |

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Monaco, Zustand |
| Backend | Node.js, Express, Socket.io |
| AI | GLM API with streaming and retry support |
| Infrastructure | Docker, Docker Compose, Redis |
| Repository | npm workspaces monorepo |

## Local Development

### Prerequisites

| Requirement | Minimum Version |
| --- | --- |
| Node.js | 18+ |
| npm | 9+ |
| Docker | Recommended |

### Setup

```bash
git clone https://github.com/your-username/GLMPilot.git
cd GLMPilot
npm install
cp .env.example .env
```

### Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| NODE_ENV | No | Runtime mode (development/production) |
| PORT | No | Server port |
| CLIENT_URL | No | Allowed client origin |
| GLM_API_KEY | Yes | GLM authentication key |
| GLM_BASE_URL | No | GLM API base URL |
| GLM_MODEL | No | Default GLM model |
| GITHUB_TOKEN | Optional | GitHub integration and PR automation |
| REDIS_URL | No | Redis connection string |
| LOG_LEVEL | No | Server logging verbosity |

Start Redis and run development servers:

```bash
docker run -d --name glmpilot-redis -p 6379:6379 redis
npm run dev:all
```

| Service | URL |
| --- | --- |
| Client | http://localhost:5173 |
| Server | http://localhost:3001 |

## Scripts

| Command | Description |
| --- | --- |
| npm run dev | Start client development server |
| npm run dev:server | Start server development process |
| npm run dev:all | Run client and server concurrently |
| npm run build | Build shared, server, and client packages |
| npm run typecheck | Run TypeScript project-reference checks |

## Deployment

| Option | Command |
| --- | --- |
| Docker Compose | docker-compose up --build |
| Single Image | docker build -t glmpilot-ide . |
| Single Image Run | docker run --env-file .env -p 7860:7860 glmpilot-ide |

In containerized mode, the backend serves static frontend assets and API/WebSocket traffic from a single port.

## API and Realtime Surface

| Surface | Capability |
| --- | --- |
| REST | Chat, completion, review, docs and integration endpoints |
| SSE | Token streaming for chat responses |
| WebSocket | Terminal IO, execution events, chat token streaming |

Package-level docs:

- [packages/server/README.md](packages/server/README.md)
- [packages/client/README.md](packages/client/README.md)
- [packages/shared/README.md](packages/shared/README.md)

## Hackathon Readiness

| Requirement Area | Current Status |
| --- | --- |
| GLM Integration Depth | Implemented across chat, completion, and multi-agent analysis |
| Codebase Documentation | Root and package-level documentation available |
| Setup Reproducibility | .env template and Docker-based startup provided |
| Demonstration Path | Import -> Generate -> Review -> Validate -> PR workflow supported |

## Recommended Demo Flow

1. Import a GitHub repository.
2. Use GLM chat to generate or refactor feature code.
3. Run multi-agent review and inspect findings.
4. Apply fixes and verify using preview/terminal.
5. Create a PR with summarized changes.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit changes.
4. Push branch.
5. Open a pull request.
