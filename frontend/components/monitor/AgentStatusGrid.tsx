"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAgentStore } from "@/store/agentStore";
import { Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AgentStatusGridProps {
  compact?: boolean;
}

export function AgentStatusGrid({ compact = false }: AgentStatusGridProps) {
  const { agents } = useAgentStore();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedAgents = filteredAgents.reduce((acc, agent) => {
    if (!acc[agent.department]) {
      acc[agent.department] = [];
    }
    acc[agent.department].push(agent);
    return acc;
  }, {} as Record<string, typeof agents>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "bg-gray-500";
      case "working":
        return "bg-yellow-500 animate-pulse";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusCount = (status: string) => {
    return agents.filter((a) => a.status === status).length;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className={`h-2 w-2 rounded-full ${getStatusColor("idle")}`} />
          <span className="text-sm text-gray-300">{getStatusCount("idle")} Ready</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className={`h-2 w-2 rounded-full ${getStatusColor("working")}`} />
          <span className="text-sm text-gray-300">{getStatusCount("working")} Working</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className={`h-2 w-2 rounded-full ${getStatusColor("completed")}`} />
          <span className="text-sm text-gray-300">{getStatusCount("completed")} Done</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className={`h-2 w-2 rounded-full ${getStatusColor("error")}`} />
          <span className="text-sm text-gray-300">{getStatusCount("error")} Errors</span>
        </div>
      </div>

      {/* Agent Grid by Department */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
        {Object.entries(groupedAgents).map(([department, deptAgents]) => (
          <Card key={department}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{department}</span>
                <Badge variant="outline" className="text-xs">
                  {deptAgents.length} agents
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {deptAgents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                  >
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor(agent.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">{agent.name}</p>
                        <p className="text-[10px] text-gray-500">{agent.tasksCompleted} tasks</p>
                      </div>
                      <Sparkles className="h-3 w-3 text-violet-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">No agents found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

