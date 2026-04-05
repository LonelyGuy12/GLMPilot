import { EventEmitter } from 'events';
import {
  AgentType, AgentResult, AgentProgressEvent, Finding, FullReviewResult,
  QuickReviewResult, PRFixSet, FileChange, AgentOptions,
  SEVERITY_ORDER, estimateTokens, ALL_AGENTS,
} from '@glmpilot/shared';
import { SecurityAgent } from './security.agent.js';
import { PerformanceAgent } from './performance.agent.js';
import { StyleAgent } from './style.agent.js';
import { DocumentationAgent } from './documentation.agent.js';
import { BaseAgent } from './base.agent.js';
import { glm } from '../services/glm-client.js';
import { logger } from '../utils/logger.js';

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<AgentType, BaseAgent>;

  constructor() {
    super();
    this.agents = new Map<AgentType, BaseAgent>([
      ['security', new SecurityAgent()],
      ['performance', new PerformanceAgent()],
      ['style', new StyleAgent()],
      ['documentation', new DocumentationAgent()],
    ]);
  }

  async reviewCodebase(
    files: Map<string, string>,
    options?: { agents?: AgentType[]; mode?: 'full' | 'quick' }
  ): Promise<FullReviewResult> {
    const startTime = Date.now();
    const selectedAgents = options?.agents || (ALL_AGENTS as unknown as AgentType[]);
    const totalFiles = files.size;

    // Chunk files if too large
    const batches = this.chunkFiles(files);
    const allResults: Map<AgentType, AgentResult[]> = new Map();

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      // Run all selected agents in parallel per batch
      const promises = selectedAgents.map(async (agentType) => {
        const agent = this.agents.get(agentType);
        if (!agent) return null;

        this.emitProgress(agentType, 'started', 0, totalFiles, batchIndex, batches.length);

        try {
          this.emitProgress(agentType, 'analyzing', batch.size, totalFiles, batchIndex, batches.length);
          const agentOptions: AgentOptions = options?.mode === 'quick' ? { quickMode: true, maxTokens: 4096 } : {};
          const result = await agent.analyze(batch, agentOptions);
          this.emitProgress(agentType, 'complete', batch.size, totalFiles, batchIndex, batches.length);
          return { agentType, result };
        } catch (error) {
          logger.error(`Agent ${agentType} failed`, { error: (error as Error).message });
          this.emitProgress(agentType, 'error', 0, totalFiles, batchIndex, batches.length);
          return {
            agentType,
            result: {
              agent: agentType,
              findings: [],
              summary: { critical: 0, high: 0, medium: 0, low: 0 },
              overallRiskScore: 0,
              executionTimeMs: 0,
              error: (error as Error).message,
            } as AgentResult,
          };
        }
      });

      const results = await Promise.allSettled(promises);
      for (const settled of results) {
        if (settled.status === 'fulfilled' && settled.value) {
          const { agentType, result } = settled.value;
          if (!allResults.has(agentType)) allResults.set(agentType, []);
          allResults.get(agentType)!.push(result);
        }
      }
    }

    // Merge results across batches
    const agentResults: Record<string, AgentResult> = {} as Record<AgentType, AgentResult>;
    const overallScores: Record<string, number> = {} as Record<AgentType, number>;
    let mergedFindings: Finding[] = [];
    let totalTokens = 0;

    for (const [agentType, batchResults] of allResults) {
      const merged = this.mergeAgentResults(agentType, batchResults);
      agentResults[agentType] = merged;
      overallScores[agentType] = merged.overallRiskScore;
      mergedFindings.push(...merged.findings);
      totalTokens += merged.tokensUsed || 0;
    }

    // Deduplicate findings
    mergedFindings = this.deduplicateFindings(mergedFindings);

    // Sort by severity
    mergedFindings.sort((a, b) => (SEVERITY_ORDER[a.severity] || 99) - (SEVERITY_ORDER[b.severity] || 99));

    // Calculate aggregate score
    const scores = Object.values(overallScores);
    overallScores['aggregate'] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      agentResults: agentResults as Record<AgentType, AgentResult>,
      mergedFindings,
      overallScores: overallScores as Record<AgentType, number> & { aggregate: number },
      metadata: {
        totalFiles,
        totalTokensUsed: totalTokens,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async reviewSingleFile(filePath: string, content: string): Promise<QuickReviewResult> {
    const files = new Map([[filePath, content]]);
    const agents: AgentType[] = ['security', 'performance', 'style'];

    const results = await Promise.allSettled(
      agents.map(async (agentType) => {
        const agent = this.agents.get(agentType);
        if (!agent) return null;
        return agent.analyze(files, { quickMode: true, maxTokens: 4096 });
      })
    );

    let allFindings: Finding[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allFindings.push(...result.value.findings);
      }
    }

    allFindings.sort((a, b) => (SEVERITY_ORDER[a.severity] || 99) - (SEVERITY_ORDER[b.severity] || 99));

    return {
      findings: allFindings,
      summary: {
        critical: allFindings.filter(f => f.severity === 'critical').length,
        high: allFindings.filter(f => f.severity === 'high').length,
        medium: allFindings.filter(f => f.severity === 'medium').length,
        low: allFindings.filter(f => f.severity === 'low').length,
      },
      filePath,
    };
  }

  async generatePRFixes(findings: Finding[]): Promise<PRFixSet> {
    const topFindings = findings
      .sort((a, b) => (SEVERITY_ORDER[a.severity] || 99) - (SEVERITY_ORDER[b.severity] || 99))
      .slice(0, 20);

    const prompt = `You are a code fixing assistant. Given these code review findings with their current code and suggested fixes, generate a unified set of file changes.

Findings:
${JSON.stringify(topFindings, null, 2)}

Respond with valid JSON:
{
  "fileChanges": [{ "path": "file.tsx", "originalContent": "...", "fixedContent": "..." }],
  "commitMessage": "fix: ...",
  "prTitle": "...",
  "prBody": "..."
}`;

    const response = await glm.chat(
      [{ role: 'system', content: 'You are a precise code fixing assistant.' }, { role: 'user', content: prompt }],
      { temperature: 0.2 }
    );

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');

    return {
      branchName: `glmpilot/fix-${Date.now()}`,
      commitMessage: parsed.commitMessage || 'fix: apply code review fixes',
      prTitle: parsed.prTitle || 'GLMPilot: Code Review Fixes',
      prBody: parsed.prBody || 'Automated fixes from GLMPilot code review.',
      fileChanges: parsed.fileChanges || [],
    };
  }

  private chunkFiles(files: Map<string, string>): Map<string, string>[] {
    const concatenated = Array.from(files.values()).join('');
    const totalTokens = estimateTokens(concatenated);

    if (totalTokens <= 30000) return [files];

    // Group by directory
    const groups = new Map<string, Map<string, string>>();
    for (const [path, content] of files) {
      const dir = path.split('/').slice(0, -1).join('/') || '/';
      if (!groups.has(dir)) groups.set(dir, new Map());
      groups.get(dir)!.set(path, content);
    }

    // Merge small groups into batches under 30k tokens
    const batches: Map<string, string>[] = [];
    let currentBatch = new Map<string, string>();
    let currentTokens = 0;

    for (const [, groupFiles] of groups) {
      const groupContent = Array.from(groupFiles.values()).join('');
      const groupTokens = estimateTokens(groupContent);

      if (currentTokens + groupTokens > 30000 && currentBatch.size > 0) {
        batches.push(currentBatch);
        currentBatch = new Map();
        currentTokens = 0;
      }

      for (const [path, content] of groupFiles) {
        currentBatch.set(path, content);
      }
      currentTokens += groupTokens;
    }

    if (currentBatch.size > 0) batches.push(currentBatch);
    return batches;
  }

  private mergeAgentResults(agentType: AgentType, results: AgentResult[]): AgentResult {
    const findings: Finding[] = [];
    let totalTime = 0;
    let totalTokens = 0;

    for (const r of results) {
      findings.push(...r.findings);
      totalTime += r.executionTimeMs;
      totalTokens += r.tokensUsed || 0;
    }

    const summary = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
    };

    const riskScores = results.map(r => r.overallRiskScore).filter(s => s > 0);
    const avgRisk = riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : 0;

    return { agent: agentType, findings, summary, overallRiskScore: avgRisk, executionTimeMs: totalTime, tokensUsed: totalTokens };
  }

  private deduplicateFindings(findings: Finding[]): Finding[] {
    const seen = new Set<string>();
    return findings.filter((f) => {
      const key = `${f.file}:${f.lineStart}-${f.lineEnd}:${f.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private emitProgress(agent: string, status: AgentProgressEvent['status'], filesProcessed: number, totalFiles: number, batchIndex: number, totalBatches: number) {
    const event: AgentProgressEvent = { agent, status, filesProcessed, totalFiles, batchIndex, totalBatches };
    this.emit('progress', event);
  }
}

export const orchestrator = new AgentOrchestrator();
