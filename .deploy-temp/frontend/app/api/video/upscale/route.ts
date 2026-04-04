import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import path from "path";

const OUTPUT_DIR = "/mnt/m/code/vidismart/VidiFlow/outputs";
const COMFYUI_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

interface WorkflowNode {
  id: string;
  class_type: string;
  inputs: Record<string, any>;
}

interface Workflow {
  last_node: string;
  nodes: WorkflowNode[];
}

function createUpscaleWorkflow(
  filename: string,
  outputName: string,
  scale: number,
  model: string
): Workflow {
  const scaleFactor = scale;

  if (model === "seedvr2") {
    return {
      last_node: "SaveVideo",
      nodes: [
        {
          id: "VHS_LoadVideo",
          class_type: "VHS_LoadVideo",
          inputs: {
            video: filename,
            force_rate: null,
            force_size: "Disabled",
            skip_first_frames: 0,
            frame_load_cap: null,
            start_frame: 0,
          },
        },
        {
          id: "SeedVR2Upscaler",
          class_type: "SeedVR2Upscaler",
          inputs: {
            images: ["VHS_LoadVideo", 0],
            scale: scaleFactor,
            model: "seedvr2_4.safetensors",
          },
        },
        {
          id: "SaveVideo",
          class_type: "SaveVideo",
          inputs: {
            images: ["SeedVR2Upscaler", 0],
            filename_prefix: outputName,
            format: "mp4",
            fps: null,
            codec: "libx264",
            pixel_format: "yuv420p",
          },
        },
      ],
    };
  }

  return {
    last_node: "SaveVideo",
    nodes: [
      {
        id: "VHS_LoadVideo",
        class_type: "VHS_LoadVideo",
        inputs: {
          video: filename,
        },
      },
      {
        id: "ImageUpscaleWithModel",
        class_type: "ImageUpscaleWithModel",
        inputs: {
          images: ["VHS_LoadVideo", 0],
          model_name: model === "nmkd" ? "NMKD-Siax_200k.pth" : "4x-NMKD-Siax_200k.pth",
        },
      },
      {
        id: "SaveVideo",
        class_type: "SaveVideo",
        inputs: {
          images: ["ImageUpscaleWithModel", 0],
          filename_prefix: outputName,
          format: "mp4",
        },
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, scale = 2, model = "real_esrgan" } = body;

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }

    const uploadDir = "/mnt/m/code/vidismart/VidiFlow/uploads";
    const videoPath = path.join(uploadDir, filename);

    if (!existsSync(videoPath)) {
      return NextResponse.json({ error: "Video file not found" }, { status: 404 });
    }

    const outputName = `upscaled_${filename.split(".")[0]}`;
    const workflow = createUpscaleWorkflow(filename, outputName, scale, model);

    // Check if ComfyUI is running
    try {
      const comfyuiCheck = await fetch(`${COMFYUI_URL}/system_stats`, {
        method: "GET",
      });

      if (!comfyuiCheck.ok) {
        // ComfyUI not running, return mock response for demo
        console.log("ComfyUI not running, using simulation mode");
        return NextResponse.json({
          success: true,
          prompt_id: `demo_${Date.now()}`,
          message: "Video upscaling started (demo mode)",
          simulation: true,
        });
      }
    } catch (e) {
      // ComfyUI not accessible
      console.log("ComfyUI not accessible, using simulation mode");
      return NextResponse.json({
        success: true,
        prompt_id: `demo_${Date.now()}`,
        message: "Video upscaling started (demo mode - ComfyUI not connected)",
        simulation: true,
      });
    }

    // Queue the prompt with ComfyUI
    const response = await fetch(`${COMFYUI_URL}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!response.ok) {
      throw new Error(`ComfyUI API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.prompt_id) {
      return NextResponse.json({
        success: true,
        prompt_id: result.prompt_id,
        message: "Video upscaling started",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to queue upscaling job" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upscale error:", error);
    return NextResponse.json(
      { error: "Failed to start upscaling" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const promptId = searchParams.get("prompt_id");

  if (!promptId) {
    return NextResponse.json({ error: "No prompt_id provided" }, { status: 400 });
  }

  try {
    const response = await fetch(`${COMFYUI_URL}/history/${promptId}`, {
      method: "GET",
    });

    if (!response.ok) {
      // Return demo status
      return NextResponse.json({
        status: "processing",
        outputs: {},
      });
    }

    const history = await response.json();

    if (history[promptId]) {
      const status = history[promptId];
      const outputs = status.outputs || {};

      // Check if completed
      if (status.status === "completed") {
        const outputFiles = Object.values(outputs).flat().map((output: any) => {
          if (output.images) {
            return output.images.map((img: any) => ({
              filename: img.filename,
              type: img.type,
              subfolder: img.subfolder,
            }));
          }
          return null;
        }).flat().filter(Boolean);

        return NextResponse.json({
          status: "completed",
          outputs: outputFiles,
        });
      }

      return NextResponse.json({
        status: status.status,
        outputs,
      });
    }

    return NextResponse.json({ status: "processing" });
  } catch (error) {
    console.error("Progress check error:", error);
    return NextResponse.json({ status: "processing" });
  }
}
