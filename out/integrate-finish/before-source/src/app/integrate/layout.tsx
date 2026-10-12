import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Integrate runtimes",
  description: "VidiFlow builds agent stacks that work for businesses. Release timeline and adapters for Claude, Gemini, OpenAI Codex, OpenAI dots, Grok Bot, Hermes Agent, OpenClaw, and NVIDIA NeMo Agent Toolkit.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
