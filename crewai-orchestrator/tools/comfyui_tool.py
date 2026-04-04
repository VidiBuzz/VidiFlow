"""
ComfyUI Integration Tool for CrewAI
=====================================
Provides tools for generating video and images using ComfyUI.
"""

import httpx
import json
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
import uuid


class ComfyUIConfig(BaseModel):
    """ComfyUI connection configuration."""
    url: str = Field(default="http://localhost:8188")
    api_key: Optional[str] = Field(default=None)


class ComfyUIGenerateTool(BaseTool):
    """Tool for generating images/videos with ComfyUI."""
    name: str = "comfyui_generate"
    description: str = """
    Generate images or videos using ComfyUI. Use this to:
    - Create visual content for blog posts
    - Generate video thumbnails
    - Produce promotional graphics
    - Create style-consistent visuals
    
    Provide a prompt and optional workflow ID.
    """
    
    config: ComfyUIConfig = Field(default_factory=ComfyUIConfig)
    
    def _run(
        self,
        prompt: str,
        workflow_id: Optional[str] = None,
        width: int = 1024,
        height: int = 576,
        steps: int = 25,
        cfg: float = 7.0
    ) -> str:
        """
        Generate an image with ComfyUI.
        
        Args:
            prompt: Text description of the image to generate
            workflow_id: Optional workflow ID to use
            width: Image width (default: 1024)
            height: Image height (default: 576)
            steps: Number of sampling steps
            cfg: CFG scale
            
        Returns:
            JSON string with generation result
        """
        headers = {
            "Content-Type": "application/json"
        }
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"
        
        # Generate unique prompt ID
        prompt_id = str(uuid.uuid4())
        
        # Build basic workflow
        workflow = {
            "3": {
                "inputs": {
                    "seed": 156680208700286,
                    "steps": steps,
                    "cfg": cfg,
                    "sampler_name": "euler",
                    "scheduler": "normal",
                    "denoise": 1,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0]
                },
                "class_type": "KSampler",
                "_meta": {"title": "KSampler"}
            },
            "4": {
                "inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"},
                "class_type": "CheckpointLoaderSimple",
                "_meta": {"title": "Load Checkpoint"}
            },
            "5": {
                "inputs": {
                    "width": width,
                    "height": height,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage",
                "_meta": {"title": "Empty Latent Image"}
            },
            "6": {
                "inputs": {"text": prompt, "clip": ["4", 1]},
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Positive)"}
            },
            "7": {
                "inputs": {
                    "text": "bad quality, blurry, distorted",
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Negative)"}
            },
            "8": {
                "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
                "class_type": "VAEDecode",
                "_meta": {"title": "VAE Decode"}
            },
            "9": {
                "inputs": {
                    "filename_prefix": "vidismart",
                    "images": ["8", 0]
                },
                "class_type": "SaveImage",
                "_meta": {"title": "Save Image"}
            }
        }
        
        # Use custom workflow if provided
        if workflow_id:
            workflow = {"workflow_id": workflow_id}
        
        payload = {
            "prompt": workflow,
            "client_id": prompt_id
        }
        
        try:
            response = httpx.post(
                f"{self.config.url}/prompt",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            
            result = response.json()
            return json.dumps({
                "status": "success",
                "prompt_id": result.get("prompt_id"),
                "workflow": "default" if not workflow_id else workflow_id,
                "message": "Generation started. Use comfyui_status to check progress."
            })
            
        except Exception as e:
            return json.dumps({
                "status": "error",
                "message": f"Error generating with ComfyUI: {str(e)}"
            })


class ComfyUIStatusTool(BaseTool):
    """Tool for checking ComfyUI generation status."""
    name: str = "comfyui_status"
    description: str = """
    Check the status of a ComfyUI generation job.
    Use this to monitor progress and retrieve generated images.
    """
    
    config: ComfyUIConfig = Field(default_factory=ComfyUIConfig)
    
    def _run(self, prompt_id: str) -> str:
        """
        Check generation status.
        
        Args:
            prompt_id: The prompt ID returned from generation
            
        Returns:
            JSON string with status and image URLs if complete
        """
        headers = {}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"
        
        try:
            response = httpx.get(
                f"{self.config.url}/history/{prompt_id}",
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            
            history = response.json()
            
            if prompt_id in history:
                outputs = history[prompt_id].get("outputs", {})
                images = []
                
                for node_id, node_output in outputs.items():
                    if "images" in node_output:
                        for img in node_output["images"]:
                            img_url = f"{self.config.url}/view?filename={img['filename']}&subfolder={img.get('subfolder', '')}&type={img.get('type', 'output')}"
                            images.append(img_url)
                
                return json.dumps({
                    "status": "complete",
                    "images": images,
                    "message": f"Generated {len(images)} image(s)"
                })
            else:
                return json.dumps({
                    "status": "pending",
                    "message": "Generation still in progress..."
                })
                
        except Exception as e:
            return json.dumps({
                "status": "error",
                "message": f"Error checking status: {str(e)}"
            })


class ComfyUIVideoTool(BaseTool):
    """Tool for generating videos with ComfyUI."""
    name: str = "comfyui_video"
    description: str = """
    Generate videos using ComfyUI with Wan2.2 or similar video models.
    Use this to create:
    - Marketing videos
    - Product demos
    - Animated content
    - Social media clips
    """
    
    config: ComfyUIConfig = Field(default_factory=ComfyUIConfig)
    
    def _run(
        self,
        prompt: str,
        duration: int = 4,
        fps: int = 24,
        width: int = 1024,
        height: int = 576
    ) -> str:
        """
        Generate a video with ComfyUI.
        
        Args:
            prompt: Text description of the video
            duration: Video duration in seconds
            fps: Frames per second
            width: Video width
            height: Video height
            
        Returns:
            JSON string with generation result
        """
        # Similar to generate but with video workflow
        # This is a placeholder - actual workflow depends on installed models
        return json.dumps({
            "status": "not_implemented",
            "message": "Video generation requires Wan2.2 model. Install via ComfyUI manager.",
            "prompt": prompt,
            "settings": {
                "duration": duration,
                "fps": fps,
                "width": width,
                "height": height
            }
        })


# Factory function
def get_comfyui_tools(api_key: Optional[str] = None) -> List[BaseTool]:
    """Get all ComfyUI tools configured with API key."""
    config = ComfyUIConfig(api_key=api_key)
    
    return [
        ComfyUIGenerateTool(config=config),
        ComfyUIStatusTool(config=config),
        ComfyUIVideoTool(config=config),
    ]
