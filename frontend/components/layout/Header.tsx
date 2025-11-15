"use client";

import * as React from "react";
import { Bell, Search, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LiveIndicator } from "@/components/realtime/LiveIndicator";

interface HeaderProps {
  title: string;
  description?: string;
  showSearch?: boolean;
}

export function Header({ title, description, showSearch = true }: HeaderProps) {
  const [stats, setStats] = React.useState({
    agentsActive: 0,
    tasksRunning: 0,
    costToday: 0,
  });

  React.useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const [healthRes, costRes] = await Promise.all([
          fetch("https://jams-api.rickjefferson.workers.dev/health"),
          fetch("https://jams-api.rickjefferson.workers.dev/api/v1/cost/summary").catch(() => null),
        ]);
        
        const healthData = await healthRes.json();
        let costToday = 0;
        
        if (costRes && costRes.ok) {
          const costData = await costRes.json();
          costToday = costData.today || 0;
        }
        
        // Extract stats from response
        setStats({
          agentsActive: healthData.features?.agents || 110,
          tasksRunning: 0, // Would come from real-time endpoint
          costToday: costToday,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
    // Poll every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Title and Description */}
        <div>
          <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>

        {/* Center: Search (if enabled) */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search agents, workflows, files..."
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Right: Stats and Actions */}
        <div className="flex items-center gap-4">
          {/* Live Connection Indicator */}
          <LiveIndicator variant="full" showText />

          {/* Live Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-300">{stats.agentsActive} Agents</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-gray-300">{stats.tasksRunning} Tasks</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-300">${stats.costToday.toFixed(2)}</span>
            </div>
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => {
              // TODO: Open notifications panel
              console.log("Notifications clicked");
            }}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

