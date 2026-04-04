const express = require('express');
const fetch = require('node-fetch');
const app = express();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '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';
const APPFLOWY_AI_URL = process.env.APPFLOWY_AI_URL || 'http://localhost:5001';

app.use(express.json({ limit: '50mb' }));

// Tavily search helper
async function tavilySearch(query) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      max_results: 5
    })
  });
  
  const data = await response.json();
  return {
    results: data.results || [],
    context: (data.results || []).slice(0, 3).map(r => `${r.title}: ${r.content}`).join('\n\n')
  };
}

// Proxy to AppFlowy AI with Tavily enhancement
app.post('/api/v1/ai/chat', async (req, res) => {
  const { messages, use_web_search = false } = req.body;
  
  let enhancedMessages = [...messages];
  
  if (use_web_search && messages.length > 0) {
    const lastMessage = messages[messages.length - 1].content;
    
    // Detect if query needs web search
    const searchTriggers = ['news', 'latest', 'current', 'today', 'recent', 'search', 'find', 'what is', 'who is', 'where is'];
    const needsSearch = searchTriggers.some(trigger => lastMessage.toLowerCase().includes(trigger));
    
    if (needsSearch) {
      console.log(`[Tavily] Searching: ${lastMessage.substring(0, 100)}...`);
      const searchResults = await tavilySearch(lastMessage);
      
      enhancedMessages.unshift({
        role: 'system',
        content: `Current web context (from Tavily):\n${searchResults.context}\n\nUse this information to provide up-to-date answers.`
      });
    }
  }
  
  try {
    const response = await fetch(`${APPFLOWY_AI_URL}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: enhancedMessages })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Direct Tavily search endpoint
app.post('/api/v1/tools/tavily-search', async (req, res) => {
  const { query } = req.body;
  try {
    const results = await tavilySearch(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PROXY_PORT || 5002;
app.listen(PORT, () => {
  console.log(`[AppFlowy AI MCP Proxy] Running on port ${PORT}`);
  console.log(`Proxying to AppFlowy AI at ${APPFLOWY_AI_URL}`);
});
