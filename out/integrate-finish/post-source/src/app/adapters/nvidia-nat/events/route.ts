import { NextResponse } from "next/server";

const body = {
  ok: true,
  stub: true,
  demo: true,
  note: "NVIDIA NeMo Agent Toolkit events stub",
  baseline: "2026-10-11",
};

export async function GET() {
  return NextResponse.json(body);
}

export async function POST() {
  return NextResponse.json({ ...body, accepted: true });
}
