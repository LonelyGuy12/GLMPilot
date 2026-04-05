// Agent Names
export const AGENT_NAMES = {
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  STYLE: 'style',
  DOCUMENTATION: 'documentation',
} as const;

export const ALL_AGENTS = Object.values(AGENT_NAMES);

// WebSocket Events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Completions
  COMPLETION_REQUEST: 'completion:request',
  COMPLETION_RESULT: 'completion:result',

  // Review
  REVIEW_START: 'review:start',
  REVIEW_PROGRESS: 'review:progress',
  REVIEW_COMPLETE: 'review:complete',
  REVIEW_FILE: 'review:file',
  REVIEW_FILE_RESULT: 'review:file:result',

  // Execution
  EXECUTE_REQUEST: 'execute:request',
  EXECUTE_STARTED: 'execute:started',
  EXECUTE_TOKEN: 'execute:token',
  EXECUTE_COMPLETE: 'execute:complete',
  EXECUTE_ERROR: 'execute:error',
  EXECUTE_INPUT: 'execute:input',

  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_TOKEN: 'chat:token',
  CHAT_COMPLETE: 'chat:complete',
  CHAT_STOP: 'chat:stop',
  CHAT_ERROR: 'chat:error',
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  'html', 'css', 'scss', 'less', 'javascript', 'typescript',
  'javascriptreact', 'typescriptreact', 'vue', 'svelte',
  'json', 'markdown', 'yaml', 'xml', 'svg', 'java', 'python'
] as const;

// File Extension to Language Mapping
export const EXTENSION_MAP: Record<string, string> = {
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'javascriptreact',
  '.ts': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.tsx': 'typescriptreact',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.json': 'json',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.svg': 'svg',
  '.java': 'java',
  '.py': 'python',
  '.env': 'plaintext',
  '.gitignore': 'plaintext',
  '.prettierrc': 'json',
  '.eslintrc': 'json',
};

// Frontend-relevant file extensions (for GitHub import filtering)
export const FRONTEND_EXTENSIONS = new Set([
  '.html', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx',
  '.vue', '.svelte', '.json', '.md', '.yaml', '.yml', '.svg',
  '.env.example',
]);

// Config file patterns (always include)
export const CONFIG_FILE_PATTERNS = [
  'package.json', 'tsconfig.json', 'tsconfig.*.json',
  'vite.config.ts', 'vite.config.js',
  'next.config.js', 'next.config.mjs', 'next.config.ts',
  'tailwind.config.ts', 'tailwind.config.js',
  'postcss.config.js', 'postcss.config.cjs',
  '.eslintrc.js', '.eslintrc.json', '.eslintrc.cjs',
  '.prettierrc', '.prettierrc.json', '.prettierrc.js',
  'svelte.config.js', 'svelte.config.ts',
  'vue.config.js',
];

// Directories to exclude on GitHub import
export const EXCLUDED_DIRECTORIES = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '.next', '.nuxt', '.svelte-kit', '.output',
  '.cache', '.turbo', '.vercel',
]);

// Severity levels in order
export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// GLM defaults
export const GLM_DEFAULTS = {
  MODEL: 'glm-5',
  BASE_URL: 'https://open.bigmodel.cn/api/paas/v4/',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 8192,
  TOP_P: 0.95,
  MAX_CONCURRENT_REQUESTS: 10,
  TIMEOUT_MS: 120000,
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000],
} as const;

// Cache TTLs (seconds)
export const CACHE_TTL = {
  ANALYSIS: 3600,
  COMPLETION: 300,
  GITHUB_TREE: 600,
} as const;
