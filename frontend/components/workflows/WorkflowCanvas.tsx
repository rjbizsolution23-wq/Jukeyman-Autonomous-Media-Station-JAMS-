"use client";

import * as React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "./CustomNodes";
import { NodePalette } from "./NodePalette";
import { WorkflowControls } from "./WorkflowControls";
import { useWorkflowStore } from "@/store/workflowStore";
import { toast } from "sonner";
import api from "@/lib/api";

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

function WorkflowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = React.useState("Untitled Workflow");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionProgress, setExecutionProgress] = React.useState<{
    current: number;
    total: number;
    currentNode?: string;
  }>();

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  const onConnect = React.useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData("application/reactflow-type");
      const nodeData = event.dataTransfer.getData("application/reactflow-data");

      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: nodeData ? JSON.parse(nodeData) : { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    event.dataTransfer.setData("application/reactflow-type", nodeType);
    event.dataTransfer.setData("application/reactflow-data", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error("Add nodes to the workflow first");
      return;
    }

    setIsExecuting(true);
    const agentNodes = nodes.filter((node) => node.type === "agent");
    
    setExecutionProgress({
      current: 0,
      total: agentNodes.length,
    });

    try {
      // Execute each agent node sequentially
      for (let i = 0; i < agentNodes.length; i++) {
        const node = agentNodes[i];
        setExecutionProgress({
          current: i + 1,
          total: agentNodes.length,
          currentNode: node.data?.label || node.id,
        });

        // Execute agent task
        if (node.data?.task) {
          try {
            const response = await api.agents.run({
              agent_name: node.data.label || "Agent",
              task: node.data.task,
              model: node.data.model || "deepseek/deepseek-chat",
            });

            if (response.data.success) {
              toast.success(`✅ ${node.data.label} completed`);
            }
          } catch (error: any) {
            console.error(`Error executing ${node.data.label}:`, error);
            toast.error(`❌ ${node.data.label} failed: ${error.message}`);
          }
        }

        // Small delay between nodes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success("🎉 Workflow execution completed!");
    } catch (error: any) {
      console.error("Workflow execution error:", error);
      toast.error(`❌ Workflow failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
      setExecutionProgress(undefined);
    }
  };

  const stopWorkflow = () => {
    setIsExecuting(false);
    setExecutionProgress(undefined);
    toast.info("Workflow stopped");
  };

  const saveWorkflow = () => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
    };
    localStorage.setItem(`workflow_${Date.now()}`, JSON.stringify(workflow));
    toast.success("Workflow saved!");
  };

  const loadWorkflow = () => {
    // Simplified - just load the latest workflow
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("workflow_")
    );
    if (keys.length === 0) {
      toast.error("No saved workflows found");
      return;
    }

    const latestKey = keys.sort().reverse()[0];
    const workflow = JSON.parse(localStorage.getItem(latestKey) || "{}");
    
    setWorkflowName(workflow.name || "Loaded Workflow");
    setNodes(workflow.nodes || []);
    setEdges(workflow.edges || []);
    toast.success("Workflow loaded!");
  };

  const clearWorkflow = () => {
    if (confirm("Clear the entire workflow?")) {
      setNodes([]);
      setEdges([]);
      setWorkflowName("Untitled Workflow");
      toast.info("Workflow cleared");
    }
  };

  const exportWorkflow = () => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "_")}.json`;
    a.click();
    toast.success("Workflow exported!");
  };

  const onZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const onZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const onFitView = () => {
    reactFlowInstance?.fitView();
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar: Node Palette */}
      <div className="w-80 border-r border-gray-800 bg-gray-950 p-4 overflow-y-auto scrollbar-thin">
        <NodePalette onDragStart={onDragStart} />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Controls */}
        <WorkflowControls
          workflowName={workflowName}
          onWorkflowNameChange={setWorkflowName}
          onExecute={executeWorkflow}
          onStop={stopWorkflow}
          onSave={saveWorkflow}
          onLoad={loadWorkflow}
          onClear={clearWorkflow}
          onExport={exportWorkflow}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFitView={onFitView}
          isExecuting={isExecuting}
          executionProgress={executionProgress}
        />

        {/* ReactFlow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 bg-black">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#333" gap={16} />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case "agent":
                    return "#8b5cf6";
                  case "input":
                    return "#3b82f6";
                  case "output":
                    return "#10b981";
                  case "conditional":
                    return "#f59e0b";
                  default:
                    return "#6b7280";
                }
              }}
              className="bg-gray-900 border border-gray-700"
            />

            <Panel position="top-right" className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Nodes:</span>
                  <span className="text-violet-400 font-semibold">{nodes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Connections:</span>
                  <span className="text-blue-400 font-semibold">{edges.length}</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}

