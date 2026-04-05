import { AgentResult, AgentOptions, AgentType, DocMode } from '@glmpilot/shared';
import { BaseAgent } from './base.agent.js';
import { parseJSONSafe } from '../utils/code-parser.js';

export class DocumentationAgent extends BaseAgent {
  readonly name: AgentType = 'documentation';
  readonly description = 'Analyzes documentation gaps and generates documentation';

  protected readonly systemPrompt = `You are a technical documentation expert specializing in frontend projects. You have two modes:

MODE A — Gap Analysis: Review code for missing documentation:
- Functions without JSDoc comments
- Components without prop type descriptions
- Complex algorithms without explanatory comments
- Missing README, CHANGELOG, CONTRIBUTING guide

MODE B — Generation: Generate complete documentation:
- README.md: project overview, features, tech stack, setup, folder structure, scripts, contributing
- Component API docs: description, props table (name/type/default/required/description), usage example
- Architecture overview: folder structure, data flow, state management, routing, API integration
- Setup guide: prerequisites, installation, env vars, dev workflow, build/deploy

Respond with valid JSON only. Do not wrap in markdown code fences. Do not include any text before or after the JSON.`;

  private readonly gapPrompt = `Analyze the following codebase for documentation gaps. Find all undocumented functions, components, and missing project-level docs.

Response format:
{
  "findings": [
    {
      "id": "DOC-001",
      "severity": "medium",
      "category": "MissingDocs",
      "file": "path/to/file.tsx",
      "lineStart": 1,
      "lineEnd": 5,
      "title": "Missing JSDoc for function",
      "description": "Description of what documentation is missing",
      "currentCode": "undocumented code",
      "fixedCode": "code with documentation added",
      "fixExplanation": "What the docs should explain"
    }
  ],
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "overallRiskScore": 0
}`;

  private readonly generatePrompt = `Generate comprehensive documentation for this codebase. Output a JSON object where keys are suggested file paths and values are the markdown content.

Response format:
{
  "docs": {
    "README.md": "# Project Name\\n...",
    "docs/ARCHITECTURE.md": "# Architecture\\n...",
    "docs/COMPONENTS.md": "# Component API\\n...",
    "docs/SETUP.md": "# Setup Guide\\n..."
  }
}`;

  async analyze(files: Map<string, string>, options?: AgentOptions): Promise<AgentResult> {
    const startTime = Date.now();
    const mode: DocMode = options?.mode || 'both';

    if (mode === 'generate') {
      return this.generateDocs(files, startTime);
    }

    if (mode === 'gaps') {
      return this.analyzeGaps(files, startTime);
    }

    // Both modes
    const [gapResult, genResult] = await Promise.all([
      this.analyzeGaps(files, startTime),
      this.generateDocs(files, startTime),
    ]);

    return {
      ...gapResult,
      findings: gapResult.findings,
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async analyzeGaps(files: Map<string, string>, startTime: number): Promise<AgentResult> {
    const raw = await this.analyzeWithCache('gap-analysis', files, this.gapPrompt);
    const result = this.buildResult(raw);
    result.executionTimeMs = Date.now() - startTime;
    return result;
  }

  private async generateDocs(files: Map<string, string>, startTime: number): Promise<AgentResult> {
    const fileContext = this.buildFileContext(files);
    const raw = await this.glm.analyzeCode(fileContext, this.generatePrompt, this.systemPrompt);

    const parsed = parseJSONSafe<{ docs?: Record<string, string> }>(raw, { docs: {} });

    return {
      agent: 'documentation',
      findings: [],
      summary: { critical: 0, high: 0, medium: 0, low: 0 },
      overallRiskScore: 0,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
