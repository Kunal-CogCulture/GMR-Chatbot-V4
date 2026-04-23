import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChunkMetadata } from '@/types/knowledge';

// Lazy initialization — client is only created when first used,
// ensuring dotenv has already loaded the env vars before this runs.
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) throw new Error('SUPABASE_URL is not defined in environment variables.');
    if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');

    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

export async function upsertChunks(chunks: { embedding: number[]; metadata: ChunkMetadata }[]) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('embeddings')
    .upsert(
      chunks.map((chunk) => ({
        id: `${chunk.metadata.url}_chunk_${chunk.metadata.chunkIndex}`,
        embedding: chunk.embedding,
        metadata: chunk.metadata,
      })),
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Supabase upsert error:', error);
    throw error;
  }
  return data;
}

export async function queryChunks(
  embedding: number[],
  match_threshold = 0.5,
  match_count = 6
) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: embedding,
    match_threshold,
    match_count,
  });

  if (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
  return data;
}
