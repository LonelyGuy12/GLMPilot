import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import StatusBar from './StatusBar';
import PanelLayout from './PanelLayout';
import { useFileStore } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';
import { useEnvStore, Environment } from '@/stores/envStore';

export default function IDEShell() {
  const { env } = useParams<{ env: string }>();
  const navigate = useNavigate();

  const [layout, setLayout] = useState<'editor' | 'split' | 'preview'>('split');
  const initialize = useFileStore((s) => s.initialize);
  const initialized = useFileStore((s) => s.initialized);
  const files = useFileStore((s) => s.files);
  const createFile = useFileStore((s) => s.createFile);
  const deleteFile = useFileStore((s) => s.deleteFile);
  const addFile = useEditorStore((s) => s.addFile);
  const removeFile = useEditorStore((s) => s.removeFile);
  const openFiles = useEditorStore((s) => s.openFiles);
  const environment = useEnvStore((s) => s.environment);
  const setEnvironment = useEnvStore((s) => s.setEnvironment);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (env && !['web', 'java', 'python'].includes(env)) {
      navigate('/ide', { replace: true });
    }
  }, [env, navigate]);

  useEffect(() => {
    if (!initialized || !env || !['web', 'java', 'python'].includes(env)) return;

    const targetEnv = env as Environment;
    
    // If URL environment differs from store, clean up and scaffold
    if (environment !== targetEnv) {
      setEnvironment(targetEnv);
      
      // Cleanup old files
      Object.keys(files).forEach(f => {
        if (f === 'README.md') return;
        const isJava = f.endsWith('.java');
        const isPython = f.endsWith('.py');
        const isWeb = ['.html', '.css', '.js', '.ts', '.tsx', '.jsx'].some(ext => f.endsWith(ext));
        
        if (targetEnv === 'java' && !isJava) { deleteFile(f); removeFile(f); }
        if (targetEnv === 'python' && !isPython) { deleteFile(f); removeFile(f); }
        if (targetEnv === 'web' && !isWeb) { deleteFile(f); removeFile(f); }
      });

      // Scaffold files
      if (targetEnv === 'web') {
        const content = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n  <style>\n    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n  </style>\n</head>\n<body>\n  <h1>Hello Web!</h1>\n</body>\n</html>`;
        if (!files['index.html']) createFile('index.html', content);
      } else if (targetEnv === 'java') {
        const content = `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}`;
        if (!files['Main.java']) createFile('Main.java', content);
      } else if (targetEnv === 'python') {
        const content = `print("Hello, Python!")`;
        if (!files['main.py']) createFile('main.py', content);
      }
    }
  }, [env, environment, initialized]); // Missing files to avoid loop on scaffolding

  useEffect(() => {
    if (initialized && environment === env && !hasAutoOpened) {
      if (Object.keys(openFiles).length === 0) {
        if (environment === 'web' && files['index.html']) addFile('index.html', files['index.html'], 'html');
        else if (environment === 'java' && files['Main.java']) addFile('Main.java', files['Main.java'], 'java');
        else if (environment === 'python' && files['main.py']) addFile('main.py', files['main.py'], 'python');
      }
      setHasAutoOpened(true);
    }
  }, [initialized, environment, env, hasAutoOpened, files, openFiles, addFile]);

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse font-mono text-sm">Initializing workspace...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
        <TopBar layout={layout} onLayoutChange={setLayout} />
        <PanelLayout layout={layout} />
        <StatusBar />
    </div>
  );
}
