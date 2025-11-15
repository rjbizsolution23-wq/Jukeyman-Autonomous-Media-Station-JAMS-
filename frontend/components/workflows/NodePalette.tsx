"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAgentStore } from "@/store/agentStore";
import { Search, Sparkles, PlayCircle, CheckCircle, GitBranch } from "lucide-react";

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { agents } = useAgentStore();

  const filteredAgents = agents
    .filter((agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 10); // Show top 10 results

  const handleDragStart = (event: React.DragEvent, type: string, data: any) => {
    event.dataTransfer.effectAllowed = "move";
    onDragStart(event, type, data);
  };

  return (
    <div className="space-y-4">
      {/* System Nodes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">System Nodes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, "input", { label: "Input" })}
            className="flex items-center gap-2 p-2 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 cursor-move transition-colors"
          >
            <PlayCircle className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">Input</span>
          </div>

          <div
            draggable
            onDragStart={(e) => handleDragStart(e, "output", { label: "Output" })}
            className="flex items-center gap-2 p-2 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 cursor-move transition-colors"
          >
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-300">Output</span>
          </div>

          <div
            draggable
            onDragStart={(e) => handleDragStart(e, "conditional", { label: "Condition" })}
            className="flex items-center gap-2 p-2 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 cursor-move transition-colors"
          >
            <GitBranch className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Condition</span>
          </div>
        </CardContent>
      </Card>

      {/* AI Agents */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">AI Agents</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-thin">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No agents found
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, "agent", {
                    label: agent.name,
                    agentName: agent.name,
                    department: agent.department,
                    agentId: agent.id,
                  })
                }
                className="flex items-start gap-2 p-2 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 cursor-move transition-colors"
              >
                <div className="flex-shrink-0 h-6 w-6 rounded bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-300 truncate">
                    {agent.name}
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-0.5">
                    {agent.department}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-violet-900/10 border-violet-600/20">
        <CardContent className="pt-4">
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 <strong>Drag</strong> nodes onto canvas</p>
            <p>🔗 <strong>Click</strong> and drag to connect</p>
            <p>▶️ <strong>Execute</strong> to run workflow</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

