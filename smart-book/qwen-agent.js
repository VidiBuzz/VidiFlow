/**
 * Qwen Agent — Smart Book AI Companion
 * Powered by Qwen3 (Alibaba Cloud / DashScope)
 * 
 * Provides an intelligent chat assistant that knows the full book content,
 * can answer questions about chapters, personas, and topics, and guides
 * readers through "The Speed of Agentic Visual AI".
 * 
 * Usage: <script src="qwen-agent.js"></script> then call QwenAgent.init()
 * 
 * Config: Set window.QWEN_API_KEY or pass it to init({ apiKey: '...' })
 * Compatible endpoints: DashScope OpenAI-compatible, OpenRouter, LMStudio, Ollama
 */

(function () {
    'use strict';

    // ─── Default Configuration ──────────────────────────────
    const DEFAULTS = {
        // DashScope OpenAI-compatible endpoint (Qwen3)
        apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-plus',
        // Fallback: OpenRouter
        openRouterUrl: 'https://openrouter.ai/api/v1/chat/completions',
        openRouterModel: 'alibaba-cloud/qwen-qwq-32b-a3b',
        // Local fallbacks
        lmstudioUrl: 'http://localhost:1234/v1/chat/completions',
        ollamaUrl: 'http://localhost:11434/api/chat',
        ollamaModel: 'qwen2.5:72b',
        maxTokens: 2048,
        temperature: 0.7,
        stream: true,
        // UI
        position: 'bottom-right', // 'bottom-right' | 'bottom-left'
        theme: 'dark',           // 'dark' | 'light' | 'auto'
        primaryColor: '#FF6B35', // matches Smart Book fire color
        accentColor: '#C8A951',  // gold
        showWelcome: true,
        draggable: true,
    };

    // ─── State ───────────────────────────────────────────────
    let config = { ...DEFAULTS };
    let messages = [];
    let isOpen = false;
    let isStreaming = false;
    let currentAbortController = null;
    let conversationHistory = [];
    let bookContext = null;
    let currentPersona = null;

    // ─── DOM References ──────────────────────────────────────
    let widgetContainer = null;
    let chatPanel = null;
    let messagesContainer = null;
    let inputField = null;
    let sendButton = null;
    let toggleButton = null;
    let statusIndicator = null;

    // ─── Utility Functions ───────────────────────────────────

    function log(msg, data) {
        console.log(`[QwenAgent] ${msg}`, data || '');
    }

    function error(msg, err) {
        console.error(`[QwenAgent ERROR] ${msg}`, err || '');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function generateId() {
        return 'qa-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    }

    function formatTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Detect if we're on the print-book page
    function isPrintBookPage() {
        return window.location.pathname.includes('print-book') ||
            document.title.includes('by James May') &&
            !window.location.pathname.includes('index.html');
    }

    // Get current persona from localStorage or URL
    function detectPersona() {
        try {
            // Check URL params first
            const params = new URLSearchParams(window.location.search);
            const urlPersona = params.get('persona');
            if (urlPersona) return urlPersona;

            // Then localStorage
            const saved = localStorage.getItem('smartbook_persona');
            if (saved) return saved;
        } catch (e) { /* ignore */ }
        return null;
    }

    // ─── Build Book Context from BOOK_DATA ───────────────────

    function buildBookContext() {
        if (typeof BOOK_DATA === 'undefined') {
            log('BOOK_DATA not available yet — will retry');
            return null;
        }

        const bd = BOOK_DATA;
        const meta = bd.metadata || {};
        const personas = bd.personas || {};
        const chapters = bd.chapters || {};

        // Build chapter summary
        const chapterList = Object.values(chapters).map(ch => ({
            id: ch.id,
            title: ch.title,
            part: ch.part,
            order: ch.order,
            readingTime: ch.readingTime ? `${ch.readingTime} min` : 'unknown'
        })).sort((a, b) => a.order - b.order);

        // Get persona info for current user
        const personaKey = detectPersona();
        let personaInfo = null;
        if (personaKey && personas[personaKey]) {
            const p = personas[personaKey];
            personaInfo = {
                id: p.id,
                label: p.label,
                description: p.description,
                keyTakeaways: p.keyTakeaways || [],
                criticalChapters: (p.critical || []).map(cid => chapters[cid]?.title).filter(Boolean),
            };
        }

        // All persona labels
        const allPersonas = Object.values(personas).map(p => ({
            id: p.id,
            label: p.label,
            icon: p.icon,
            description: p.description,
        }));

        bookContext = {
            title: meta.title || 'The Speed of Agentic Visual AI',
            author: meta.author || 'James May',
            version: meta.version || 'unknown',
            totalChapters: chapterList.length,
            chapters: chapterList,
            personas: allPersonas,
            currentPersona: personaInfo,
        };

        log(`Book context built: "${bookContext.title}" (${bookContext.totalChapters} chapters)`);
        if (personaInfo) log(`Reader persona: ${personaInfo.label}`);
        return bookContext;
    }

    // ─── System Prompt Builder ──────────────────────────────

    function buildSystemPrompt() {
        const ctx = bookContext || buildBookContext();

        return `You are Qwen Agent, an AI companion for the digital book "${ctx.title || 'The Speed of Agentic Visual AI'}" by ${ctx.author || 'James May'}.

Your role is to help readers understand, navigate, and get the most value from this book. You have deep knowledge of every chapter and can provide personalized guidance.

## Book Overview
- Title: ${ctx.title}
- Author: ${ctx.author}
- Total Chapters: ${ctx.totalChapters}
${ctx.currentPersona ? `- Current Reader Persona: ${ctx.currentPersona.label}\n- Persona Focus: ${ctx.currentPersona.description}` : ''}

## Chapters
${(ctx.chapters || []).map(ch => `${ch.order}. ${ch.title} (${ch.readingTime})`).join('\n')}

## Available Personas
${(ctx.personas || []).map(p => `- ${p.label}: ${p.description}`).join('\n')}

## Your Capabilities
1. **Chapter Summaries**: Explain any chapter's key concepts in detail
2. **Personalized Guidance**: Tailor advice based on the reader's persona path
3. **Cross-Reference**: Connect ideas across different chapters
4. **Practical Application**: Suggest how to apply concepts from the book
5. **Navigation Help**: Recommend which chapters to read based on interests
6. **Deep Dives**: Elaborate on specific topics mentioned in the book
7. **Quote Extraction**: Find and discuss key quotes and frameworks
8. **Reading Plans**: Create custom reading schedules

## Guidelines
- Be concise but thorough — readers want actionable insights
- Reference specific chapter titles when discussing topics
- If asked about something outside the book's scope, gently redirect back
- Use the book's terminology (e.g., "Tensor Truth", "SaaSpocalypse", "500% Lead")
- Match the tone: professional but conversational, insightful but accessible
- When mentioning time estimates, use the chapter reading times shown above
- Format responses with clear headings, bullet points, and bold text for readability
- For technical questions, offer both simple and detailed explanations`;
    }

    // ─── API Communication ──────────────────────────────────

    async function callQwenAPI(userMessage, onChunk) {
        const apiKey = config.apiKey ||
            (typeof window.QWEN_API_KEY !== 'undefined' ? window.QWEN_API_KEY : null);

        if (!apiKey) {
            // Try without API key — might be a local endpoint
            log('No API key set — attempting local/direct connection');
        }

        // Build messages array
        const systemPrompt = buildSystemPrompt();

        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(m => ({
                role: m.role,
                content: m.content
            })),
            { role: 'user', content: userMessage }
        ];

        // Determine which endpoint to use
        let apiUrl = config.apiUrl;
        let headers = {
            'Content-Type': 'application/json',
        };
        let body;

        if (apiKey) {
            // DashScope or OpenRouter with key
            if (apiKey.startsWith('sk-or-') || apiKey.length > 60) {
                // Likely OpenRouter key
                apiUrl = config.openRouterUrl;
                headers['Authorization'] = `Bearer ${apiKey}`;
                log('Using OpenRouter endpoint');
            } else {
                // DashScope key
                headers['Authorization'] = `Bearer ${apiKey}`;
                log('Using DashScope endpoint');
            }

            body = {
                model: apiUrl.includes('openrouter') ? config.openRouterModel : config.model,
                messages: apiMessages,
                max_tokens: config.maxTokens,
                temperature: config.temperature,
                stream: config.stream,
            };
        } else {
            // Try local endpoints
            apiUrl = config.lmstudioUrl;
            headers['Authorization'] = 'Bearer lm-studio';
            body = {
                model: 'local-model',
                messages: apiMessages,
                max_tokens: config.maxTokens,
                temperature: config.temperature,
                stream: config.stream,
            };
            log('Attempting local LM Studio endpoint');
        }

        // Try streaming request
        if (config.stream) {
            try {
                return await streamingRequest(apiUrl, headers, body, userMessage, onChunk);
            } catch (err) {
                error('Streaming failed, falling back to non-streaming', err);
                config.stream = false;
                body.stream = false;
                return await nonStreamingRequest(apiUrl, headers, body, userMessage);
            }
        } else {
            return await nonStreamingRequest(apiUrl, headers, body, userMessage);
        }
    }

    async function streamingRequest(url, headers, body, userMessage, onChunk) {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: currentAbortController.signal,
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => 'Unknown error');
            throw new Error(`API Error ${response.status}: ${errText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === 'data: [DONE]') continue;
                if (!trimmed.startsWith('data: ')) continue;

                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) {
                        fullResponse += delta;
                        if (onChunk) onChunk(delta, fullResponse);
                    }
                } catch (e) {
                    // Skip malformed SSE chunks
                }
            }
        }

        return fullResponse;
    }

    async function nonStreamingRequest(url, headers, body, userMessage) {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: currentAbortController?.signal,
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => 'Unknown error');
            throw new Error(`API Error ${response.status}: ${errText}`);
        }

        const json = await response.json();
        return json.choices?.[0]?.message?.content || '(No response received)';
    }

    // ─── Quick Replies (No API Needed) ──────────────────────

    function handleQuickReply(userInput) {
        const input = userInput.toLowerCase().trim();
        const ctx = bookContext;

        // Chapter list
        if (input.includes('chapter') && (input.includes('list') || input.includes('all') || input.includes('what'))) {
            if (!ctx || !ctx.chapters) return null;
            let html = '<div class="qa-chapter-list"><strong>📚 All Chapters:</strong><ul>';
            ctx.chapters.forEach(ch => {
                html += `<li><strong>${ch.title}</strong> <span class="qa-meta">(${ch.readingTime})</span></li>`;
            });
            html += '</ul></div>';
            return { text: `Here are all ${ctx.chapters.length} chapters in the book:`, html };
        }

        // Persona info
        if (input.includes('persona') || input.includes('path') || input.includes('who')) {
            if (!ctx || !ctx.personas) return null;
            let html = '<div class="qa-persona-list"><strong>🎯 Reading Personas:</strong><ul>';
            ctx.personas.forEach(p => {
                const isCurrent = ctx.currentPersona && ctx.currentPersona.id === p.id;
                html += `<li>${isCurrent ? '✅ ' : ''}<strong>${p.label}</strong>: ${p.description}</li>`;
            });
            html += '</ul>';
            if (ctx.currentPersona) {
                html += `<p class="qa-current"><em>Your current path: <strong>${ctx.currentPersona.label}</strong></em></p>`;
            }
            html += '</div>';
            return { text: 'The book offers three personalized reading paths:', html };
        }

        // Reading time
        if (input.includes('long') || input.includes('reading time') || input.includes('how long')) {
            if (!ctx || !ctx.chapters) return null;
            const totalMins = ctx.chapters.reduce((sum, ch) => {
                const mins = parseInt(ch.readingTime) || 0;
                return sum + mins;
            }, 0);
            const hours = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            let timeStr = '';
            if (hours > 0) timeStr += `${hours}h `;
            timeStr += `${mins}min`;
            return { text: `The full book takes approximately ${timeStr} to read. Each persona path curates a subset of chapters for a shorter, more focused experience.` };
        }

        // Help / commands
        if (input.includes('help') || input.includes('command') || input.includes('what can you')) {
            return {
                text: "Here's what I can do for you:",
                html: `<div class="qa-help-list">
<strong>🤖 Qwen Agent Commands:</strong>
<ul>
<li><strong>Ask about any chapter</strong> — "Tell me about Chapter 3"</li>
<li><strong>Get recommendations</strong> — "What should I read first?"</li>
<li><strong>Compare concepts</strong> — "How does Tensor Truth relate to RAG?"</li>
<li><strong>Practical advice</strong> — "How do I apply the 90-day playbook?"</li>
<li><strong>List chapters/personas</strong> — "Show all chapters"</li>
<li><strong>Deep dive</strong> — "Explain the SaaSpocalypse in detail"</li>
<li><strong>Reading plan</strong> — "Create a 2-week reading schedule"</li>
</ul>
<p><em>I know the entire book. Ask me anything! 🚀</em></p>
</div>`
            };
        }

        // Current persona details
        if ((input.includes('my persona') || input.includes('my path')) && ctx?.currentPersona) {
            const p = ctx.currentPersona;
            return {
                text: `You're reading as the **${p.label}** persona.`,
                html: `<div class="qa-my-persona">
<strong>Your Path: ${p.label}</strong>
<p>${p.description}</p>
<strong>Key Takeaways:</strong>
<ul>${(p.keyTakeaways || []).map(t => `<li>${t}</li>`).join('')}</ul>
<strong>Critical Chapters:</strong>
<ul>${(p.criticalChapters || []).map(c => `<li>${c}</li>`).join('')}</ul>
</div>`
            };
        }

        return null; // No quick reply match — needs API
    }

    // ─── Message Handling ───────────────────────────────────

    async function sendMessage(userInput) {
        if (!userInput.trim() || isStreaming) return;

        // Add user message bubble
        addMessageBubble('user', userInput);

        // Save to history
        conversationHistory.push({ role: 'user', content: userInput });

        // Check for quick replies first
        const quickReply = handleQuickReply(userInput);
        if (quickReply) {
            // Small delay for natural feel
            setTimeout(() => {
                addMessageBubble('assistant', quickReply.text, quickReply.html);
                conversationHistory.push({
                    role: 'assistant',
                    content: quickReply.text + (quickReply.html || '')
                });
            }, 300);
            return;
        }

        // Need API call
        isStreaming = true;
        updateUIState('streaming');

        const assistantMsgId = generateId();
        addMessageBubble('assistant', '', null, assistantMsgId);

        currentAbortController = new AbortController();

        try {
            let fullResponse = '';

            await callQwenAPI(userInput, (chunk, accumulated) => {
                fullResponse = accumulated;
                updateMessageBubble(assistantMsgId, accumulated);
            });

            if (!fullResponse) {
                fullResponse = await callQwenAPI(userInput); // fallback non-streaming
            }

            updateMessageBubble(assistantMsgId, fullResponse, true); // final render
            conversationHistory.push({ role: 'assistant', content: fullResponse });

        } catch (err) {
            const errMsg = err.name === 'AbortError'
               ? '❌ Request cancelled.'
                : `⚠️ Error: ${err.message}. Please check your API key or connection.`;
            updateMessageBubble(assistantMsgId, errMsg);
            error('API call failed', err);
        } finally {
            isStreaming = false;
            currentAbortController = null;
            updateUIState('ready');
            if (inputField) inputField.focus();
        }
    }

    // ─── UI Rendering ───────────────────────────────────────

    function createWidget() {
        // Prevent double-init
        if (document.getElementById('qwen-agent-widget')) {
            log('Widget already initialized');
            return;
        }

        const posClass = config.position === 'bottom-left' ? 'qa-bottom-left' : 'qa-bottom-right';
        const themeClass = config.theme === 'light' ? 'qa-light' :
            config.theme === 'auto' ? 'qa-auto' : 'qa-dark';

        // Main container
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'qwen-agent-widget';
        widgetContainer.className = `qa-widget ${posClass} ${themeClass}`;

        // Chat Panel
        widgetContainer.innerHTML = `
    <!-- Chat Panel -->
    <div class="qa-panel" id="qaPanel" style="display:none;">
      <!-- Header -->
      <div class="qa-header">
        <div class="qa-header-left">
          <div class="qa-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
              <path d="M12 6v4l2 2"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div class="qa-header-text">
            <div class="qa-title">Qwen Agent <span class="qa-badge">AI</span></div>
            <div class="qa-status" id="qaStatus">● Ready</div>
          </div>
        </div>
        <div class="qa-header-actions">
          <button class="qa-icon-btn" id="qaClearBtn" title="Clear conversation">✕</button>
          <button class="qa-icon-btn" id="qaCloseBtn" title="Minimize">−</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="qa-messages" id="qaMessages"></div>

      <!-- Welcome message area -->
      <div class="qa-welcome" id="qaWelcome">
        <div class="qa-welcome-icon">🧠</div>
        <div class="qa-welcome-title">Smart Book AI Companion</div>
        <div class="qa-welcome-sub">Powered by Qwen3 • Knows every chapter</div>
        <div class="qa-suggestions" id="qaSuggestions"></div>
      </div>

      <!-- Input Area -->
      <div class="qa-input-area">
        <div class="qa-input-row">
          <textarea
            id="qaInput"
            placeholder="Ask about any chapter..."
            rows="1"
            autofocus
          ></textarea>
          <button class="qa-send-btn" id="qaSendBtn" disabled>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
          <button class="qa-stop-btn" id="qaStopBtn" style="display:none;">■ Stop</button>
        </div>
        <div class="qa-footer">
          <span class="qa-footer-text">Qwen may make mistakes. Verify important info.</span>
        </div>
      </div>
    </div>

    <!-- Toggle Button -->
    <button class="qa-toggle" id="qaToggle" title="Open Qwen Agent">
      <div class="qa-toggle-inner">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" stroke-width="1.8">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
          <path d="M12 6v4l2 2"/>
          <circle cx="12" cy="16" r="1.5" fill="white"/>
        </svg>
        <span class="qa-pulse-dot"></span>
      </div>
    </button>
    `;

        document.body.appendChild(widgetContainer);

        // Cache references
        chatPanel = document.getElementById('qaPanel');
        messagesContainer = document.getElementById('qaMessages');
        inputField = document.getElementById('qaInput');
        sendButton = document.getElementById('qaSendBtn');
        toggleButton = document.getElementById('qaToggle');
        statusIndicator = document.getElementById('qaStatus');

        // Attach events
        attachEvents();

        // Show welcome suggestions
        populateSuggestions();

        // Inject styles
        injectStyles();

        log('Widget created successfully');
    }

    function attachEvents() {
        // Toggle panel
        toggleButton.addEventListener('click', togglePanel);
        document.getElementById('qaCloseBtn').addEventListener('click', togglePanel);

        // Clear conversation
        document.getElementById('qaClearBtn').addEventListener('click', clearConversation);

        // Send message
        sendButton.addEventListener('click', () => {
            if (inputField.value.trim()) sendMessage(inputField.value.trim());
        });

        // Input handling
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputField.value.trim() && !isStreaming) {
                    sendMessage(inputField.value.trim());
                }
            }
        });

        inputField.addEventListener('input', () => {
            sendButton.disabled = !inputField.value.trim() || isStreaming;
            // Auto-resize textarea
            inputField.style.height = 'auto';
            inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
        });

        // Stop button
        document.getElementById('qaStopBtn').addEventListener('click', () => {
            if (currentAbortController) {
                currentAbortController.abort();
            }
        });

        // Drag support
        if (config.draggable) {
            makeDraggable(document.querySelector('.qa-header'));
        }
    }

    function togglePanel() {
        isOpen = !isOpen;
        chatPanel.style.display = isOpen ? 'flex' : 'none';
        toggleButton.style.display = isOpen ? 'none' : 'flex';
        toggleButton.setAttribute('aria-expanded', isOpen);

        if (isOpen) {
            inputField.focus();
            // Hide welcome once there are messages
            if (conversationHistory.length > 0) {
                const welcome = document.getElementById('qaWelcome');
                if (welcome) welcome.style.display = 'none';
            }
        }
    }

    function clearConversation() {
        conversationHistory = [];
        messagesContainer.innerHTML = '';
        const welcome = document.getElementById('qaWelcome');
        if (welcome) welcome.style.display = '';
        log('Conversation cleared');
    }

    function populateSuggestions() {
        const container = document.getElementById('qaSuggestions');
        if (!container) return;

        const suggestions = [
            { icon: '📖', text: 'Summarize Chapter 1' },
            { icon: '🎯', text: 'Which chapters should I read first?' },
            { icon: '💡', text: 'Explain Tensor Truth framework' },
            { icon: '⏱️', text: 'How long is the full book?' },
        ];

        container.innerHTML = suggestions.map(s =>
            `<button class="qa-suggestion-btn">${s.icon} ${escapeHtml(s.text)}</button>`
        ).join('');

        container.querySelectorAll('.qa-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent.trim().slice(2).trim(); // strip emoji+space
                sendMessage(text);
            });
        });
    }

    function addMessageBubble(role, text, htmlContent, msgId) {
        const id = msgId || generateId();
        const div = document.createElement('div');
        div.className = `qa-msg qa-msg-${role}`;
        div.id = id;

        const avatar = role === 'user' ? '👤' : (
            `<div class="qa-bot-avatar"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${config.primaryColor}" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 6v4l2 2"/></svg></div>`
        );

        const timeLabel = formatTime();
        const contentHtml = htmlContent || (text ? escapeHtml(text).replace(/\n/g, '<br>') : '');

        div.innerHTML = `
      <div class="qa-msg-avatar">${avatar}</div>
      <div class="qa-msg-body">
        <div class="qa-msg-content" id="${id}-content">${contentHtml || '<span class="qa-typing">...</span>'}</div>
        <div class="qa-msg-time">${timeLabel}</div>
      </div>
    `;

        messagesContainer.appendChild(div);
        scrollToBottom();

        // Hide welcome on first real message
        if (role === 'user') {
            const welcome = document.getElementById('qaWelcome');
            if (welcome) welcome.style.display = 'none';
        }

        return id;
    }

    function updateMessageBubble(msgId, content, isFinal) {
        const el = document.getElementById(`${msgId}-content`);
        if (!el) return;

        if (isFinal) {
            // Render markdown-like formatting
            el.innerHTML = renderFormatted(content);
            el.classList.remove('qa-streaming');
        } else {
            el.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');
            el.classList.add('qa-streaming');
        }

        scrollToBottom();
    }

    function renderFormatted(text) {
        // Basic markdown-to-HTML rendering
        let html = escapeHtml(text);

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Code
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        // Headers
        html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
        // Lists
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)/g, '<ul>$1</ul>\n');
        // Numbered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>');
        html = html.replace(/(<oli>.*<\/oli>\n?)/g, '<ol>$1</ol>\n').replace(/<\/?oli>/g, '<li>');
        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        return `<p>${html}</p>`;
    }

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function updateUIState(state) {
        if (!statusIndicator || !sendButton || !inputField) return;

        switch (state) {
            case 'streaming':
                statusIndicator.textContent = '● Thinking...';
                statusIndicator.style.color = config.primaryColor;
                sendButton.style.display = 'none';
                document.getElementById('qaStopBtn').style.display = 'flex';
                inputField.disabled = true;
                break;
            case 'ready':
            default:
                statusIndicator.textContent = '● Ready';
                statusIndicator.style.color = '';
                sendButton.style.display = 'flex';
                sendButton.disabled = !inputField.value.trim();
                document.getElementById('qaStopBtn').style.display = 'none';
                inputField.disabled = false;
                break;
        }
    }

    // Make header draggable
    function makeDraggable(handle) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        handle.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            const rect = widgetContainer.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            widgetContainer.classList('qa-dragging');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            widgetContainer.style.left = (startLeft + dx) + 'px';
            widgetContainer.style.top = (startTop + dy) + 'px';
            widgetContainer.style.right = 'auto';
            widgetContainer.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            widgetContainer.classList.remove('qa-dragging');
        });
    }

    // ─── CSS Styles ──────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('qwen-agent-styles')) return;

        const css = `
/* ═══════════════════════════════════════════
   Qwen Agent Widget Styles
   ═══════════════════════════════════════════ */
.qa-widget {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  position: fixed;
  z-index: 99999;
  bottom: 20px;
  ${config.position === 'bottom-left' ? 'left' : 'right'}: 20px;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
}

/* ── Toggle Button ────────────────────────── */
.qa-toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, ${config.primaryColor}, #D4551F);
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255,107,53,0.4), 0 0 0 0 rgba(255,107,53,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s, box-shadow 0.25s;
  animation: qa-pulse-ring 2.5s ease-out infinite;
}
.qa-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(255,107,53,0.55), 0 0 0 8px rgba(255,107,53,0.08);
}
.qa-toggle-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qa-pulse-dot {
  position: absolute;
  top: -2px; right: -2px;
  width: 12px; height: 12px;
  background: #10B981;
  border-radius: 50%;
  border: 2px solid var(--bg, #060914);
  animation: qa-blink 2s ease-in-out infinite;
}
@keyframes qa-pulse-ring {
  0%   { box-shadow: 0 4px 20px rgba(255,107,53,0.4), 0 0 0 0 rgba(255,107,53,0.2); }
  50%  { box-shadow: 0 4px 20px rgba(255,107,53,0.4), 0 0 0 12px rgba(255,107,53,0.05); }
  100% { box-shadow: 0 4px 20px rgba(255,107,53,0.4), 0 0 0 0 rgba(255,107,53,0.2); }
}
@keyframes qa-blink {
  0%,100% { opacity: 1; transform: scale(1); }
  50%     { opacity: 0.5; transform: scale(0.85); }
}

/* ── Panel ────────────────────────────────── */
.qa-panel {
  width: 400px;
  max-width: calc(100vw - 40px);
  height: 560px;
  max-height: calc(100vh - 100px);
  background: rgba(12, 14, 28, 0.97);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,53,0.08);
  animation: qa-panel-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes qa-panel-in {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Header ───────────────────────────────── */
.qa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
  cursor: default;
}
.qa-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.qa-avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
.qa-avatar svg { width: 18px; height: 18px; }
.qa-header-text { display: flex; flex-direction: column; gap: 1px; }
.qa-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}
.qa-badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: ${config.primaryColor};
  color: white;
  margin-left: 5px;
  vertical-align: middle;
  letter-spacing: 0.5px;
}
.qa-status {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.3px;
  transition: color 0.3s;
}
.qa-header-actions {
  display: flex;
  gap: 4px;
}
.qa-icon-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.4);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.qa-icon-btn:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

/* ── Messages ─────────────────────────────── */
.qa-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.qa-messages::-webkit-scrollbar { width: 4px; }
.qa-messages::-webkit-scrollbar-track { background: transparent; }
.qa-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

/* ── Message Bubbles ──────────────────────── */
.qa-msg {
  display: flex;
  gap: 8px;
  max-width: 92%;
  animation: qa-msg-in 0.3s ease-out;
}
@keyframes qa-msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.qa-msg-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.qa-msg-avatar {
  flex-shrink: 0;
  font-size: 1.1rem;
  line-height: 1;
}
.qa-msg-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.qa-msg-content {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.6;
  word-break: break-word;
}
.qa-msg-user .qa-msg-content {
  background: linear-gradient(135deg, ${config.primaryColor}, #E85A28);
  color: white;
  border-bottom-right-radius: 4px;
}
.qa-msg-assistant .qa-msg-content {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.88);
  border-bottom-left-radius: 4px;
}
.qa-msg-time {
  font-size: 0.62rem;
  color: rgba(255,255,255,0.22);
  padding: 0 4px;
}
.qa-msg-user .qa-msg-time { text-align: right; }

/* Streaming indicator */
.qa-streaming::after {
  content: '▊';
  animation: qa-cursor 0.7s steps(2) infinite;
  color: ${config.primaryColor};
  margin-left: 2px;
}
@keyframes qa-cursor {
  50% { opacity: 0; }
}

/* Typing dots */
.qa-typing {
  display: inline-flex;
  gap: 4px;
  color: rgba(255,255,255,0.3);
}
.qa-typing::before,
.qa-typing::after {
  content: '';
  width: 5px; height: 5px;
  border-radius: 50%;
  background: ${config.primaryColor};
  animation: qa-type-dot 1.2s ease-in-out infinite;
}
.qa-typing::after { animation-delay: 0.2s; }
@keyframes qa-type-dot {
  0%,100% { opacity: 0.3; transform: scale(0.8); }
  50%     { opacity: 1; transform: scale(1.1); }
}

/* Formatted content styles */
.qa-msg-content h2, .qa-msg-content h3, .qa-msg-content h4 {
  margin: 0.5em 0 0.3em;
  color: #fff;
}
.qa-msg-content strong { color: #fff; }
.qa-msg-content code {
  background: rgba(255,107,53,0.12);
  color: ${config.primaryColor};
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.82em;
  font-family: 'SF Mono', Consolas, monospace;
}
.qa-msg-content ul, .qa-msg-content ol {
  margin: 0.4em 0;
  padding-left: 1.2em;
}
.qa-msg-content li { margin-bottom: 2px; }
.qa-msg-content p { margin: 0.3em 0; }

/* ── Welcome Screen ───────────────────────── */
.qa-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}
.qa-welcome-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  animation: qa-float 3s ease-in-out infinite;
}
@keyframes qa-float {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-8px); }
}
.qa-welcome-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  color: #fff;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.qa-welcome-sub {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  margin-bottom: 18px;
}
.qa-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  max-width: 320px;
}
.qa-suggestion-btn {
  padding: 7px 13px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.65);
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.qa-suggestion-btn:hover {
  background: rgba(255,107,53,0.12);
  border-color: rgba(255,107,53,0.3);
  color: ${config.primaryColor};
}

/* ── Input Area ───────────────────────────── */
.qa-input-area {
  padding: 12px 14px 14px;
  border-top: 1px solid rgba(255,255,255,0.07);
  background: rgba(0,0,0,0.2);
  flex-shrink: 0;
}
.qa-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 6px 8px;
  transition: border-color 0.2s;
}
.qa-input-row:focus-within {
  border-color: rgba(255,107,53,0.4);
  box-shadow: 0 0 0 3px rgba(255,107,53,0.08);
}
#qaInput {
  flex: 1;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 0.85rem;
  font-family: inherit;
  resize: none;
  outline: none;
  max-height: 120px;
  min-height: 24px;
  line-height: 1.4;
  padding: 2px 4px;
}
#qaInput::placeholder {
  color: rgba(255,255,255,0.25);
}
.qa-send-btn {
  width: 34px; height: 34px;
  border-radius: 8px;
  border: none;
  background: ${config.primaryColor};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.15s;
}
.qa-send-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.05);
}
.qa-send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.qa-stop-btn {
  width: 34px; height: 34px;
  border-radius: 8px;
  border: none;
  background: #EF4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.qa-stop-btn:hover { opacity: 0.85; }

.qa-footer {
  margin-top: 6px;
  text-align: center;
}
.qa-footer-text {
  font-size: 0.62rem;
  color: rgba(255,255,255,0.15);
  letter-spacing: 0.2px;
}

/* ── Special Content Blocks ────────────────── */
.qa-chapter-list ul, .qa-persona-list ul, .qa-help-list ul {
  text-align: left;
  margin-top: 8px;
  padding-left: 1.1em;
}
.qa-chapter-list li, .qa-persona-list li, .qa-help-list li {
  margin-bottom: 4px;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.75);
}
.qa-meta {
  font-size: 0.72rem !important;
  color: rgba(255,255,255,0.35) !important;
}
.qa-current {
  margin-top: 8px;
  font-size: 0.82rem;
}
.qa-my-persona {
  text-align: left;
  margin-top: 8px;
}
.qa-my-persona ul {
  padding-left: 1.1em;
  margin-top: 4px;
}
.qa-my-persona li {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.75);
  margin-bottom: 2px;
}

/* ── Position Variants ────────────────────── */
.qa-bottom-left {
  left: 20px;
  right: auto;
}
.qa-bottom-right {
  right: 20px;
  left: auto;
}

/* ── Light Theme Override ─────────────────── */
.qa-light .qa-panel {
  background: rgba(255,255,255,0.98);
  border-color: rgba(0,0,0,0.08);
  color: #1a1a1a;
}
.qa-light .qa-msg-assistant .qa-msg-content {
  background: #f5f5f5;
  border-color: rgba(0,0,0,0.06);
  color: #333;
}
.qa-light .qa-header {
  background: rgba(0,0,0,0.03);
  border-bottom-color: rgba(0,0,0,0.06);
}
.qa-light .qa-input-row {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.1);
}
.qa-light #qaInput { color: #1a1a1a; }
.qa-light .qa-title { color: #1a1a1a; }
.qa-light .qa-welcome-sub { color: rgba(0,0,0,0.4); }
.qa-light .qa-suggestion-btn {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.1);
  color: rgba(0,0,0,0.55);
}

/* ── Responsive ───────────────────────────── */
@media (max-width: 480px) {
  .qa-panel {
    width: calc(100vw - 20px);
    height: calc(100vh - 80px);
    max-height: calc(100vh - 80px);
    border-radius: 14px;
  }
  .qa-toggle {
    width: 50px; height: 50px;
  }
  .qa-widget {
    bottom: 10px;
    ${config.position === 'bottom-left' ? 'left' : 'right'}: 10px;
  }
}
`;

        const styleEl = document.createElement('style');
        styleEl.id = 'qwen-agent-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    // ─── Public API ─────────────────────────────────────────

    /**
     * Initialize the Qwen Agent widget
     * @param {Object} opts - Configuration options
     * @param {string} opts.apiKey - DashScope/OpenRouter API key
     * @param {string} opts.apiUrl - Custom API endpoint
     * @param {string} opts.model - Model name
     * @param {string} opts.position - 'bottom-right' or 'bottom-left'
     * @param {string} opts.theme - 'dark', 'light', or 'auto'
     * @param {boolean} opts.showWelcome - Show welcome screen
     * @param {number} opts.maxTokens - Max response tokens
     */
    function init(opts = {}) {
        // Merge options
        config = { ...DEFAULTS, ...opts };

        // Try to build book context immediately
        buildBookContext();

        // If BOOK_DATA not loaded yet, wait for it
        if (typeof BOOK_DATA === 'undefined') {
            const tries = [100, 500, 1500, 3000];
            tries.forEach(delay => {
                setTimeout(() => {
                    if (!bookContext && typeof BOOK_DATA !== 'undefined') {
                        buildBookContext();
                    }
                }, delay);
            });
        }

        // Also listen for persona changes
        try {
            const origSetItem = localStorage.setItem.bind(localStorage);
            // We'll just re-detect on each message instead of monkey-patching
        } catch (e) { /* ignore */ }

        // Create the widget when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => createWidget());
        } else {
            createWidget();
        }

        log(`Qwen Agent initialized (model: ${config.model})`);
        return QwenAgent;
    }

    /** Open the chat panel */
    function open() {
        if (!isOpen) togglePanel();
    }

    /** Close the chat panel */
    function close() {
        if (isOpen) togglePanel();
    }

    /** Programmatically send a message */
    function ask(question) {
        if (!widgetContainer) {
            console.warn('[QwenAgent] Call init() before ask()');
            return Promise.resolve(null);
        }
        if (!isOpen) togglePanel();
        return sendMessage(question);
    }

    /** Update configuration after init */
    function configure(opts) {
        Object.assign(config, opts);
        log('Configuration updated', opts);
    }

    /** Get current state */
    function getState() {
        return {
            isOpen,
            isStreaming,
            messageCount: conversationHistory.length,
            hasBookContext: !!bookContext,
            persona: currentPersona || detectPersona(),
            config: { ...config, apiKey: config.apiKey ? '***set***' : null },
        };
    }

    /** Destroy the widget completely */
    function destroy() {
        if (widgetContainer) {
            widgetContainer.remove();
            widgetContainer = null;
        }
        const styles = document.getElementById('qwen-agent-styles');
        if (styles) styles.remove();
        log('Widget destroyed');
    }

    // Expose public API
    const QwenAgent = {
        init,
        open,
        close,
        ask,
        configure,
        getState,
        destroy,
        VERSION: '1.0.0',
    };

    // Global export
    window.QwenAgent = QwenAgent;

    // Auto-init if data attribute present on script tag
    // Or if window.QWEN_AUTO_INIT is set
    if (window.QWEN_AUTO_INIT) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => init(window.QWEN_CONFIG || {}));
        } else {
            init(window.QWEN_CONFIG || {});
        }
    }

})();
