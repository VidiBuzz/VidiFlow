"""
VidiFlow Android — FastAPI SSE proxy to Zhipu / Z.AI (GLM).

API key from env ZHIPU_API_KEY only. Never ship this key in the APK.
"""

from __future__ import annotations

import json
import os
from typing import Any, AsyncIterator, List

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "")
# OpenAI-compatible Z.AI / Zhipu coding or paas endpoint (adjust if James pins another base).
ZHIPU_BASE_URL = os.getenv(
    "ZHIPU_BASE_URL",
    "https://api.z.ai/api/paas/v4",
)
MODEL = os.getenv("VIDIFLOW_MODEL", "glm-5.3-flash")

app = FastAPI(title="VidiFlow Chat Proxy", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessageIn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessageIn] = Field(default_factory=list)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "vidiflow-proxy"}


async def _upstream_sse(messages: list[dict[str, str]]) -> AsyncIterator[str]:
    if not ZHIPU_API_KEY:
        # Dev-friendly placeholder so the Compose client can still exercise the pipe.
        yield "data: [VidiFlow] Set ZHIPU_API_KEY in backend/.env then restart uvicorn.\n\n"
        yield "data: [DONE]\n\n"
        return

    headers = {
        "Authorization": f"Bearer {ZHIPU_API_KEY}",
        "Content-Type": "application/json",
    }
    payload: dict[str, Any] = {
        "model": MODEL,
        "messages": messages,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            f"{ZHIPU_BASE_URL.rstrip('/')}/chat/completions",
            headers=headers,
            json=payload,
        ) as resp:
            if resp.status_code >= 400:
                body = await resp.aread()
                yield f"data: [error {resp.status_code}] {body.decode('utf-8', 'replace')}\n\n"
                yield "data: [DONE]\n\n"
                return

            async for line in resp.aiter_lines():
                if not line:
                    continue
                if line.startswith("data:"):
                    data = line[5:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        delta = (
                            chunk.get("choices", [{}])[0]
                            .get("delta", {})
                            .get("content")
                        )
                        if delta:
                            # Re-emit plain token text as SSE for the Android client.
                            yield f"data: {delta}\n\n"
                    except json.JSONDecodeError:
                        continue

    yield "data: [DONE]\n\n"


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest) -> StreamingResponse:
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages required")

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    async def event_gen() -> AsyncIterator[bytes]:
        async for piece in _upstream_sse(messages):
            yield piece.encode("utf-8")

    return StreamingResponse(event_gen(), media_type="text/event-stream")


# Local run (do not auto-start from agents unless James asks):
#   uvicorn app:app --host 0.0.0.0 --port 8080
