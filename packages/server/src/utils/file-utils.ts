import { getLanguageFromPath, isBinaryFile, getFileExtension, getFileName } from '@glmpilot/shared';

export { getLanguageFromPath, isBinaryFile, getFileExtension, getFileName };

/**
 * Calculate approximate file size in KB from content.
 */
export function getFileSizeKB(content: string): number {
  return Math.round((new TextEncoder().encode(content).length) / 1024 * 10) / 10;
}

/**
 * Check if a file is a test file.
 */
export function isTestFile(filePath: string): boolean {
  const name = getFileName(filePath).toLowerCase();
  return (
    name.includes('.test.') ||
    name.includes('.spec.') ||
    name.includes('__tests__') ||
    filePath.includes('/__tests__/') ||
    filePath.includes('/test/') ||
    filePath.includes('/tests/')
  );
}

/**
 * Check if a file is a config file.
 */
export function isConfigFile(filePath: string): boolean {
  const name = getFileName(filePath).toLowerCase();
  const configPatterns = [
    'package.json', 'tsconfig', 'vite.config', 'next.config',
    'tailwind.config', 'postcss.config', '.eslintrc', '.prettierrc',
    'babel.config', 'jest.config', 'vitest.config', 'webpack.config',
  ];
  return configPatterns.some(p => name.includes(p));
}

/**
 * Check if file is source code (JS/TS/JSX/TSX).
 */
export function isSourceFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'].includes(ext);
}
