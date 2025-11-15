"use client";

import * as React from "react";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { useRunAgent, useModels } from "@/lib/hooks/useAgents";
import { Agent } from "@/store/agentStore";
import { Play, Sparkles, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AgentExecutionModalProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentExecutionModal({
  agent,
  open,
  onOpenChange,
}: AgentExecutionModalProps) {
  const [task, setTask] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("deepseek/deepseek-chat");
  const [result, setResult] = React.useState<string | null>(null);
  
  const runAgent = useRunAgent();
  const { data: models } = useModels();

  const handleExecute = async () => {
    if (!agent || !task.trim()) {
      toast.error("Please enter a task");
      return;
    }

    try {
      toast.info("Executing task...");
      const response = await runAgent.mutateAsync({
        agent_name: agent.name,
        task: task.trim(),
        model: selectedModel,
      });

      if (response.success && response.result) {
        setResult(response.result);
        toast.success("✅ Task completed successfully!");
      } else {
        setResult(JSON.stringify(response, null, 2));
        toast.success("Task executed");
      }
    } catch (error: any) {
      console.error("Agent execution error:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to execute task";
      toast.error(`❌ Error: ${errorMsg}`);
      setResult(null);
    }
  };

  const handleClose = () => {
    setTask("");
    setResult(null);
    onOpenChange(false);
  };

  if (!agent) return null;

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <ModalTitle className="text-xl">{agent.name}</ModalTitle>
              <ModalDescription className="mt-2">{agent.role}</ModalDescription>
              <div className="flex items-center gap-2 mt-3">
                <Badge>{agent.department}</Badge>
                <Badge variant={agent.status === "idle" ? "success" : agent.status === "working" ? "warning" : "secondary"}>
                  {agent.status}
                </Badge>
                <Badge variant="outline">{agent.tasksCompleted} tasks</Badge>
              </div>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-4 px-6 pb-6">
          {/* Capabilities */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Capabilities</h3>
                <ul className="space-y-1">
                  {agent.capabilities.map((capability, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-violet-400" />
                      {capability}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Task Input */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Task Description
              </label>
              <Input
                placeholder={`What would you like ${agent.name} to do?`}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                disabled={runAgent.isPending}
                className="h-24"
                as="textarea"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                AI Model
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={runAgent.isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek/deepseek-chat">
                    ⭐ DeepSeek Chat - RECOMMENDED ($0.14/M)
                  </SelectItem>
                  <SelectItem value="deepseek/deepseek-r1">
                    DeepSeek R1 - Advanced Reasoning ($0.14/M)
                  </SelectItem>
                  <SelectItem value="google/gemini-flash-1.5-8b">
                    Gemini Flash 1.5 - Fast ($0.08/M)
                  </SelectItem>
                  <SelectItem value="google/gemini-2.0-flash-exp:free">
                    Gemini 2.0 (Free - May be rate limited)
                  </SelectItem>
                  <SelectItem value="anthropic/claude-3.5-sonnet">
                    Claude 3.5 Sonnet - Premium ($3/M)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExecute}
              disabled={!task.trim() || runAgent.isPending}
              loading={runAgent.isPending}
              className="w-full"
            >
              {runAgent.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Task
                </>
              )}
            </Button>
          </div>

          {/* Result */}
          {result && (
            <Card className="border-green-900/50 bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-green-400">Result</h3>
                </div>
                <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap">
                  {result}
                </div>
              </CardContent>
            </Card>
          )}

          {runAgent.isError && (
            <Card className="border-red-900/50 bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-semibold text-red-400">Error</h3>
                </div>
                <div className="text-sm text-red-300">
                  {(runAgent.error as any)?.message || "Failed to execute task"}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task History */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Tasks</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-400 text-center py-4">
                  No recent tasks
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModalContent>
    </Modal>
  );
}

