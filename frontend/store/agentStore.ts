import { create } from "zustand";

export interface Agent {
  id: string;
  name: string;
  department: string;
  role: string;
  status: "idle" | "working" | "completed" | "error";
  tasksCompleted: number;
  currentTask?: string;
  capabilities?: string[];
}

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  selectAgent: (agent: Agent | null) => void;
  updateAgentStatus: (id: string, status: Agent["status"]) => void;
  incrementTaskCount: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgent: null,
  loading: false,
  error: null,

  setAgents: (agents) => set({ agents }),
  
  selectAgent: (agent) => set({ selectedAgent: agent }),
  
  updateAgentStatus: (idOrName, status) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === idOrName || agent.name === idOrName ? { ...agent, status } : agent
      ),
    })),
  
  incrementTaskCount: (idOrName) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === idOrName || agent.name === idOrName
          ? { ...agent, tasksCompleted: agent.tasksCompleted + 1, status: "idle" as const }
          : agent
      ),
    })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}));

