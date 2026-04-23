import MistralClient from '@mistralai/mistralai';
import { SYSTEM_PROMPT } from '@/constants/systemPrompt';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new MistralClient(apiKey);

export async function chatWithAeroBot(messages: any[], contextChunks: any[]) {
  const contextString = contextChunks
    .map((chunk, i) => `[SOURCE ${i + 1}]\nURL: ${chunk.metadata.url}\nTitle: ${chunk.metadata.title}\nContent: ${chunk.metadata.content}`)
    .join('\n\n');

  const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n<context>\nThe following information has been retrieved from the GMR Aerocity website to answer the user's question. Use this information to craft your response and include the source URLs as inline hyperlinks.\n\n${contextString}\n</context>`;

  // Check if Mistral with web search is a specific model or requires a tool
  // For now, we use mistral-large-latest or similar
  const response = await client.chatStream({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: fullSystemPrompt },
      ...messages
    ],
  });

  return response;
}
