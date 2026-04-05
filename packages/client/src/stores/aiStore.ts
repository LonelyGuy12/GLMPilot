import { create } from 'zustand';
import type { ChatMessage, AgentResult, Finding, AgentType } from '@glmpilot/shared';

interface AIState {
  messages: ChatMessage[];
  streamingMessage: string;
  isStreaming: boolean;
  agentResults: Partial<Record<AgentType, AgentResult>>;
  agentRunning: Partial<Record<AgentType, boolean>>;
  completionSuggestion: string | null;
  addMessage: (message: ChatMessage) => void;
  updateStreamingMessage: (content: string) => void;
  finishStreaming: (finalContent: string) => void;
  setAgentResult: (agent: AgentType, result: AgentResult) => void;
  setAgentRunning: (agent: AgentType, running: boolean) => void;
  setCompletionSuggestion: (suggestion: string | null) => void;
  clearChat: () => void;
  setIsStreaming: (streaming: boolean) => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  streamingMessage: '',
  isStreaming: false,
  agentResults: {},
  agentRunning: {},
  completionSuggestion: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateStreamingMessage: (content) =>
    set((state) => ({ streamingMessage: state.streamingMessage + content })),

  finishStreaming: (finalContent) =>
    set((state) => ({
      messages: [...state.messages, {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: finalContent,
        timestamp: Date.now(),
      }],
      streamingMessage: '',
      isStreaming: false,
    })),

  setAgentResult: (agent, result) =>
    set((state) => ({
      agentResults: { ...state.agentResults, [agent]: result },
    })),

  setAgentRunning: (agent, running) =>
    set((state) => ({
      agentRunning: { ...state.agentRunning, [agent]: running },
    })),

  setCompletionSuggestion: (suggestion) =>
    set({ completionSuggestion: suggestion }),

  clearChat: () => set({ messages: [], streamingMessage: '' }),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
}));
