"use client";

import * as React from "react";
import { Wifi, WifiOff, Clock, Cpu } from "lucide-react";

export function StatusBar() {
  const [status, setStatus] = React.useState({
    connected: true,
    latency: 0,
    cpuUsage: 0,
    lastUpdate: new Date(),
  });

  React.useEffect(() => {
    const checkConnection = async () => {
      const startTime = performance.now();
      try {
        const response = await fetch("https://jams-api.rickjefferson.workers.dev/health", {
          method: 'GET',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        if (response.ok) {
          setStatus((prev) => ({
            connected: true,
            latency: latency,
            cpuUsage: 0, // Would come from backend metrics
            lastUpdate: new Date(),
          }));
        } else {
          setStatus((prev) => ({
            ...prev,
            connected: false,
            latency: 0,
            lastUpdate: new Date(),
          }));
        }
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          connected: false,
          latency: 0,
          lastUpdate: new Date(),
        }));
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-64 right-0 z-30 h-8 border-t border-gray-800 bg-gray-950 flex items-center justify-between px-4 text-xs text-gray-500">
      {/* Left: Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {status.connected ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span className="text-green-400">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-500" />
              <span className="text-red-400">Disconnected</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>Latency: {status.latency}ms</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3" />
          <span>CPU: {status.cpuUsage}%</span>
        </div>
      </div>

      {/* Right: Last Update */}
      <div className="flex items-center gap-4">
        <span>
          Last update: {status.lastUpdate.toLocaleTimeString()}
        </span>
        <span className="text-violet-400">JAMS v1.0</span>
      </div>
    </div>
  );
}

