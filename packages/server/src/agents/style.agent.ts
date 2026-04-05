import { AgentResult, AgentOptions, AgentType } from '@glmpilot/shared';
import { BaseAgent } from './base.agent.js';

export class StyleAgent extends BaseAgent {
  readonly name: AgentType = 'style';
  readonly description = 'Reviews code style, accessibility, and best practices';

  protected readonly systemPrompt = `You are a senior frontend architect and code quality reviewer. Analyze the provided code for style, architecture, and accessibility issues across these categories:

1. **Naming**: Inconsistent naming (camelCase vs snake_case mixed), non-descriptive variable names, boolean variables not prefixed with is/has/should
2. **Architecture**: Components exceeding 300 lines that should be split, components with too many responsibilities, prop drilling more than 3 levels deep
3. **Accessibility**: Missing aria-label/aria-labelledby on interactive elements, images without alt text, missing keyboard event handlers alongside mouse handlers, non-semantic HTML (div used as button), missing focus management in modals, color contrast concerns, missing skip-to-content link, form inputs without labels
4. **Duplication**: Similar code blocks that should be extracted into shared utilities or custom hooks
5. **ModernJS**: var usage, missing optional chaining ?., missing nullish coalescing ??, unnecessary type assertions, use of any type, missing return types
6. **ReactBestPractices**: Missing key prop in lists, state that should be derived, effects that should be event handlers, stale closures in effects, unnecessary state for computed values
7. **FileOrganization**: Related files scattered across unrelated directories, problematic barrel exports
8. **Consistency**: Mixed default/named exports, inconsistent file naming, mixed CSS approaches

Respond with valid JSON only. Do not wrap in markdown code fences. Do not include any text before or after the JSON.

Response format:
{
  "findings": [
    {
      "id": "STYLE-001",
      "severity": "critical|high|medium|low",
      "category": "Naming|Architecture|Accessibility|Duplication|ModernJS|ReactBestPractices|FileOrganization|Consistency",
      "file": "path/to/file.tsx",
      "lineStart": 1,
      "lineEnd": 5,
      "title": "Short descriptive title",
      "description": "Description of the issue",
      "currentCode": "current code",
      "fixedCode": "improved code",
      "fixExplanation": "Why this is better"
    }
  ],
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "overallRiskScore": 0
}`;

  async analyze(files: Map<string, string>, _options?: AgentOptions): Promise<AgentResult> {
    const startTime = Date.now();
    const instruction = 'Review the following frontend codebase for code style, architecture patterns, accessibility, and best practices. Provide actionable improvements.';

    const raw = await this.analyzeWithCache('full-review', files, instruction);
    const result = this.buildResult(raw);
    result.executionTimeMs = Date.now() - startTime;
    return result;
  }
}
