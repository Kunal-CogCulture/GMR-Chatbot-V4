import { PageContent, ChunkMetadata } from '@/types/knowledge';

export function chunkText(page: PageContent, chunkSize = 1500, overlap = 300): ChunkMetadata[] {
  const chunks: ChunkMetadata[] = [];
  const text = page.content;
  
  if (text.length <= chunkSize) {
    return [{
      ...page,
      chunkIndex: 0,
      totalChunks: 1,
    }];
  }

  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkContent = text.slice(start, end);

    chunks.push({
      url: page.url,
      title: page.title,
      category: page.category,
      content: chunkContent,
      lastCrawled: page.lastCrawled,
      chunkIndex: index,
      totalChunks: 0, // Will be updated after loop
    });

    start += (chunkSize - overlap);
    index++;
    
    if (start >= text.length) break;
  }

  // Update totalChunks
  return chunks.map(c => ({ ...c, totalChunks: chunks.length }));
}
