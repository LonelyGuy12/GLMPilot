import { create } from 'zustand';
import type { UserSettings } from '@glmpilot/shared';

interface SettingsState extends UserSettings {
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  autoSave: true,
  aiCompletions: true,
  keybindings: 'default',
  wordWrap: true,
  minimap: true,
};

export const useSettingsStore = create<SettingsState>((set) => {
  // Load from localStorage
  let initial = defaultSettings;
  try {
    const saved = localStorage.getItem('ff-settings');
    if (saved) initial = { ...defaultSettings, ...JSON.parse(saved) };
  } catch { /* use defaults */ }

  return {
    ...initial,
    updateSetting: (key, value) =>
      set((state) => {
        const updated = { ...state, [key]: value };
        try {
          const { updateSetting, ...settings } = updated;
          localStorage.setItem('ff-settings', JSON.stringify(settings));
        } catch { /* ignore */ }
        return { [key]: value };
      }),
  };
});
