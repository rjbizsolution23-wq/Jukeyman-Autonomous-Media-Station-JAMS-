"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ActivityTimeline } from "@/components/monitor/ActivityTimeline";
import { AgentStatusGrid } from "@/components/monitor/AgentStatusGrid";
import { StreamingLogs } from "@/components/monitor/StreamingLogs";
import { CostTracker } from "@/components/monitor/CostTracker";
import { Badge } from "@/components/ui/Badge";
import { Activity, Users, Terminal, DollarSign } from "lucide-react";
import { useAgentStore } from "@/store/agentStore";

export default function MonitorPage() {
  const { agents } = useAgentStore();
  const [activities, setActivities] = React.useState<any[]>([]);

  // Generate mock activities for demonstration
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: `activity-${Date.now()}`,
        type: ["agent", "workflow", "system"][Math.floor(Math.random() * 3)],
        timestamp: new Date(),
        title: ["Task completed", "Workflow started", "Agent initialized", "Model response received"][Math.floor(Math.random() * 4)],
        description: "Processing music production task",
        status: ["success", "running", "info"][Math.floor(Math.random() * 3)],
        agent: agents[Math.floor(Math.random() * agents.length)]?.name || "System",
        duration: Math.floor(Math.random() * 5000),
        cost: Math.random() * 0.01,
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(interval);
  }, [agents]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="System Monitor"
        description="Real-time visibility into all operations"
        showSearch={false}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto scrollbar-thin">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Agents</p>
                  <p className="text-2xl font-bold text-violet-400 mt-1">{agents.length}</p>
                </div>
                <Users className="h-8 w-8 text-violet-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Tasks</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {agents.filter((a) => a.status === "working").length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {agents.reduce((sum, a) => sum + a.tasksCompleted, 0)}
                  </p>
                </div>
                <Terminal className="h-8 w-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cost Today</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">$0.42</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Monitoring Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Activity Timeline & Agent Grid */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-violet-400" />
                    Activity Timeline
                  </CardTitle>
                  <Badge>{activities.length} events</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ActivityTimeline activities={activities} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-400" />
                  Agent Status Grid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AgentStatusGrid />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Logs & Cost Tracker */}
          <div className="space-y-6">
            <div className="h-[500px]">
              <StreamingLogs />
            </div>

            <CostTracker dailyBudget={1.0} monthlyBudget={10.0} />
          </div>
        </div>
      </div>
    </div>
  );
}
