"use client";

import * as React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, PlayCircle, CheckCircle, XCircle, Clock } from "lucide-react";

// Agent Node
export function AgentNode({ data, selected }: NodeProps) {
  const getStatusIcon = () => {
    switch (data.status) {
      case "running":
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-violet-400" />;
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-gray-900 min-w-[200px] ${
        selected ? "border-violet-500 shadow-lg shadow-violet-500/20" : "border-gray-700"
      } ${data.status === "running" ? "animate-pulse" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-violet-500" />
      
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 h-8 w-8 rounded bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-100 truncate">
            {data.label || data.agentName || "Agent"}
          </div>
          {data.department && (
            <Badge variant="outline" className="text-xs mt-1">
              {data.department}
            </Badge>
          )}
        </div>
      </div>

      {data.task && (
        <div className="mt-2 text-xs text-gray-400 line-clamp-2">
          {data.task}
        </div>
      )}

      {data.result && (
        <div className="mt-2 p-2 bg-green-900/20 border border-green-900/50 rounded text-xs text-green-300">
          ✓ Completed
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-violet-500" />
    </div>
  );
}

// Input Node
export function InputNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-gray-900 min-w-[180px] ${
        selected ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-gray-700"
      }`}
    >
      <div className="flex items-center gap-2">
        <PlayCircle className="h-5 w-5 text-blue-400" />
        <div className="font-medium text-sm text-gray-100">
          {data.label || "Input"}
        </div>
      </div>

      {data.value && (
        <div className="mt-2 text-xs text-gray-400 line-clamp-2">
          {data.value}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}

// Output Node
export function OutputNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-gray-900 min-w-[180px] ${
        selected ? "border-green-500 shadow-lg shadow-green-500/20" : "border-gray-700"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-400" />
        <div className="font-medium text-sm text-gray-100">
          {data.label || "Output"}
        </div>
      </div>

      {data.result && (
        <div className="mt-2 text-xs text-gray-400 line-clamp-2">
          {data.result}
        </div>
      )}
    </div>
  );
}

// Conditional Node
export function ConditionalNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-gray-900 min-w-[180px] ${
        selected ? "border-yellow-500 shadow-lg shadow-yellow-500/20" : "border-gray-700"
      }`}
      style={{ borderRadius: "12px" }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-500" />
      
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-xs">
          ?
        </div>
        <div className="font-medium text-sm text-gray-100">
          {data.label || "Condition"}
        </div>
      </div>

      {data.condition && (
        <div className="mt-2 text-xs text-gray-400 line-clamp-2">
          {data.condition}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-green-500"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 bg-red-500"
        style={{ left: "70%" }}
      />
    </div>
  );
}

export const nodeTypes = {
  agent: AgentNode,
  input: InputNode,
  output: OutputNode,
  conditional: ConditionalNode,
};

