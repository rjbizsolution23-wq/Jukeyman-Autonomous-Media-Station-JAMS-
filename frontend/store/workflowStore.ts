import { create } from "zustand";

export interface WorkflowNode {
  id: string;
  type: "agent" | "input" | "output" | "conditional";
  data: {
    agentName?: string;
    task?: string;
    label?: string;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: "draft" | "ready" | "running" | "completed" | "error";
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStore {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  executionResults: Record<string, any>;
  loading: boolean;
  error: string | null;

  // Actions
  setWorkflows: (workflows: Workflow[]) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  addNode: (node: WorkflowNode) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  removeEdge: (id: string) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNode["data"]>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setExecutionResults: (results: Record<string, any>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: [],
  currentWorkflow: null,
  executionResults: {},
  loading: false,
  error: null,

  setWorkflows: (workflows) => set({ workflows }),

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

  addNode: (node) =>
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: [...state.currentWorkflow.nodes, node],
        },
      };
    }),

  removeNode: (id) =>
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.filter((node) => node.id !== id),
          edges: state.currentWorkflow.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
        },
      };
    }),

  addEdge: (edge) =>
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          edges: [...state.currentWorkflow.edges, edge],
        },
      };
    }),

  removeEdge: (id) =>
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          edges: state.currentWorkflow.edges.filter((edge) => edge.id !== id),
        },
      };
    }),

  updateNodeData: (id, data) =>
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
          ),
        },
      };
    }),

  updateNodePosition: (id, position) =>
    set((state) => {
      if (!state.currentWorkflow) return state;
      return {
        currentWorkflow: {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.map((node) =>
            node.id === id ? { ...node, position } : node
          ),
        },
      };
    }),

  setExecutionResults: (results) => set({ executionResults: results }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));

