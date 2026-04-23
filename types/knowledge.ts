export interface PageContent {
  url: string;
  title: string;
  category: string;
  content: string;
  lastCrawled: string;
}

export interface ChunkMetadata {
  url: string;
  title: string;
  category: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  lastCrawled: string;
  contentHash?: string;
}

export interface VectorChunk {
  id: string;
  values: number[];
  metadata: ChunkMetadata;
}
