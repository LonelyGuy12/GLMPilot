import { useCallback, useRef } from 'react';
import { useAIStore } from '@/stores/aiStore';
import { useEditorStore } from '@/stores/editorStore';
import { useFileStore } from '@/stores/fileStore';
import { useEnvStore } from '@/stores/envStore';
import { parseMarkdown, MarkdownSegment } from '@/utils/markdownParser';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const getSystemPrompt = (envType: string | null) => {
  const lang = envType === 'python' ? 'Python 3' : envType === 'java' ? 'Java (JDK 17)' : 'HTML, CSS, JavaScript, TypeScript, React, and web technologies';
  return `You are GLMPilot AI, an expert development assistant. You help with ${lang}.
CRITICAL INSTRUCTION: When you provide code that should be applied to a file, you MUST start the code block with a markdown bolded filename, followed immediately by the fenced code block. Example:
**\`src/App.tsx\`**
\`\`\`tsx
export default function App() { ... }
\`\`\`
Do not omit the bolded filename. Provide exact, complete code drop-ins when requested to fix or change code.`;
};

export function useGLMChat() {
  const { addMessage, updateStreamingMessage, finishStreaming, setIsStreaming, isStreaming } =
    useAIStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string, history: Array<{ role: string; content: string }> = []) => {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
      });

      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Build the dynamic workspace context from the stores
        const editorStore = useEditorStore.getState();
        const fileStore = useFileStore.getState();
        const envStore = useEnvStore.getState();
        
        // Merge the base files with the unsaved editor changes
        const currentFiles = { ...fileStore.files };
        for (const [path, file] of Object.entries(editorStore.openFiles)) {
          currentFiles[path] = typeof file === 'string' ? file : file.content;
        }

        let dynamicSystemPrompt = getSystemPrompt(envStore.environment) + '\n\n--- CURRENT WORKSPACE FILES ---\n';
        for (const [path, content] of Object.entries(currentFiles)) {
          // Guess language for markdown
          const ext = path.split('.').pop() || 'text';
          const langMap: Record<string, string> = { js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx', html: 'html', css: 'css' };
          const lang = langMap[ext] || ext;
          
          dynamicSystemPrompt += `**\`${path}\`**\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
        }

        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: dynamicSystemPrompt },
              ...history,
              { role: 'user', content: message },
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 4096,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`GLM API error ${response.status}: ${errText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                fullContent += token;
                updateStreamingMessage(token);
              }
            } catch {
              /* skip malformed chunks */
            }
          }
        }

        // Lovable-style Auto-Apply logic:
        // Parse the full completion string for markdown code blocks + filenames
        const segments = parseMarkdown(fullContent);
        
        for (const segment of segments) {
          if (segment.type === 'code' && segment.filename && segment.code) {
            const filename = segment.filename;
            const code = segment.code;
            
            // Apply it! 
            if (editorStore.openFiles[filename]) {
              editorStore.updateContent(filename, code);
            } else if (fileStore.files[filename] !== undefined) {
              fileStore.updateFile(filename, code);
            } else {
              fileStore.createFile(filename, code);
            }
          }
        }

        finishStreaming(fullContent);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          const msg = (error as Error).message || 'Unknown error';
          finishStreaming(
            `Sorry, something went wrong.\n\n${msg.length > 400 ? `${msg.slice(0, 400)}…` : msg}`
          );
          console.error('[useGLMChat]', error);
        } else {
          // User stopped — commit whatever was streamed so far
          const partial = useAIStore.getState().streamingMessage;
          if (partial) finishStreaming(partial);
        }
      } finally {
        abortRef.current = null;
      }
    },
    [addMessage, updateStreamingMessage, finishStreaming, setIsStreaming]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, [setIsStreaming]);

  return { sendMessage, stopGeneration, isStreaming };
}
