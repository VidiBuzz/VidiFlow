import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Agent Army · 8 agent harnesses — VidiFlow HX",
  description:
    "Every agent harness VidiFlow runs, on one page: Claude, Gemini, NVIDIA NeMo Agent Toolkit, OpenAI Codex, OpenClaw, Hermes Agent, Grok Bot, and OpenAI dots. Release timeline, facts, and adapter status.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
