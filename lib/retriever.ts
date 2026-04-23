import { generateEmbedding } from './embedder';
import { queryChunks } from './vectordb';

export async function retrieveContext(query: string) {
  try {
    console.log(`🔍 Retrieving context for query: "${query}"`);
    
    // 1. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // 2. Search Vector DB (fetch top 12 results to show a variety of options)
    const chunks = await queryChunks(queryEmbedding, 0.4, 12);
    
    return chunks || [];
  } catch (error) {
    console.error('Error retrieving context:', error);
    return [];
  }
}
