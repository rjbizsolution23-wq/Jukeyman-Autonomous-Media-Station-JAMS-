"use client";

import { useEffect, useState } from 'react';

export default function WorkflowPanel() {
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [workflowDetails, setWorkflowDetails] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:8000/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  };

  const fetchWorkflowDetails = async (name: string) => {
    try {
      const response = await fetch(`http://localhost:8000/workflows/${name}`);
      const data = await response.json();
      setWorkflowDetails(data);
    } catch (error) {
      console.error('Failed to fetch workflow details:', error);
    }
  };

  const handleSelectWorkflow = (name: string) => {
    setSelectedWorkflow(name);
    fetchWorkflowDetails(name);
  };

  const handleExecute = async () => {
    if (!selectedWorkflow) return;

    setExecuting(true);

    try {
      const response = await fetch('http://localhost:8000/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_name: selectedWorkflow,
          inputs: {},
        }),
      });

      const data = await response.json();
      alert(`Workflow completed in ${data.duration.toFixed(2)}s`);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Workflow Management</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h3 className="font-medium mb-4">Available Workflows</h3>

          <div className="space-y-2">
            {workflows.map(workflow => (
              <button
                key={workflow}
                onClick={() => handleSelectWorkflow(workflow)}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  selectedWorkflow === workflow
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {workflow}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Details */}
        <div className="col-span-2 bg-gray-800/30 border border-gray-700 rounded-lg p-6">
          {workflowDetails ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{workflowDetails.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{workflowDetails.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded p-3">
                  <div className="text-2xl font-bold text-purple-400">
                    {workflowDetails.steps}
                  </div>
                  <div className="text-sm text-gray-400">Steps</div>
                </div>

                <div className="bg-gray-900/50 rounded p-3">
                  <div className="text-2xl font-bold text-blue-400">
                    {workflowDetails.departments?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Departments</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Departments Involved:</h4>
                <div className="flex flex-wrap gap-2">
                  {workflowDetails.departments?.map((dept: string) => (
                    <span
                      key={dept}
                      className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded text-sm"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExecute}
                disabled={executing}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 rounded-lg transition"
              >
                {executing ? 'Executing Workflow...' : 'Execute Workflow'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a workflow to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

