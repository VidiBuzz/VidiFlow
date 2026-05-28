const OpenAI = require('openai');

class QwenClient {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    });
    this.model = process.env.QWEN_MODEL || 'qwen3.6-plus';
  }

  async chat(messages, options = {}) {
    const {
      enableThinking = false,
      stream = false,
      temperature = 0.7,
      maxTokens = 4096,
      ...restOptions
    } = options;

    const params = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
      ...restOptions,
    };

    if (enableThinking) {
      params.extra_body = { enable_thinking: true };
    }

    return this.client.chat.completions.create(params);
  }

  async chatStream(messages, options = {}) {
    return this.chat(messages, { ...options, stream: true });
  }

  async complete(prompt, options = {}) {
    const messages = [
      { role: 'user', content: prompt },
    ];
    return this.chat(messages, options);
  }
}

module.exports = { QwenClient };
