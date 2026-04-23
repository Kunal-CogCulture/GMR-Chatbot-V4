export async function generateEmbedding(text: string): Promise<number[]> {
  // Read env var inside the function — not at module level —
  // so it's always resolved AFTER dotenv has loaded .env.local
  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

  if (!MISTRAL_API_KEY) {
    throw new Error(
      'MISTRAL_API_KEY is not defined. Make sure .env.local is present and contains MISTRAL_API_KEY.'
    );
  }

  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-embed',
      input: [text],
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral Embeddings API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  // Response shape: { data: [{ embedding: number[] }] }
  return data.data[0].embedding as number[];
}
