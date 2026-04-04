import { NextRequest, NextResponse } from "next/server";

const COMFYUI_API_URL = process.env.COMFYUI_API_URL || "http://127.0.0.1:8188";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, width, height, duration } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const workflow = {
      last_node_id: "wan21_t2v_20",
      last_link_id: 200,
      nodes: [
        {
          id: 1,
          type: "Wan21TextToVideo",
          pos: [100, 300],
          properties: {
            required: {
              model: ["wan-2.1-t2v-1-3B.safetensors"],
              text_encoder: ["wan_text_encoder.safetensors"],
            },
          },
          widgets_values: ["wan-2.1-t2v-1-3B.safetensors", "wan_text_encoder.safetensors"],
          color: "#2d5a27",
          bgcolor: "#1a3317",
        },
        {
          id: 2,
          type: "CLIPTextEncode",
          pos: [50, 50],
          properties: {
            required: {
              text: ["Positive prompt"],
            },
          },
          widgets_values: [prompt],
          color: "#5a2727",
          bgcolor: "#331717",
        },
        {
          id: 3,
          type: "CLIPTextEncode",
          pos: [50, 650],
          properties: {
            required: {
              text: ["Negative prompt"],
            },
          },
          widgets_values: [negativePrompt || "blurry, low quality, distorted, jittery, artifacts, watermark, text, noise"],
          color: "#5a2727",
          bgcolor: "#331717",
        },
      ],
      links: {},
      groups: [],
      config: {},
      extra: {},
      version: 0.4,
    };

    const response = await fetch(`${COMFYUI_API_URL}/api/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: workflow,
        client_id: `vidismart_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ComfyUI API error:", errorText);
      throw new Error(`ComfyUI API error: ${response.statusText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      prompt_id: result.prompt_id,
      message: "Video generation started",
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
