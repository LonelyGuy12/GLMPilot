import crypto from 'crypto';
import { AgentResult, AgentOptions, Finding, AgentSummary, AgentType, estimateTokens } from '@glmpilot/shared';
import { GLMClient, glm } from '../services/glm-client.js';
import { cache, CacheService } from '../services/cache.service.js';
import { logger } from '../utils/logger.js';
import { parseJSONSafe } from '../utils/code-parser.js';
import { isTestFile, isConfigFile, isSourceFile } from '../utils/file-utils.js';

export abstract class BaseAgent {
  abstract readonly name: AgentType;
  abstract readonly description: string;
  protected abstract readonly systemPrompt: string;

  protected glm: GLMClient = glm;
  protected cache = cache;

  abstract analyze(files: Map<string, string>, options?: AgentOptions): Promise<AgentResult>;

  protected buildFileContext(files: Map<string, string>): string {
    const entries = Array.from(files.entries());
    let totalEstimatedTokens = 0;
    const maxTokens = 28000;

    // Prioritize: source files first, then others, exclude tests/configs last
    const prioritized = entries.sort(([pathA], [pathB]) => {
      const aIsSource = isSourceFile(pathA) ? 0 : 1;
      const bIsSource = isSourceFile(pathB) ? 0 : 1;
      if (aIsSource !== bIsSource) return aIsSource - bIsSource;
      const aIsTest = isTestFile(pathA) ? 1 : 0;
      const bIsTest = isTestFile(pathB) ? 1 : 0;
      return aIsTest - bIsTest;
    });

    const parts: string[] = [];

    for (const [path, content] of prioritized) {
      let fileContent = content;
      const tokenEstimate = estimateTokens(fileContent);

      if (totalEstimatedTokens + tokenEstimate > maxTokens) {
        // Drop test files and config files first
        if (isTestFile(path) || isConfigFile(path)) continue;
        // Truncate large files
        const lines = fileContent.split('\n');
        if (lines.length > 200) {
          fileContent = lines.slice(0, 200).join('\n') + '\n// ... [truncated]';
        }
        const truncatedTokens = estimateTokens(fileContent);
        if (totalEstimatedTokens + truncatedTokens > maxTokens) continue;
        totalEstimatedTokens += truncatedTokens;
      } else {
        totalEstimatedTokens += tokenEstimate;
      }

      parts.push(`=== FILE: ${path} ===\n${fileContent}\n`);
    }

    return parts.join('\n');
  }

  protected parseJSONResponse<T>(raw: string, fallback: T): T {
    return parseJSONSafe(raw, fallback);
  }

  protected async analyzeWithCache(
    cacheKeySuffix: string,
    files: Map<string, string>,
    instruction: string
  ): Promise<string> {
    const concatenated = Array.from(files.values()).join('');
    const key = CacheService.hashKey(this.name, cacheKeySuffix, concatenated);

    return cache.getCachedOrCompute(
      `agent:${key}`,
      () => {
        const fileContext = this.buildFileContext(files);
        return this.glm.analyzeCode(fileContext, instruction, this.systemPrompt);
      },
      3600
    );
  }

  protected buildResult(raw: string): AgentResult {
    const fallback = { findings: [], summary: { critical: 0, high: 0, medium: 0, low: 0 }, overallRiskScore: 0 };
    const parsed = this.parseJSONResponse<{ findings?: Finding[]; summary?: AgentSummary; overallRiskScore?: number }>(raw, fallback);

    const findings: Finding[] = (parsed.findings || []).map((f, i) => ({
      ...f,
      id: f.id || `${this.name.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      agent: this.name,
    }));

    const summary: AgentSummary = parsed.summary || {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
    };

    return {
      agent: this.name,
      findings,
      summary,
      overallRiskScore: parsed.overallRiskScore || 0,
      executionTimeMs: 0,
    };
  }
}
