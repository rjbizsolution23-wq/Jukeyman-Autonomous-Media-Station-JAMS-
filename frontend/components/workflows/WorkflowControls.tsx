"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Play,
  Square,
  Save,
  FolderOpen,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowControlsProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onExecute: () => void;
  onStop: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isExecuting: boolean;
  executionProgress?: {
    current: number;
    total: number;
    currentNode?: string;
  };
}

export function WorkflowControls({
  workflowName,
  onWorkflowNameChange,
  onExecute,
  onStop,
  onSave,
  onLoad,
  onClear,
  onExport,
  onZoomIn,
  onZoomOut,
  onFitView,
  isExecuting,
  executionProgress,
}: WorkflowControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-gray-900 border-b border-gray-800">
      {/* Left: Workflow Name */}
      <div className="flex items-center gap-3 flex-1">
        <Input
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          placeholder="Workflow name..."
          className="max-w-xs"
          disabled={isExecuting}
        />
        
        {isExecuting && executionProgress && (
          <Badge variant="warning" className="animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            {executionProgress.current}/{executionProgress.total}
            {executionProgress.currentNode && (
              <span className="ml-1 opacity-70">- {executionProgress.currentNode}</span>
            )}
          </Badge>
        )}
      </div>

      {/* Center: Execution Controls */}
      <div className="flex items-center gap-2">
        {!isExecuting ? (
          <Button onClick={onExecute} variant="primary" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Execute
          </Button>
        ) : (
          <Button onClick={onStop} variant="destructive" size="sm">
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}

        <div className="h-6 w-px bg-gray-700" />

        <Button onClick={onSave} variant="secondary" size="sm" disabled={isExecuting}>
          <Save className="h-4 w-4" />
        </Button>

        <Button onClick={onLoad} variant="secondary" size="sm" disabled={isExecuting}>
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button onClick={onExport} variant="secondary" size="sm" disabled={isExecuting}>
          <Download className="h-4 w-4" />
        </Button>

        <Button onClick={onClear} variant="secondary" size="sm" disabled={isExecuting}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right: View Controls */}
      <div className="flex items-center gap-2">
        <Button onClick={onZoomIn} variant="secondary" size="sm">
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button onClick={onZoomOut} variant="secondary" size="sm">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button onClick={onFitView} variant="secondary" size="sm">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

