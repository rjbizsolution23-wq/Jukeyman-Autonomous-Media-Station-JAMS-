"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Terminal, Download, Trash2, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
}

interface StreamingLogsProps {
  maxLogs?: number;
}

export function StreamingLogs({ maxLogs = 100 }: StreamingLogsProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = React.useState(false);
  const [filterLevel, setFilterLevel] = React.useState<string>("all");
  const logsEndRef = React.useRef<HTMLDivElement>(null);
  const shouldAutoScroll = React.useRef(true);

  // Mock log generation (replace with real SSE connection)
  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const levels: LogEntry["level"][] = ["info", "warning", "error", "debug"];
      const sources = ["Agent", "Workflow", "System", "API"];
      const messages = [
        "Task completed successfully",
        "Processing audio file",
        "Connecting to OpenRouter API",
        "Model response received",
        "Cost tracking updated",
        "Workflow step 3/10 completed",
      ];

      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      };

      setLogs((prev) => [newLog, ...prev].slice(0, maxLogs));
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, maxLogs]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (shouldAutoScroll.current && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const filteredLogs = logs.filter(
    (log) => filterLevel === "all" || log.level === filterLevel
  );

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "text-blue-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "debug":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getLevelBadge = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return <Badge className="text-[10px]">INFO</Badge>;
      case "warning":
        return <Badge variant="warning" className="text-[10px]">WARN</Badge>;
      case "error":
        return <Badge variant="destructive" className="text-[10px]">ERROR</Badge>;
      case "debug":
        return <Badge variant="secondary" className="text-[10px]">DEBUG</Badge>;
    }
  };

  const handleClear = () => {
    setLogs([]);
  };

  const handleExport = () => {
    const logsText = logs
      .map(
        (log) =>
          `[${format(log.timestamp, "yyyy-MM-dd HH:mm:ss")}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.txt`;
    a.click();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-sm">Live Logs</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {filteredLogs.length} entries
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>

            <Button size="sm" variant="secondary" onClick={handleExport}>
              <Download className="h-3 w-3" />
            </Button>

            <Button size="sm" variant="secondary" onClick={handleClear}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full bg-black/30 font-mono text-xs overflow-y-auto scrollbar-thin p-4 space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 py-1 border-b border-gray-800/50"
              >
                <span className="text-gray-600 whitespace-nowrap">
                  {format(log.timestamp, "HH:mm:ss")}
                </span>
                <div className="flex-shrink-0">
                  {getLevelBadge(log.level)}
                </div>
                <span className="text-violet-400 whitespace-nowrap">[{log.source}]</span>
                <span className={getLevelColor(log.level)}>{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>

        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Terminal className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No logs yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Logs will appear here in real-time
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

