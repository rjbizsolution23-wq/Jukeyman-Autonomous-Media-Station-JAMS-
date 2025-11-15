"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { useRealtimeUpdates } from "@/lib/hooks/useRealtimeUpdates";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

interface LiveIndicatorProps {
  showText?: boolean;
  variant?: "badge" | "icon" | "full";
}

export function LiveIndicator({ showText = false, variant = "icon" }: LiveIndicatorProps) {
  const { isConnected, reconnectAttempts } = useRealtimeUpdates();

  const getStatusColor = () => {
    if (isConnected) return "text-green-400";
    if (reconnectAttempts > 0) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className={`h-4 w-4 ${getStatusColor()}`} />;
    if (reconnectAttempts > 0) return <AlertCircle className={`h-4 w-4 ${getStatusColor()} animate-pulse`} />;
    return <WifiOff className={`h-4 w-4 ${getStatusColor()}`} />;
  };

  const getStatusText = () => {
    if (isConnected) return "Live";
    if (reconnectAttempts > 0) return `Reconnecting (${reconnectAttempts})...`;
    return "Offline";
  };

  const getTooltipText = () => {
    if (isConnected) return "Real-time connection active";
    if (reconnectAttempts > 0) return `Reconnecting... Attempt ${reconnectAttempts}`;
    return "Real-time connection offline";
  };

  if (variant === "badge") {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant={isConnected ? "success" : reconnectAttempts > 0 ? "warning" : "destructive"}
            className="gap-1.5"
          >
            {getStatusIcon()}
            {showText && <span>{getStatusText()}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{getTooltipText()}</TooltipContent>
      </Tooltip>
    );
  }

  if (variant === "full") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {isConnected && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>
    );
  }

  // Default: icon only
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="relative">
          {getStatusIcon()}
          {isConnected && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>{getTooltipText()}</TooltipContent>
    </Tooltip>
  );
}

