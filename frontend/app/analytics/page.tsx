"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Zap,
  Download,
} from "lucide-react";

// Mock data
const costData = [
  { date: "Jan 1", cost: 0.15 },
  { date: "Jan 2", cost: 0.22 },
  { date: "Jan 3", cost: 0.18 },
  { date: "Jan 4", cost: 0.35 },
  { date: "Jan 5", cost: 0.42 },
  { date: "Jan 6", cost: 0.38 },
  { date: "Jan 7", cost: 0.51 },
];

const agentPerformanceData = [
  { name: "Composer", tasks: 45 },
  { name: "Mixing Engineer", tasks: 38 },
  { name: "Sound Designer", tasks: 32 },
  { name: "Lyricist", tasks: 28 },
  { name: "Mastering Engineer", tasks: 25 },
];

const modelUsageData = [
  { name: "Gemini 2.0 (Free)", value: 65, color: "#8b5cf6" },
  { name: "DeepSeek R1", value: 25, color: "#3b82f6" },
  { name: "Gemini Flash 1.5", value: 10, color: "#10b981" },
];

const departmentActivityData = [
  { department: "Audio Production", tasks: 120 },
  { department: "Creative", tasks: 95 },
  { department: "AI/ML", tasks: 78 },
  { department: "Post-Production", tasks: 65 },
  { department: "Music Theory", tasks: 52 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("7d");

  const stats = {
    totalCost: 2.21,
    avgCostPerDay: 0.32,
    totalRequests: 2847,
    avgCostPerRequest: 0.00078,
    trend: "+12.5%",
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Analytics"
        description="Performance metrics and cost tracking"
        showSearch={false}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto scrollbar-thin">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Cost Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    ${stats.totalCost.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">{stats.trend}</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Cost/Day</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    ${stats.avgCostPerDay.toFixed(2)}
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
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold text-violet-400 mt-1">
                    {stats.totalRequests.toLocaleString()}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-violet-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cost/Request</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">
                    ${stats.avgCostPerRequest.toFixed(5)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Over Time */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Cost Trend</CardTitle>
                <Badge variant="success">Last 7 Days</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={agentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} angle={-15} textAnchor="end" height={70} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Model Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={modelUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modelUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentActivityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="department" stroke="#9ca3af" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Budget Status */}
        <Card className="border-violet-600/20 bg-gradient-to-br from-violet-900/10 to-blue-900/10">
          <CardHeader>
            <CardTitle>Budget & Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-100">$10.00</p>
                <p className="text-sm text-green-400 mt-1">$7.79 remaining</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Projected Month End</p>
                <p className="text-2xl font-bold text-gray-100">$9.45</p>
                <p className="text-sm text-yellow-400 mt-1">Within budget</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Cost Savings</p>
                <p className="text-2xl font-bold text-gray-100">$42.50</p>
                <p className="text-sm text-green-400 mt-1">Using free models</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
