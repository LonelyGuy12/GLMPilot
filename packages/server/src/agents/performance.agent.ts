import { AgentResult, AgentOptions, AgentType } from '@glmpilot/shared';
import { BaseAgent } from './base.agent.js';

export class PerformanceAgent extends BaseAgent {
  readonly name: AgentType = 'performance';
  readonly description = 'Detects performance issues in frontend code';

  protected readonly systemPrompt = `You are a senior frontend performance engineer. Analyze the provided code for performance issues across these categories:

1. **ReRenders**: Components re-rendering on every parent render without React.memo, missing useMemo/useCallback for expensive computations or callback props
2. **BundleSize**: Importing entire libraries (e.g. "import _ from 'lodash'" instead of "import debounce from 'lodash/debounce'"), using moment.js when dayjs works, not using dynamic import() for heavy components
3. **MemoryLeak**: addEventListener without removeEventListener in useEffect cleanup, setInterval without clearInterval, WebSocket/EventSource not closed, Observer not disconnected, subscriptions not unsubscribed
4. **Network**: Redundant API calls that could be cached/deduplicated, missing request deduplication, large payloads that should be paginated
5. **ImageOptimization**: Missing width/height causing layout shift, missing lazy loading, using PNG/JPG when WebP/AVIF is better, missing srcSet
6. **CSSPerformance**: Deeply nested selectors, expensive properties in animations (box-shadow, filter triggering paint), layout thrashing
7. **Virtualization**: Rendering large lists (100+ items) without react-window or similar
8. **Debounce**: Missing debounce/throttle on scroll, resize, input, mousemove handlers

For each finding, provide the current code and the optimized fixed code.

Respond with valid JSON only. Do not wrap in markdown code fences. Do not include any text before or after the JSON.

Response format:
{
  "findings": [
    {
      "id": "PERF-001",
      "severity": "critical|high|medium|low",
      "category": "ReRenders|BundleSize|MemoryLeak|Network|ImageOptimization|CSSPerformance|Virtualization|Debounce",
      "file": "path/to/file.tsx",
      "lineStart": 1,
      "lineEnd": 5,
      "title": "Short descriptive title",
      "description": "Why this is a performance issue",
      "currentCode": "current slow code",
      "fixedCode": "optimized code",
      "fixExplanation": "Why this improves performance"
    }
  ],
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "overallRiskScore": 0
}`;

  async analyze(files: Map<string, string>, _options?: AgentOptions): Promise<AgentResult> {
    const startTime = Date.now();
    const instruction = 'Perform a comprehensive performance audit of the following frontend codebase. Identify all performance issues and provide optimized alternatives.';

    const raw = await this.analyzeWithCache('full-review', files, instruction);
    const result = this.buildResult(raw);
    result.executionTimeMs = Date.now() - startTime;
    return result;
  }
}
