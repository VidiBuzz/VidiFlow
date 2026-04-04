import { NextRequest, NextResponse } from "next/server";

const COMFYUI_API_URL = process.env.COMFYUI_API_URL || "http://127.0.0.1:8188";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, width, height, style } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const styledPrompt = style 
      ? `${prompt}, ${style} style`
      : prompt;

    const workflow = {
      last_node_id: "qwen_layered_15",
      last_link_id: 150,
      nodes: [
        {
          id: 1,
          type: "Qwen2VLLoader",
          pos: [100, 100],
          properties: {},
          widgets_values: ["Qwen/Qwen2-VL-7B-Instruct"],
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
          widgets_values: [styledPrompt],
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
          widgets_values: [negativePrompt || "blurry, low quality, distorted, watermark, text, noise, bad anatomy"],
          color: "#5a2727",
          bgcolor: "#331717",
        },
        {
          id: 4,
          type: "EmptyLatentImage",
          pos: [300, 100],
          properties: {
            required: {
              width: ["Width"],
              height: ["Height"],
              batch_size: ["Batch size"],
            },
          },
          widgets_values: [width || 1024, height || 1024, 1],
          color: "#5a5a27",
          bgcolor: "#333317",
        },
        {
          id: 5,
          type: "KSampler",
          pos: [500, 100],
          properties: {},
          widgets_values: [
            {},
            20,
            8,
            "dpmpp_2m",
            "karras",
            1,
          ],
          color: "#27275a",
          bgcolor: "#171733",
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
      message: "Image generation started",
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
