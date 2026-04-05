import { useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useEditorStore } from '@/stores/editorStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCodeCompletion } from '@/hooks/useCodeCompletion';

interface CodeEditorProps {
  filePath: string;
  language: string;
}

export default function CodeEditor({ filePath, language }: CodeEditorProps) {
  const content = useEditorStore((s) => s.openFiles[filePath]?.content || '');
  const updateContent = useEditorStore((s) => s.updateContent);
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const tabSize = useSettingsStore((s) => s.tabSize);
  const wordWrap = useSettingsStore((s) => s.wordWrap);
  const minimap = useSettingsStore((s) => s.minimap);
  const { requestCompletion, dismissCompletion } = useCodeCompletion();
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme
    monaco.editor.defineTheme('glmpilot-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c792ea' },
        { token: 'string', foreground: 'c3e88d' },
        { token: 'number', foreground: 'f78c6c' },
        { token: 'type', foreground: 'ffcb6b' },
        { token: 'function', foreground: '82aaff' },
      ],
      colors: {
        'editor.background': '#080810',
        'editor.foreground': '#e8e8e8',
        'editorLineNumber.foreground': '#4a4a5a',
        'editor.selectionBackground': '#81f08433',
        'editorCursor.foreground': '#81f084',
        'editor.lineHighlightBackground': '#0f0f1a',
        'editorIndentGuide.background': '#1a1a2a',
        'editorWidget.background': '#121220',
        'editorSuggestWidget.background': '#121220',
        'editorSuggestWidget.border': '#2a2a3a',
        'scrollbarSlider.background': '#2a2a3a80',
        'scrollbarSlider.hoverBackground': '#3a3a4a80',
      },
    });
    monaco.editor.setTheme('glmpilot-dark');

    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition(filePath, {
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Trigger completion on cursor position change
    editor.onDidChangeCursorPosition((e: any) => {
      const model = editor.getModel();
      if (!model) return;
      const position = e.position;
      const textBefore = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const textAfter = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: model.getLineCount(),
        endColumn: model.getLineMaxColumn(model.getLineCount()),
      });
      requestCompletion(filePath, textBefore, textAfter, language);
    });

    editor.focus();
  };

  const handleChange: OnChange = (value) => {
    if (value !== undefined) {
      updateContent(filePath, value);
      dismissCompletion();
    }
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={content}
      onChange={handleChange}
      onMount={handleMount}
      theme="glmpilot-dark"
      options={{
        fontSize,
        tabSize,
        wordWrap: wordWrap ? 'on' : 'off',
        minimap: { enabled: minimap, renderCharacters: false },
        formatOnPaste: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: { other: true, strings: true, comments: false },
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        renderWhitespace: 'selection',
        lineNumbers: 'on',
        folding: true,
        links: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoIndent: 'advanced',
        padding: { top: 12 },
      }}
    />
  );
}
