import { Think } from "@cloudflare/think";
import { Workspace, WorkspaceProxy } from "@cloudflare/computer";
import { createWorkersAI } from "workers-ai-provider";
import { createAITools } from "@cloudflare/computer/tools";
import { tool, type ToolSet } from "ai";
import { z } from "zod";

export { WorkspaceProxy };

export interface Env {
	AGENT: DurableObjectNamespace;
	MEDIA: R2Bucket; // R2 bucket `vidismart` served at https://cdn.vidi.news
	AI: Ai;
}

/**
 * VidiFlowAgent — one Durable Object per agent.
 *
 * Each agent gets its own computer: a SQLite-backed virtual filesystem
 * (Workspace) plus execution backends. The workspace is primed from the
 * Cloudflare R2 media bucket that fronts cdn.vidi.news, so the agent can
 * read, transform, and publish media without leaving Cloudflare.
 *
 * Backends:
 *  - isolate shell (just-bash in a Dynamic Worker): fast file/data/git work
 *  - container (Cloudflare Containers, FUSE mount): ffmpeg, npm, native bins
 *
 * NOTE: @cloudflare/computer is an early preview — casts below absorb
 * type drift between preview packages; verify against the package READMEs
 * when upgrading.
 */
export class VidiFlowAgent extends Think<Env> {
	override workspaceBash = false;

	override workspace = new Workspace({
		storage: this.ctx.storage as any,
		useThink: true,
	}) as any;

	override getModel() {
		// gpt-oss-120b via Workers AI: OpenAI's open-weight agentic model —
		// reasoning + function calling, 128K context. Free-plan compatible
		// (verified live); glm-5.3-flash and other frontier models need the
		// Workers Paid plan. Swap the ID for any AI-SDK-compatible model, or
		// bridge to local LM Studio (Qwen3.6-27B) via the cloudflared tunnel.
		return createWorkersAI({ binding: this.env.AI })(
			"@cf/openai/gpt-oss-120b",
		);
	}

	override getSystemPrompt() {
		return `
You are a VidiFlow media agent.

Your workspace at /workspace is primed with media metadata from the
vidismart R2 bucket (served at https://cdn.vidi.news). Use the file, git,
and shell tools to inspect, transform, and publish media. Prefer the fast
isolate backend for file/data work; only use the container backend when a
task needs a real Linux binary (ffmpeg, npm, etc.).

In your final answer, state what you changed, which commands you ran, and
whether verification passed.`;
	}

	override getTools(): ToolSet {
		const media = this.env.MEDIA;
		return {
			...createAITools({
				workspace: this.workspace,
				shell: {
					defaultBackend: "isolate",
					backends: {
						isolate: {
							description:
								"Fast isolate shell (just-bash). Use for file " +
								"manipulation, data processing, and git work.",
						},
					},
				},
			}),
			listMedia: tool({
				description:
					"List objects in the vidismart R2 bucket (cdn.vidi.news).",
				inputSchema: z.object({
					prefix: z.string().optional(),
					limit: z.number().int().min(1).max(500).optional(),
				}),
				execute: async ({ prefix, limit }) => {
					const res = await media.list({ prefix, limit: limit ?? 50 });
					return res.objects.map((o) => ({
						url: `https://cdn.vidi.news/${o.key}`,
						key: o.key,
						size: o.size,
					}));
				},
			}),
		} as ToolSet;
	}

	/** Internal HTTP surface (called by the Worker router below). */
	override async fetch(request: Request): Promise<Response> {
		// This override bypasses partyserver's standard fetch entry point,
		// so ensure onStart (Think session init) has run first.
		await (this as any).__unsafe_ensureInitialized();

		const url = new URL(request.url);

		if (url.pathname === "/internal/prime" && request.method === "POST") {
			const { mediaPrefix } = (await request.json().catch(() => ({}))) as {
				mediaPrefix?: string;
			};
			const count = await this.prime(mediaPrefix ?? "");
			return Response.json({ primed: count });
		}

		if (url.pathname === "/internal/task" && request.method === "POST") {
			const { prompt } = (await request.json()) as { prompt: string };
			try {
				const turn = await (this as any).runTurn({ input: prompt });
				const parts: Array<{ type: string; text?: string }> =
					turn?.message?.parts ?? [];
				console.log("turn parts:", JSON.stringify(parts).slice(0, 2000));
				const text = parts
					.filter((p) => p.type === "text" && typeof p.text === "string")
					.map((p) => p.text)
					.join("\n");
				return Response.json({ result: text || null });
			} catch (err) {
				console.error("runTurn failed:", err);
				return Response.json({ result: null, error: String(err) }, { status: 500 });
			}
		}

		return super.fetch(request);
	}

	/**
	 * Prime the workspace: pull a manifest of the media bucket so the agent
	 * knows what is available at cdn.vidi.news.
	 */
	async prime(mediaPrefix = "") {
		await this.workspace.fs.mkdir("/workspace", { recursive: true });

		const listed = await this.env.MEDIA.list({ prefix: mediaPrefix, limit: 200 });
		const manifest = listed.objects
			.map((o) => `https://cdn.vidi.news/${o.key}  (${o.size} bytes)`)
			.join("\n");

		await this.workspace.fs.writeFile(
			"/workspace/MEDIA_MANIFEST.txt",
			`# vidismart R2 bucket — served at https://cdn.vidi.news\n${manifest}\n`,
		);

		return listed.objects.length;
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		const cors = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: cors });
		}

		if (url.pathname === "/health") {
			return Response.json({ ok: true, service: "vidiflow-cloud-agents" }, { headers: cors });
		}

		// POST /agents/:name/task  { prompt, mediaPrefix? }
		const m = url.pathname.match(/^\/agents\/([^/]+)\/task$/);
		if (m && request.method === "POST") {
			const name = m[1];
			const { prompt, mediaPrefix } = (await request.json()) as {
				prompt: string;
				mediaPrefix?: string;
			};

			const id = env.AGENT.idFromName(name);
			const stub = env.AGENT.get(id);

			await stub.fetch("http://agent/internal/prime", {
				method: "POST",
				body: JSON.stringify({ mediaPrefix }),
			});
			const res = await stub.fetch("http://agent/internal/task", {
				method: "POST",
				body: JSON.stringify({ prompt }),
			});
			const data = (await res.json()) as { result: unknown };

			return Response.json({ agent: name, result: data.result }, { headers: cors });
		}

		return new Response("vidiflow-cloud-agents: POST /agents/:name/task", {
			status: 404,
			headers: cors,
		});
	},
};
