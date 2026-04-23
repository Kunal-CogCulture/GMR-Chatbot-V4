import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "GMR Aerocity AeroBot",
    version: "1.0.0-mvp",
    timestamp: new Date().toISOString(),
    stack: {
      llm: "Mistral Large",
      embeddings: "HuggingFace all-MiniLM-L6-v2",
      vectorDb: "Supabase pgvector",
    },
  });
}
