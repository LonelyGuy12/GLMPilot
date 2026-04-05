// Client-specific types
export interface TabInfo {
  path: string;
  label: string;
  isDirty: boolean;
  language: string;
}

export interface LayoutConfig {
  sidebarWidth: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  bottomPanelCollapsed: boolean;
}

export interface ConsoleEntry {
  method: 'log' | 'warn' | 'error';
  args: string[];
  timestamp: number;
}

export type ViewMode = 'editor' | 'split' | 'preview';
