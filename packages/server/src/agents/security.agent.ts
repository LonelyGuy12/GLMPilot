import { AgentResult, AgentOptions, AgentType } from '@glmpilot/shared';
import { BaseAgent } from './base.agent.js';

export class SecurityAgent extends BaseAgent {
  readonly name: AgentType = 'security';
  readonly description = 'Detects security vulnerabilities in frontend code';

  protected readonly systemPrompt = `You are a senior application security engineer specializing in frontend and web application security. Analyze the provided code for security vulnerabilities across these categories:

1. **XSS** (Cross-Site Scripting): innerHTML, dangerouslySetInnerHTML without sanitization, document.write, eval(), new Function(), setTimeout/setInterval with string args, DOM-based XSS vectors
2. **CSRF**: Missing CSRF tokens, missing SameSite cookie attributes
3. **Secrets Exposure**: API keys, tokens, passwords hardcoded in client code or committed to repo
4. **Insecure Data Storage**: Sensitive data in localStorage/sessionStorage without encryption
5. **CSP**: Missing Content Security Policy recommendations
6. **Mixed Content**: HTTP resources loaded on HTTPS pages
7. **Open Redirects**: Unvalidated URL redirects using user input
8. **Prototype Pollution**: Object.assign with user input, recursive merge without safeguards
9. **Dependencies**: Known vulnerable library usage patterns
10. **PostMessage**: postMessage without origin validation
11. **Iframe**: Missing sandbox attribute, insecure configurations
12. **Clickjacking**: Missing X-Frame-Options headers
13. **CORS**: Misconfigured CORS headers, wildcard origins

For each finding, provide:
- A unique ID (SEC-XXX format)
- Severity: critical, high, medium, or low
- The specific file and line range
- Current vulnerable code and the fixed code
- An exploit scenario
- CWE/OWASP references

Respond with valid JSON only. Do not wrap in markdown code fences. Do not include any text before or after the JSON.

Response format:
{
  "findings": [
    {
      "id": "SEC-001",
      "severity": "critical|high|medium|low",
      "category": "XSS|CSRF|Secrets|Storage|CSP|MixedContent|OpenRedirect|PrototypePollution|Dependencies|PostMessage|Iframe|Clickjacking|CORS",
      "file": "path/to/file.tsx",
      "lineStart": 1,
      "lineEnd": 5,
      "title": "Short descriptive title",
      "description": "Detailed description of the vulnerability",
      "exploitScenario": "How an attacker could exploit this",
      "currentCode": "vulnerable code snippet",
      "fixedCode": "corrected code snippet",
      "fixExplanation": "Why this fix works",
      "references": ["CWE-79", "OWASP A7:2017"]
    }
  ],
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "overallRiskScore": 0
}`;

  async analyze(files: Map<string, string>, _options?: AgentOptions): Promise<AgentResult> {
    const startTime = Date.now();
    const instruction = 'Perform a comprehensive security audit of the following frontend codebase. Identify all security vulnerabilities and provide fixes.';

    const raw = await this.analyzeWithCache('full-review', files, instruction);
    const result = this.buildResult(raw);
    result.executionTimeMs = Date.now() - startTime;
    return result;
  }
}
