import { NextResponse } from 'next/server';

// AI Chat API Route
// Connects to your local AI server (Qwen3 VL, Grok, etc.)

const AI_SERVER_URL = process.env.AI_API_URL || 'http://localhost:11434';

export async function POST(request: Request) {
  try {
    const { message, context = [] } = await request.json();
    
    // Option 1: Connect to local Ollama server
    if (AI_SERVER_URL.includes('localhost') || AI_SERVER_URL.includes('127.0.0.1')) {
      // For production, you'd use a tunnel like ngrok
      // ngrok http 11434 → gives you https://xxx.ngrok.io
      
      const response = await fetch(`${AI_SERVER_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3-vl:30b',
          prompt: message,
          stream: false,
          context: context,
        }),
      });
      
      if (!response.ok) {
        throw new Error('AI server error');
      }
      
      const data = await response.json();
      return NextResponse.json({ 
        response: data.response,
        context: data.context 
      });
    }
    
    // Option 2: Use Grok 4.1 API (xAI)
    if (process.env.XAI_API_KEY) {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-4.1-fast',
          messages: [
            { role: 'system', content: 'You are Vidi AI, an expert in smart stack automation and business process optimization.' },
            { role: 'user', content: message },
          ],
        }),
      });
      
      const data = await response.json();
      return NextResponse.json({ 
        response: data.choices[0].message.content 
      });
    }
    
    // Fallback: Mock response for testing
    return NextResponse.json({
      response: `I'm Vidi AI! You asked: "${message}"\n\nI'd be happy to help you build a smart stack. What's your business type and biggest pain point?`,
      mock: true,
    });
    
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}
