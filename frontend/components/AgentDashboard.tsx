"use client";

import { useEffect, useState } from 'react';

interface Agent {
  name: string;
  role: string;
  department: string;
  status: string;
  tasks_completed: number;
}

export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8000/agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['all', ...new Set(agents.map(a => a.department))];

  const filteredAgents = selectedDepartment === 'all'
    ? agents
    : agents.filter(a => a.department === selectedDepartment);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'working': return 'bg-yellow-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Agent Dashboard</h2>

        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400">Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-400">{agents.length}</div>
          <div className="text-sm text-gray-400">Total Agents</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">
            {agents.filter(a => a.status === 'idle').length}
          </div>
          <div className="text-sm text-gray-400">Ready</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-yellow-400">
            {agents.filter(a => a.status === 'working').length}
          </div>
          <div className="text-sm text-gray-400">Working</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-400">
            {agents.reduce((sum, a) => sum + a.tasks_completed, 0)}
          </div>
          <div className="text-sm text-gray-400">Tasks Completed</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAgents.map(agent => (
          <div
            key={agent.name}
            className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
              <span className="text-xs text-gray-500">{agent.tasks_completed} tasks</span>
            </div>

            <h3 className="font-medium text-sm mb-1">{agent.name}</h3>
            <p className="text-xs text-gray-400 mb-2">{agent.role}</p>

            <div className="flex items-center gap-1">
              <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                {agent.department}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

