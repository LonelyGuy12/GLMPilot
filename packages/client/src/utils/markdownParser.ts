export interface MarkdownSegment {
  type: 'text' | 'code';
  content?: string;
  filename?: string | null;
  language?: string;
  code?: string;
}

export function parseMarkdown(content: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  const lines = content.split('\n');
  
  let currentText = '';
  let inCodeBlock = false;
  let codeContent = '';
  let filename: string | null = null;
  let language = '';
  let nestingLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isBackticks = trimmed.startsWith('```');

    if (isBackticks) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        language = trimmed.replace(/^`+/, '').trim();
        nestingLevel = 0;
        
        // Peek at previous text for filename e.g. **`file.ts`**
        const prevTextLines = currentText.trimEnd().split('\n');
        const lastPrevLine = prevTextLines[prevTextLines.length - 1] || '';
        const fileMatch = lastPrevLine.match(/\*\*\`?([^\`\n]+)\`?\*\*/);
        
        if (fileMatch) {
          filename = fileMatch[1];
          prevTextLines.pop();
          currentText = prevTextLines.join('\n');
        } else {
          filename = null;
        }

        if (currentText.trim()) {
          segments.push({ type: 'text', content: currentText.trim() });
        }
        currentText = '';
        codeContent = '';
      } else {
        // Distinguish between inner open (```bash) and close (```)
        const isInnerOpen = trimmed.length > 3 && trimmed !== '```';
        const isClose = /^`+$/.test(trimmed);

        if (isInnerOpen) {
          nestingLevel++;
          codeContent += line + '\n';
        } else if (isClose) {
          if (nestingLevel > 0) {
            nestingLevel--;
            codeContent += line + '\n';
          } else {
            inCodeBlock = false;
            segments.push({ type: 'code', filename, language, code: codeContent.trim() });
            codeContent = '';
            filename = null;
          }
        } else {
          codeContent += line + '\n';
        }
      }
    } else {
      if (inCodeBlock) {
        codeContent += line + '\n';
      } else {
        currentText += line + '\n';
      }
    }
  }

  if (inCodeBlock && codeContent.trim()) {
    segments.push({ type: 'code', filename, language, code: codeContent.trim() });
  } else if (currentText.trim()) {
    segments.push({ type: 'text', content: currentText.trim() });
  }

  return segments;
}
