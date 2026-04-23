import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env FIRST
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Verify critical keys are present before proceeding
const requiredKeys = ['MISTRAL_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}

import { crawlPage } from '../lib/crawler';
import { chunkText } from '../lib/chunker';
import { generateEmbedding } from '../lib/embedder';
import { upsertChunks } from '../lib/vectordb';
import { SITE_MAP } from '../constants/siteMap';

async function runIngestion() {
  console.log('\n🚀 Starting Knowledge Ingestion for GMR Aerocity...');
  console.log(`📋 Total pages to crawl: ${SITE_MAP.length}`);
  console.log(`🤖 LLM: Mistral Large | 🧠 Embeddings: mistral-embed (1024-dim)\n`);

  let indexed = 0;
  let failed = 0;

  for (const url of SITE_MAP) {
    console.log(`\n🔍 Crawling: ${url}`);
    const page = await crawlPage(url);

    if (!page || page.content.length < 100) {
      console.log(`⚠️  Skipping — no useful content found.`);
      failed++;
      continue;
    }

    console.log(`✂️  Chunking: "${page.title}" (${page.content.length} chars)`);
    const chunks = chunkText(page);
    console.log(`📦 Created ${chunks.length} chunks.`);

    const chunksWithEmbeddings: any[] = [];

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.content);
        chunksWithEmbeddings.push({ embedding, metadata: chunk });
        process.stdout.write('.');
        await sleep(1000); // 1-second delay to avoid Mistral rate limit
      } catch (error: any) {
        console.error(`\n❌ Embedding error for chunk ${chunk.chunkIndex}:`, error?.message || error);
      }
    }

    if (chunksWithEmbeddings.length > 0) {
      try {
        await upsertChunks(chunksWithEmbeddings);
        console.log(`\n✅ Indexed ${chunksWithEmbeddings.length}/${chunks.length} chunks → ${url}`);
        indexed++;
      } catch (error: any) {
        console.error(`\n❌ Upsert failed for ${url}:`, error?.message || error);
        failed++;
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✨ Ingestion Complete!`);
  console.log(`   ✅ Indexed: ${indexed} pages`);
  console.log(`   ❌ Failed:  ${failed} pages`);
  console.log(`${'─'.repeat(50)}`);
}

runIngestion().catch((err) => {
  console.error('\n💥 Fatal error:', err?.message || err);
  process.exit(1);
});
