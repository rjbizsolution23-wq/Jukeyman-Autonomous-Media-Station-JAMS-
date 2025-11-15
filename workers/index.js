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
 * Determine provider from model ID
 */
function getProviderFromModel(modelId) {
  if (!modelId) return 'openrouter';
  
  const id = modelId.toLowerCase();
  
  // MiniMax models
  if (id.startsWith('minimax/') || id.includes('minimax') || id.startsWith('minimax-')) {
    return 'minimax';
  }
  
  // Chutes models
  if (id.startsWith('chutesai/') || id.includes('chutes')) {
    return 'chutes';
  }
  
  // OpenRouter models (most others)
  if (id.startsWith('openrouter/')) {
    return 'openrouter';
  }
  
  // Default to OpenRouter for most models
  return 'openrouter';
}

/**
 * Route request to appropriate provider
 */
async function routeToProvider(provider, model, messages, env, corsHeaders) {
  switch (provider) {
    case 'minimax':
      return callMiniMaxAPI(model, messages, env);
    case 'chutes':
      return callChutesAPI(model, messages, env);
    case 'openrouter':
    default:
      return callOpenRouterAPI(model, messages, env);
  }
}

/**
 * Call MiniMax API
 */
async function callMiniMaxAPI(model, messages, env) {
  const apiKey = env.MINIMAX_API_KEY;
  const groupId = env.MINIMAX_GROUP_ID || '1935985499797721093';
  
  if (!apiKey) {
    throw new Error('MiniMax API key not configured');
  }

  // Extract model name from model ID
  // Support formats: minimax/MiniMax-M1, minimax/MiniMax-Text-01, etc.
  let minimaxModel = 'MiniMax-M1'; // Default
  if (model?.includes('MiniMax-M1') || model?.includes('m1')) {
    minimaxModel = 'MiniMax-M1';
  } else if (model?.includes('MiniMax-Text') || model?.includes('text-01')) {
    minimaxModel = 'MiniMax-Text-01';
  }
  
  const response = await fetch(`https://api.minimax.io/v1/text/chatcompletion_v2?GroupId=${groupId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: minimaxModel,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`MiniMax API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  // Transform MiniMax response to match expected format
  return {
    choices: [{
      message: {
        content: data.choices?.[0]?.message?.content || data.reply || JSON.stringify(data),
        role: 'assistant'
      }
    }],
    usage: data.usage || {},
  };
}

/**
 * Call Chutes API
 */
async function callChutesAPI(model, messages, env) {
  const apiKey = env.CHUTES_API_KEY;
  
  if (!apiKey) {
    throw new Error('Chutes API key not configured');
  }

  // Extract model name from model ID
  // Support formats: chutesai/deepseek-ai/DeepSeek-R1, chutesai/chutesai/Devstral-Small-2505, etc.
  let chutesModel = 'deepseek-ai/DeepSeek-R1'; // Default
  if (model?.includes('chutesai/')) {
    chutesModel = model.replace('chutesai/', '');
  } else if (model?.includes('deepseek')) {
    chutesModel = 'deepseek-ai/DeepSeek-R1';
  } else if (model?.includes('devstral')) {
    chutesModel = 'chutesai/Devstral-Small-2505';
  }
  
  const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: chutesModel,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Chutes API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

/**
 * Call OpenRouter API
 */
async function callOpenRouterAPI(model, messages, env) {
  const apiKey = env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY_ALT;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://rjbizsolution.com',
      'X-Title': 'Jukeyman AGI Music Studio (JAMS) API',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

/**
 * Run an agent task with multi-provider support
 */
async function handleAgentRun(request, env, corsHeaders) {
  const body = await request.json();
  const { agent_name, task, model, stream = false } = body;

  if (!task) {
    return jsonResponse({ error: 'Task required' }, 400, corsHeaders);
  }

  const selectedModel = model || env.DEFAULT_MODEL || 'deepseek/deepseek-chat';
  const provider = getProviderFromModel(selectedModel);

  const messages = [
    { 
      role: 'system', 
      content: `You are ${agent_name || 'a music production assistant'}. Provide expert guidance and execute tasks efficiently.` 
    },
    { role: 'user', content: task }
  ];

  try {
    const data = await routeToProvider(provider, selectedModel, messages, env, corsHeaders);
    
    // Track cost (store in KV if available)
    if (env.CACHE && data.usage) {
      const costKey = `cost:${new Date().toISOString().split('T')[0]}`;
      const currentCost = await env.CACHE.get(costKey) || '0';
      const newCost = parseFloat(currentCost) + calculateCost(data.usage, selectedModel, provider);
      await env.CACHE.put(costKey, newCost.toString(), { expirationTtl: 86400 * 30 });
    }

    const result = data.choices?.[0]?.message?.content || data.message?.content || JSON.stringify(data);

    return jsonResponse({
      success: true,
      agent: agent_name || 'Unknown',
      model: selectedModel,
      provider: provider,
      result: result,
      usage: data.usage || {},
      timestamp: new Date().toISOString(),
    }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Agent execution failed',
      message: error.message,
      provider: provider,
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
function calculateCost(usage, model, provider = 'openrouter') {
  // Simplified cost calculation per provider
  // In production, use actual model pricing
  const modelPricing = {
    // OpenRouter models (per 1M tokens)
    'google/gemini-2.0-flash-exp:free': 0,
    'deepseek/deepseek-chat': 0.00014,
    'deepseek/deepseek-r1': 0.00014,
    'deepseek/deepseek-r1:free': 0,
    'openai/gpt-4o-mini': 0.00015,
    'anthropic/claude-3-haiku': 0.00025,
    'qwen/qwen-2.5-72b-instruct': 0.00007,
    'mistralai/mistral-small': 0.00020,
    
    // MiniMax models
    'MiniMax-M1': 0.00020,
    'MiniMax-Text-01': 0.00015,
    
    // Chutes models (similar to OpenRouter)
    'deepseek-ai/DeepSeek-R1': 0.00014,
    'chutesai/Devstral-Small-2505': 0.00006,
  };

  const pricePer1M = modelPricing[model] || 0.0001;
  const totalTokens = (usage.total_tokens || 0) / 1000000;
  return totalTokens * pricePer1M;
}

/**
 * Get all available models from all providers
 */
function getAllModels() {
  // Flatten all models into a single array
  const allModels = [
    // OpenRouter - Free models
    { id: 'openrouter/sherlock-dash-alpha', name: 'Sherlock Dash Alpha (Free)', provider: 'openrouter', cost: 0, context: 1840000 },
    { id: 'openrouter/sherlock-think-alpha', name: 'Sherlock Think Alpha (Free)', provider: 'openrouter', cost: 0, context: 1840000 },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Google Gemini 2.0 Flash Experimental (Free)', provider: 'openrouter', cost: 0, context: 1048576 },
    { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'openrouter', cost: 0, context: 163840 },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta Llama 3.3 70B (Free)', provider: 'openrouter', cost: 0, context: 131072 },
    { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', provider: 'openrouter', cost: 0, context: 32768 },
    { id: 'mistralai/mistral-small-24b-instruct-2501:free', name: 'Mistral Small 3 (Free)', provider: 'openrouter', cost: 0, context: 32768 },
    
    // OpenRouter - Paid models - Best value
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'openrouter', cost: 0.00014, context: 64000 },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', cost: 0.00014, context: 163840 },
    { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct', provider: 'openrouter', cost: 0.00007, context: 32768 },
    { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'openrouter', cost: 0.00015, context: 128000 },
    { id: 'anthropic/claude-3-haiku', name: 'Anthropic Claude 3 Haiku', provider: 'openrouter', cost: 0.00025, context: 200000 },
    { id: 'mistralai/mistral-small', name: 'Mistral Small', provider: 'openrouter', cost: 0.00020, context: 32768 },
    { id: 'mistralai/mistral-nemo', name: 'Mistral Nemo', provider: 'openrouter', cost: 0.00002, context: 131072 },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B', provider: 'openrouter', cost: 0.00013, context: 131072 },
    { id: 'google/gemini-2.0-flash-001', name: 'Google Gemini 2.0 Flash', provider: 'openrouter', cost: 0.00010, context: 1048576 },
    
    // OpenRouter - Code models
    { id: 'deepseek/deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', provider: 'openrouter', cost: 0.00003, context: 131072 },
    { id: 'mistralai/codestral-2508', name: 'Mistral Codestral 2508', provider: 'openrouter', cost: 0.00030, context: 256000 },
    
    // OpenRouter - Music production focused
    { id: 'qwen/qwen-2.5-vl-72b-instruct', name: 'Qwen 2.5 VL 72B (Multimodal)', provider: 'openrouter', cost: 0.00008, context: 32768 },
    { id: 'qwen/qwen3-30b-a3b', name: 'Qwen3 30B A3B', provider: 'openrouter', cost: 0.00006, context: 40960 },
    
    // MiniMax - Text models
    { id: 'minimax/MiniMax-M1', name: 'MiniMax M1 (80K CoT, 1M Context)', provider: 'minimax', cost: 0.00020, context: 1000192, features: ['streaming', 'function_calling', 'reasoning'] },
    { id: 'minimax/MiniMax-Text-01', name: 'MiniMax Text-01', provider: 'minimax', cost: 0.00015, context: 1000192 },
    
    // MiniMax - Audio models
    { id: 'minimax/speech-2.5-hd-preview', name: 'MiniMax Speech 2.5 HD (TTS)', provider: 'minimax', cost: 0.00015, type: 'audio', languages: 40, emotions: 7 },
    { id: 'minimax/speech-2.5-turbo-preview', name: 'MiniMax Speech 2.5 Turbo (TTS)', provider: 'minimax', cost: 0.00010, type: 'audio', languages: 40, emotions: 7 },
    { id: 'minimax/speech-02-hd', name: 'MiniMax Speech 02 HD', provider: 'minimax', cost: 0.00012, type: 'audio', languages: 24 },
    { id: 'minimax/speech-02-turbo', name: 'MiniMax Speech 02 Turbo', provider: 'minimax', cost: 0.00008, type: 'audio', languages: 24 },
    
    // MiniMax - Music generation
    { id: 'minimax/music-1.5', name: 'MiniMax Music 1.5 (Music Generation)', provider: 'minimax', cost: 0.00050, type: 'music' },
    
    // MiniMax - Video models
    { id: 'minimax/video-hailuo-02', name: 'MiniMax Hailuo 02 (Text/Image to Video)', provider: 'minimax', cost: 0.00100, type: 'video', resolution: '1080p/768p/512p', fps: 24 },
    { id: 'minimax/video-t2v-director', name: 'MiniMax T2V Director (Text to Video)', provider: 'minimax', cost: 0.00080, type: 'video', resolution: '720p', fps: 25 },
    
    // Chutes models
    { id: 'chutesai/deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 (via Chutes)', provider: 'chutes', cost: 0.00014, context: 163840 },
    { id: 'chutesai/chutesai/Devstral-Small-2505', name: 'Devstral Small 2505', provider: 'chutes', cost: 0.00006, context: 128000 },
    { id: 'chutesai/moonshotai/Kimi-K2-Instruct-75k', name: 'Kimi K2 Instruct 75k', provider: 'chutes', cost: 0.00010, context: 75000 },
    { id: 'chutesai/all-hands/openhands-lm-32b-v0.1-ep3', name: 'OpenHands LM 32B', provider: 'chutes', cost: 0.00008, context: 32768 },
    { id: 'chutesai/nousresearch/DeepHermes-3-Mistral-24B-Preview', name: 'DeepHermes 3 Mistral 24B', provider: 'chutes', cost: 0.00015, context: 32768 },
  ];
  
  return allModels;
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
          models: getAllModels(),
        }, 200, corsHeaders);
      }
    }

    // 404 for unknown routes
    return jsonResponse({ error: 'Not Found' }, 404, corsHeaders);
  },
};

