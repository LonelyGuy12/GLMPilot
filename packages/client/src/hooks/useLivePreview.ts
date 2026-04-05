import { useMemo } from 'react';
import { useFileStore } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';

export function useLivePreview() {
  const baseFiles = useFileStore((s) => s.files);
  const openFiles = useEditorStore((s) => s.openFiles);

  // Merge: start with file store, then overlay any open editor buffers
  const files = useMemo(() => {
    const merged = { ...baseFiles };
    for (const [path, file] of Object.entries(openFiles)) {
      merged[path] = typeof file === 'string' ? file : file.content;
    }
    return merged;
  }, [baseFiles, openFiles]);

  const srcdoc = useMemo(() => {
    const htmlFile = files['index.html'] || Object.entries(files).find(([k]) => k.endsWith('.html'))?.[1];
    if (!htmlFile) return '<html><body style="background:#0a0a0f;color:#888;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>No HTML file found. Create an index.html to see a preview.</p></body></html>';

    let html = htmlFile;

    // Inline CSS
    const cssLinkRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
    html = html.replace(cssLinkRegex, (_match, href) => {
      const cssContent = files[href];
      return cssContent ? `<style>${cssContent}</style>` : '';
    });

    // Inline JS
    const scriptRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi;
    html = html.replace(scriptRegex, (_match, src) => {
      const jsContent = files[src];
      return jsContent ? `<script>${jsContent}<\/script>` : '';
    });

    // Add console bridge
    const consoleBridge = `<script>
      const _origConsole = { log: console.log, warn: console.warn, error: console.error };
      ['log', 'warn', 'error'].forEach(method => {
        console[method] = function(...args) {
          _origConsole[method].apply(console, args);
          try {
            window.parent.postMessage({ type: 'console', method, args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)) }, '*');
          } catch(e) {}
        };
      });
      window.onerror = function(msg, src, line, col, err) {
        window.parent.postMessage({ type: 'console', method: 'error', args: [msg + ' (line ' + line + ')'] }, '*');
      };
    <\/script>`;

    html = html.replace('</head>', `${consoleBridge}</head>`);

    return html;
  }, [files]);

  return { srcdoc };
}
