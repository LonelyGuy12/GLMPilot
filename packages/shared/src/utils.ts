import { EXTENSION_MAP, EXCLUDED_DIRECTORIES, FRONTEND_EXTENSIONS } from './constants.js';

/**
 * Estimate token count from text (~4 chars per token heuristic).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Get language ID from file extension.
 */
export function getLanguageFromPath(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  return EXTENSION_MAP[ext] || 'plaintext';
}

/**
 * Get file extension from path.
 */
export function getFileExtension(filePath: string): string {
  const dotIndex = filePath.lastIndexOf('.');
  return dotIndex >= 0 ? filePath.slice(dotIndex) : '';
}

/**
 * Get file name from path.
 */
export function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

/**
 * Check if a file path is frontend-relevant.
 */
export function isFrontendFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return FRONTEND_EXTENSIONS.has(ext);
}

/**
 * Check if a directory should be excluded.
 */
export function isExcludedDirectory(dirName: string): boolean {
  return EXCLUDED_DIRECTORIES.has(dirName);
}

/**
 * Check if a file is likely binary.
 */
export function isBinaryFile(filePath: string): boolean {
  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.avif',
    '.mp4', '.webm', '.mov', '.avi',
    '.mp3', '.wav', '.ogg', '.flac',
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.exe', '.dll', '.so', '.dylib',
  ]);
  return binaryExtensions.has(getFileExtension(filePath).toLowerCase());
}

/**
 * Truncate text to a maximum number of lines.
 */
export function truncateLines(text: string, maxLines: number): string {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return text;
  return lines.slice(0, maxLines).join('\n') + '\n// ... [truncated]';
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
