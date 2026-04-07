const http = require('http');
const https = require('https');

// Load Supabase credentials from environment or use defaults
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

console.error('[MCP Server] Supabase MCP connected to:', SUPABASE_URL);
console.error('[MCP Server] Waiting for commands on stdin...');

// Helper function to make Supabase API requests
async function supabaseRequest(path, method = 'GET', body = null) {
  const options = {
    hostname: new URL(SUPABASE_URL).hostname,
    path: `/rest/v1${path}`,
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body && method !== 'GET') req.write(JSON.stringify(body));
    req.end();
  });
}

// Handle MCP protocol messages via stdin/stdout
process.stdin.setEncoding('utf8');

function sendResponse(id, content) {
  process.stdout.write(JSON.stringify({ id, result: content }) + '\n');
}

function sendError(id, message) {
  process.stdout.write(JSON.stringify({ id, error: message }) + '\n');
}

process.stdin.on('data', async (chunk) => {
  try {
    const lines = chunk.toString().trim().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      let message;
      try { message = JSON.parse(line); } catch (e) { console.error('[MCP Error] Invalid JSON:', e.message); continue; }

      const { id, method, params } = message;

      try {
        let responseContent;
        switch (method) {
          case 'supabase/tables/list':
            console.error('[MCP] Listing tables...');
            const tablesResult = await supabaseRequest('/metadata');
            responseContent = { type: 'text', text: JSON.stringify(tablesResult.data?.tables || [], null, 2) };
            break;

          case 'supabase/query/select':
            if (!params?.table) throw new Error('Missing required parameter: table');
            const selectPath = `/tables/${params.table}?select=${encodeURIComponent(params.columns || '*')}`;
            let queryParams = [];
            if (params.filter && typeof params.filter === 'object') {
              for (const [key, value] of Object.entries(params.filter)) {
                if (typeof value === 'object' && Array.isArray(value)) {
                  queryParams.push(`${key}=in.(${value.join(',')})`);
                } else {
                  queryParams.push(`${key}=eq.${value}`);
                }
              }
            }
            const fullSelectPath = queryParams.length > 0 ? `${selectPath}&${queryParams.join('&')}` : selectPath;
            console.error(`[MCP] SELECT from ${params.table}: ${fullSelectPath}`);
            const selectResult = await supabaseRequest(fullSelectPath);
            responseContent = { type: 'text', text: JSON.stringify(selectResult.data, null, 2) };
            break;

          case 'supabase/query/insert':
            if (!params?.table || !params?.data) throw new Error('Missing required parameters: table, data');
            console.error(`[MCP] INSERT into ${params.table}`);
            const insertResult = await supabaseRequest(`/tables/${params.table}`, 'POST', params.data);
            responseContent = { type: 'text', text: JSON.stringify(insertResult.data, null, 2) };
            break;

          case 'supabase/query/update':
            if (!params?.table || !params?.data || !params?.filter) throw new Error('Missing required parameters: table, data, filter');
            let updateParams = [];
            for (const [key, value] of Object.entries(params.filter)) {
              updateParams.push(`${key}=eq.${value}`);
            }
            const fullUpdatePath = `/tables/${params.table}?${updateParams.join('&')}&select=true`;
            console.error(`[MCP] UPDATE ${params.table} with filter: ${JSON.stringify(params.filter)}`);
            const updateResult = await supabaseRequest(fullUpdatePath, 'PATCH', params.data);
            responseContent = { type: 'text', text: JSON.stringify(updateResult.data, null, 2) };
            break;

          case 'supabase/query/delete':
            if (!params?.table || !params?.filter) throw new Error('Missing required parameters: table, filter');
            let deleteParams = [];
            for (const [key, value] of Object.entries(params.filter)) {
              deleteParams.push(`${key}=eq.${value}`);
            }
            const deletePath = `/tables/${params.table}?${deleteParams.join('&')}`;
            console.error(`[MCP] DELETE from ${params.table} with filter: ${JSON.stringify(params.filter)}`);
            await supabaseRequest(deletePath, 'DELETE');
            responseContent = { type: 'text', text: `Successfully deleted records matching filter` };
            break;

          case 'supabase/project/info':
            console.error('[MCP] Fetching project info...');
            const projectResult = await supabaseRequest('/project');
            responseContent = { type: 'text', text: JSON.stringify(projectResult.data, null, 2) };
            break;

          case 'supabase/query/count':
            if (!params?.table || !params?.filter) throw new Error('Missing required parameters: table, filter');
            let countParams = [];
            for (const [key, value] of Object.entries(params.filter)) {
              countParams.push(`${key}=eq.${value}`);
            }
            const countPath = `/tables/${params.table}?select=count&${countParams.join('&')}`;
            console.error(`[MCP] COUNT from ${params.table}: ${countPath}`);
            const countResult = await supabaseRequest(countPath);
            responseContent = { type: 'text', text: JSON.stringify({ count: countResult.data?.total || 0 }, null, 2) };
            break;

          default:
            throw new Error(`Unknown method: ${method}`);
        }
        sendResponse(id, responseContent);
      } catch (error) {
        console.error('[MCP Error]', error.message);
        sendError(id, error.message);
      }
    }
  } catch (e) { console.error('[MCP Parse Error]', e.message); }
});

process.on('SIGINT', () => { console.error('[MCP Server] Shutting down...'); process.exit(0); });