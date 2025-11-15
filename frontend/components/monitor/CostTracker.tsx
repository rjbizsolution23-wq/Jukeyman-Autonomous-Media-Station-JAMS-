"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useCostUpdates } from "@/lib/hooks/useRealtimeUpdates";

interface CostTrackerProps {
  dailyBudget?: number;
  monthlyBudget?: number;
}

export function CostTracker({ dailyBudget = 1.0, monthlyBudget = 10.0 }: CostTrackerProps) {
  const costData = useCostUpdates();
  
  // Mock data if no real-time data
  const [costs, setCosts] = React.useState({
    today: 0.42,
    yesterday: 0.38,
    thisMonth: 4.25,
    lastMonth: 3.95,
    totalRequests: 2847,
    averageCostPerRequest: 0.00015,
  });

  React.useEffect(() => {
    if (costData) {
      setCosts((prev) => ({
        ...prev,
        today: costData.dailyCost || prev.today,
        thisMonth: costData.totalCost || prev.thisMonth,
      }));
    }
  }, [costData]);

  const dailyPercentage = (costs.today / dailyBudget) * 100;
  const monthlyPercentage = (costs.thisMonth / monthlyBudget) * 100;

  const getTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { icon: TrendingUp, color: "text-red-400", text: `+${change.toFixed(1)}%` };
    if (change < -5) return { icon: TrendingDown, color: "text-green-400", text: `${change.toFixed(1)}%` };
    return { icon: TrendingUp, color: "text-gray-400", text: "~0%" };
  };

  const dailyTrend = getTrend(costs.today, costs.yesterday);
  const monthlyTrend = getTrend(costs.thisMonth, costs.lastMonth);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <CardTitle className="text-sm">Cost Tracking</CardTitle>
          </div>
          <Badge variant={dailyPercentage > 80 ? "destructive" : "success"}>
            {dailyPercentage > 80 ? "High Usage" : "Normal"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Today's Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Today</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-green-400">
                ${costs.today.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">/ ${dailyBudget.toFixed(2)}</span>
              <dailyTrend.icon className={`h-4 w-4 ${dailyTrend.color}`} />
              <span className={`text-xs ${dailyTrend.color}`}>{dailyTrend.text}</span>
            </div>
          </div>
          <ProgressBar
            value={dailyPercentage}
            max={100}
            variant={dailyPercentage > 80 ? "danger" : dailyPercentage > 60 ? "warning" : "success"}
          />
        </div>

        {/* This Month's Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">This Month</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-green-400">
                ${costs.thisMonth.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">/ ${monthlyBudget.toFixed(2)}</span>
              <monthlyTrend.icon className={`h-4 w-4 ${monthlyTrend.color}`} />
              <span className={`text-xs ${monthlyTrend.color}`}>{monthlyTrend.text}</span>
            </div>
          </div>
          <ProgressBar
            value={monthlyPercentage}
            max={100}
            variant={monthlyPercentage > 80 ? "danger" : monthlyPercentage > 60 ? "warning" : "success"}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-xs text-gray-500">Total Requests</p>
            <p className="text-lg font-semibold text-gray-100 mt-1">
              {costs.totalRequests.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-xs text-gray-500">Avg Cost/Request</p>
            <p className="text-lg font-semibold text-gray-100 mt-1">
              ${costs.averageCostPerRequest.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Budget Alert */}
        {(dailyPercentage > 80 || monthlyPercentage > 80) && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/20 border border-red-900/50">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Budget Alert</p>
              <p className="text-xs text-red-300 mt-1">
                You're approaching your {dailyPercentage > 80 ? "daily" : "monthly"} budget limit.
                Consider optimizing model usage or increasing limits.
              </p>
            </div>
          </div>
        )}

        {/* Projected Month End */}
        <div className="p-3 rounded-lg bg-violet-900/10 border border-violet-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Projected Month End</span>
            <span className="text-sm font-semibold text-violet-400">
              ${(costs.thisMonth * (30 / new Date().getDate())).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

