import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Environment = 'web' | 'java' | 'python' | null;

interface EnvState {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  resetEnvironment: () => void;
}

export const useEnvStore = create<EnvState>()(
  persist(
    (set) => ({
      environment: null,
      setEnvironment: (env) => set({ environment: env }),
      resetEnvironment: () => set({ environment: null }),
    }),
    {
      name: 'env-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
