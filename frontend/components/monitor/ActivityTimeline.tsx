"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, XCircle, Sparkles, Zap } from "lucide-react";
import { format } from "date-fns";

interface Activity {
  id: string;
  type: "agent" | "workflow" | "system" | "cost";
  timestamp: Date;
  title: string;
  description?: string;
  status: "success" | "running" | "error" | "info";
  agent?: string;
  duration?: number;
  cost?: number;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityTimeline({ activities, maxItems = 50 }: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const getIcon = (type: Activity["type"], status: Activity["status"]) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (status === "error") return <XCircle className="h-4 w-4 text-red-400" />;
    if (status === "running") return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
    
    switch (type) {
      case "agent":
        return <Sparkles className="h-4 w-4 text-violet-400" />;
      case "workflow":
        return <Zap className="h-4 w-4 text-blue-400" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-500" />;
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "success": return "border-green-900/50 bg-green-950/20";
      case "error": return "border-red-900/50 bg-red-950/20";
      case "running": return "border-yellow-900/50 bg-yellow-950/20";
      default: return "border-gray-800 bg-gray-900/50";
    }
  };

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin pr-2">
      <AnimatePresence mode="popLayout">
        {displayedActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <Card className={`border ${getStatusColor(activity.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(activity.type, activity.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-100">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {format(activity.timestamp, "HH:mm:ss")}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 mt-2">
                      {activity.agent && (
                        <Badge variant="outline" className="text-xs">
                          {activity.agent}
                        </Badge>
                      )}
                      {activity.duration && (
                        <span className="text-xs text-gray-500">
                          {activity.duration < 1000
                            ? `${activity.duration}ms`
                            : `${(activity.duration / 1000).toFixed(2)}s`}
                        </span>
                      )}
                      {activity.cost !== undefined && (
                        <span className="text-xs text-green-400">
                          ${activity.cost.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {activities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No activity yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Activity will appear here as agents execute tasks
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

