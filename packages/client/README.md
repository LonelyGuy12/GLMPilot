# 🖥️ GLMPilot Client

The `client` package contains the React SPA that powers the browser-based IDE interface.

## Key Responsibilities

1. **IDE Shell**: The main workspace interface (`IDEShell.tsx`) containing the file explorer, Monaco editor, and terminal panes.
2. **Code Editing**: Integrates `@monaco-editor/react` to provide a VS Code-like editing experience with syntax highlighting and autocompletion.
3. **Live Web Preview**: Supports real-time rendering of HTML/JS/CSS within an iframe or a new tab.
4. **State Management**: Uses `zustand` stores located in `src/stores/` to manage complex client-side state efficiently without extensive prop-drilling. Stores typically manage:
   - Editor state (open files, current contents)
   - Chat state (conversation history with ASI-1)
   - Settings (user preferences, environment choices)

## Tech Stack

- **Framework**: React 18 
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Global State**: Zustand
- **Editor**: Monaco Editor

## Development

Run `npm run dev` (or `npm run dev:client` from the root) to start the Vite development server.
