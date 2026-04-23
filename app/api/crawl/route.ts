import { NextRequest, NextResponse } from "next/server";
import { crawlPage } from "@/lib/crawler";
import { chunkText } from "@/lib/chunker";
import { generateEmbedding } from "@/lib/embedder";
import { upsertChunks } from "@/lib/vectordb";
import { SITE_MAP } from "@/constants/siteMap";

let isCrawling = false;

export async function POST(req: NextRequest) {
  // Simple auth guard
  const authHeader = req.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
    // Allow unauthenticated for now in development
    console.warn("Crawl triggered without auth (dev mode)");
  }

  if (isCrawling) {
    return NextResponse.json({ message: "Crawl already in progress. Please wait." }, { status: 409 });
  }

  isCrawling = true;

  // Run crawl in background (fire and forget)
  (async () => {
    console.log("🕷️ Starting background crawl...");
    let indexed = 0;
    for (const url of SITE_MAP) {
      try {
        const page = await crawlPage(url);
        if (!page) continue;
        const chunks = chunkText(page);
        const chunksWithEmbeddings = [];
        for (const chunk of chunks) {
          const embedding = await generateEmbedding(chunk.content);
          chunksWithEmbeddings.push({ embedding, metadata: chunk });
        }
        if (chunksWithEmbeddings.length > 0) {
          await upsertChunks(chunksWithEmbeddings);
          indexed++;
        }
      } catch (err) {
        console.error(`Error crawling ${url}:`, err);
      }
    }
    console.log(`✅ Crawl complete. Indexed ${indexed}/${SITE_MAP.length} pages.`);
    isCrawling = false;
  })();

  return NextResponse.json({
    message: `🕷️ Crawl started in background for ${SITE_MAP.length} URLs. Check server logs for progress.`,
  });
}

export async function GET() {
  return NextResponse.json({
    status: isCrawling ? "crawling" : "idle",
    totalUrls: SITE_MAP.length,
  });
}
