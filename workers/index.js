/**
 * Jukeyman AGI Music Studio (JAMS) - Cloudflare Workers API
 * Edge-deployed music production API
 * Domain: api.rjbizsolution.com
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...headers,
    },
  });
}

async function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Health check endpoint
 */
async function handleHealth(env, corsHeaders) {
  return jsonResponse({
    status: 'healthy',
    service: 'Jukeyman AGI Music Studio (JAMS) API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    domain: 'api.rjbizsolution.com',
    environment: env.ENVIRONMENT || 'production',
    features: {
      r2_storage: !!env.MUSIC_STORAGE,
      kv_cache: !!env.CACHE,
      agents: parseInt(env.MAX_AGENTS || '110'),
      cost_optimization: true,
    },
  }, 200, corsHeaders);
}

/**
 * Run an agent task
 */
async function handleAgentRun(request, env, corsHeaders) {
  const body = await request.json();
  const { agent_name, task, model, stream = false } = body;

  if (!task) {
    return jsonResponse({ error: 'Task required' }, 400, corsHeaders);
  }

  // Call OpenRouter via edge
  const openrouterKey = env.OPENROUTER_API_KEY;
  const selectedModel = model || env.DEFAULT_MODEL || 'deepseek/deepseek-chat';

  if (!openrouterKey) {
    return jsonResponse({ 
      error: 'OpenRouter API key not configured',
      message: 'Please set OPENROUTER_API_KEY secret in Cloudflare Workers'
    }, 500, corsHeaders);
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rjbizsolution.com',
        'X-Title': 'Jukeyman AGI Music Studio (JAMS) API',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { 
            role: 'system', 
            content: `You are ${agent_name || 'a music production assistant'}. Provide expert guidance and execute tasks efficiently.` 
          },
          { role: 'user', content: task }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    // Track cost (store in KV if available)
    if (env.CACHE && data.usage) {
      const costKey = `cost:${new Date().toISOString().split('T')[0]}`;
      const currentCost = await env.CACHE.get(costKey) || '0';
      const newCost = parseFloat(currentCost) + calculateCost(data.usage, selectedModel);
      await env.CACHE.put(costKey, newCost.toString(), { expirationTtl: 86400 * 30 });
    }

    const result = data.choices?.[0]?.message?.content || data.message?.content || JSON.stringify(data);

    return jsonResponse({
      success: true,
      agent: agent_name || 'Unknown',
      model: selectedModel,
      result: result,
      usage: data.usage || {},
      timestamp: new Date().toISOString(),
    }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Agent execution failed',
      message: error.message,
    }, 500, corsHeaders);
  }
}

/**
 * List agents
 */
async function handleAgentsList(env, corsHeaders) {
  // Generate 110 agents list
  const departments = [
    'Composition', 'Sound Design', 'Recording', 'Editing', 'Mixing',
    'Mastering', 'Post-Production', 'Quality Control', 'Metadata', 'Distribution', 'Orchestration'
  ];
  
  const agents = [];
  departments.forEach((dept, deptIndex) => {
    for (let i = 1; i <= 10; i++) {
      agents.push({
        id: `agent-${deptIndex + 1}-${i}`,
        name: `${dept} Agent ${i}`,
        department: dept,
        status: 'idle',
        capabilities: [`${dept} task ${i}`],
      });
    }
  });

  return jsonResponse({
    agents,
    total: agents.length,
  }, 200, corsHeaders);
}

/**
 * Get agent by ID
 */
async function handleAgentGet(agentId, env, corsHeaders) {
  return jsonResponse({
    id: agentId,
    name: `Agent ${agentId}`,
    status: 'idle',
    department: 'Production',
  }, 200, corsHeaders);
}

/**
 * Cost summary
 */
async function handleCostSummary(env, corsHeaders) {
  if (!env.CACHE) {
    return jsonResponse({
      total: 0,
      today: 0,
      message: 'Cost tracking not available',
    }, 200, corsHeaders);
  }

  const today = new Date().toISOString().split('T')[0];
  const costKey = `cost:${today}`;
  const todayCost = parseFloat(await env.CACHE.get(costKey) || '0');

  return jsonResponse({
    total: todayCost,
    today: todayCost,
    currency: 'USD',
  }, 200, corsHeaders);
}

/**
 * Calculate cost based on usage and model
 */
function calculateCost(usage, model) {
  // Simplified cost calculation
  // In production, use actual model pricing
  const modelPricing = {
    'google/gemini-2.0-flash-exp:free': 0,
    'deepseek/deepseek-chat': 0.00014, // $0.14 per 1M tokens
    'deepseek/deepseek-r1': 0.00014,
  };

  const pricePer1M = modelPricing[model] || 0.0001;
  const totalTokens = (usage.total_tokens || 0) / 1000000;
  return totalTokens * pricePer1M;
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Health check
    if (path === '/health' || path === '/api/health') {
      return handleHealth(env, corsHeaders);
    }

    // API routes
    if (path.startsWith('/api/v1/')) {
      // Agent run
      if (path === '/api/v1/agent/run' && request.method === 'POST') {
        return handleAgentRun(request, env, corsHeaders);
      }

      // Agents list
      if (path === '/api/v1/agents' && request.method === 'GET') {
        return handleAgentsList(env, corsHeaders);
      }

      // Agent by ID
      const agentMatch = path.match(/^\/api\/v1\/agents\/(.+)$/);
      if (agentMatch && request.method === 'GET') {
        return handleAgentGet(agentMatch[1], env, corsHeaders);
      }

      // Cost summary
      if (path === '/api/v1/cost/summary' && request.method === 'GET') {
        return handleCostSummary(env, corsHeaders);
      }

      // Models list
      if (path === '/api/v1/models/list' && request.method === 'GET') {
        return jsonResponse({
          models: [
            { id: 'google/gemini-2.0-flash-exp:free', name: 'Google Gemini 2.0 Flash (Free)', cost: 0 },
            { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', cost: 0.00014 },
            { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', cost: 0.00014 },
          ],
        }, 200, corsHeaders);
      }
    }

    // 404 for unknown routes
    return jsonResponse({ error: 'Not Found' }, 404, corsHeaders);
  },
};

