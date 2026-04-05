import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { getSocket } from '@/services/socket';
import { WS_EVENTS } from '@glmpilot/shared';
import { useEditorStore } from '@/stores/editorStore';
import { useEnvStore } from '@/stores/envStore';
import 'xterm/css/xterm.css';

export default function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal>();
  const [isExecuting, setIsExecuting] = useState(false);
  const isExecutingRef = useRef(false);

  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openFiles = useEditorStore((s) => s.openFiles);
  const environment = useEnvStore((s) => s.environment);
  /** Buffered line while a program is waiting on stdin (submit on Enter as one message). */
  const pendingStdinLineRef = useRef('');
  /** Server-assigned id for this run (stdin + process map); set by execute:started. */
  const currentRunIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const terminal = new Terminal({
      theme: {
        background: '#080810',
        foreground: '#e8e8e8',
        cursor: '#81f084',
        selectionBackground: '#81f08433',
        black: '#1a1a2a',
        red: '#f07178',
        green: '#81f084',
        yellow: '#ffcb6b',
        blue: '#82aaff',
        magenta: '#c792ea',
        cyan: '#89ddff',
        white: '#e8e8e8',
      },
      fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'bar',
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    terminal.writeln('\x1b[1;32m✦ GLMPilot Terminal\x1b[0m');
    terminal.writeln('\x1b[90mConnected to local environment.\x1b[0m');
    terminal.writeln('');
    terminal.write('\x1b[32m❯\x1b[0m ');

    terminalRef.current = terminal;

    terminal.onData((data) => {
      if (!isExecutingRef.current) return;

      const flushLine = () => {
        const line = pendingStdinLineRef.current;
        pendingStdinLineRef.current = '';
        terminal.write('\r\n');
        const runId = currentRunIdRef.current;
        getSocket().emit(
          WS_EVENTS.EXECUTE_INPUT,
          { runId: runId ?? '', input: line + '\n' },
          (resp: { ok?: boolean } | undefined) => {
            if (resp?.ok === false) {
              terminal.writeln(
                '\r\n\x1b[31m[Input did not reach the program — try Run again after output appears]\x1b[0m'
              );
            }
          }
        );
      };

      const normalized = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      for (const ch of normalized) {
        if (ch === '\n') {
          flushLine();
        } else if (ch === '\x7f' || ch === '\b') {
          if (pendingStdinLineRef.current.length > 0) {
            pendingStdinLineRef.current = pendingStdinLineRef.current.slice(0, -1);
            terminal.write('\b \b');
          }
        } else if (ch === '\t') {
          pendingStdinLineRef.current += '\t';
          terminal.write('\t');
        } else if (ch < ' ' && ch !== '\t') {
          // ignore other C0 controls
        } else {
          pendingStdinLineRef.current += ch;
          terminal.write(ch);
        }
      }
    });

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    isExecutingRef.current = isExecuting;
  }, [isExecuting]);

  useEffect(() => {
    const handleExecute = () => {
      if (!activeFilePath) return;
      const file = openFiles[activeFilePath];
      if (!file || !environment) return;

      console.log('[Terminal] handleExecute called, setting isExecuting=true');
      setIsExecuting(true);
      isExecutingRef.current = true; // Update ref immediately
      pendingStdinLineRef.current = '';
      currentRunIdRef.current = null;
      terminalRef.current?.clear();
      terminalRef.current?.writeln(`\x1b[33mRunning ${file.path}...\x1b[0m\n`);

      // Focus the terminal to capture keyboard input
      terminalRef.current?.focus();

      const socket = getSocket();
      socket.emit(WS_EVENTS.EXECUTE_REQUEST, {
        language: environment,
        content: file.content
      });
    };

    window.addEventListener('glmpilot:execute', handleExecute);
    return () => window.removeEventListener('glmpilot:execute', handleExecute);
  }, [activeFilePath, openFiles, environment]);

  useEffect(() => {
    const socket = getSocket();

    const onStarted = (data: { runId: string }) => {
      currentRunIdRef.current = data.runId;
    };

    const onToken = (data: { token: string; isError?: boolean }) => {
      const color = data.isError ? '\x1b[31m' : '\x1b[0m';
      const text = data.token.replace(/\n/g, '\r\n');
      terminalRef.current?.write(`${color}${text}\x1b[0m`);
    };

    const onComplete = () => {
      console.log('[Terminal] EXECUTE_COMPLETE received, setting isExecuting=false');
      setIsExecuting(false);
      isExecutingRef.current = false; // Update ref immediately
      pendingStdinLineRef.current = '';
      currentRunIdRef.current = null;
      terminalRef.current?.writeln('\n\n\x1b[32m❯ Execution finished.\x1b[0m ');
    };

    const onError = (data: { error: string }) => {
      console.log('[Terminal] EXECUTE_ERROR received:', data.error);
      setIsExecuting(false);
      isExecutingRef.current = false; // Update ref immediately
      pendingStdinLineRef.current = '';
      currentRunIdRef.current = null;
      terminalRef.current?.writeln(`\r\n\x1b[31m[Error] ${data.error}\x1b[0m\r\n`);
      terminalRef.current?.writeln('\x1b[32m❯\x1b[0m ');
    };

    socket.on(WS_EVENTS.EXECUTE_STARTED, onStarted);
    socket.on(WS_EVENTS.EXECUTE_TOKEN, onToken);
    socket.on(WS_EVENTS.EXECUTE_COMPLETE, onComplete);
    socket.on(WS_EVENTS.EXECUTE_ERROR, onError);

    return () => {
      socket.off(WS_EVENTS.EXECUTE_STARTED, onStarted);
      socket.off(WS_EVENTS.EXECUTE_TOKEN, onToken);
      socket.off(WS_EVENTS.EXECUTE_COMPLETE, onComplete);
      socket.off(WS_EVENTS.EXECUTE_ERROR, onError);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
