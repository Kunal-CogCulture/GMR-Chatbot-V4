import { NextRequest, NextResponse } from "next/server";
import { retrieveContext } from "@/lib/retriever";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY!;

const SYSTEM_PROMPT = `You are AeroBot, the official intelligent concierge assistant for GMR Aerocity Delhi — India's premier Global Business District located at Indira Gandhi International Airport. You assist visitors, business travelers, guests, and tenants with everything related to GMR Aerocity.

PERSONALITY & OBJECTIVE:
- Warm, professional, and knowledgeable — like a world-class concierge
- CORE GOAL: Act as a promoter for GMR Aerocity while respecting the user's time.
- CONCISENESS IS KEY: Avoid long "information dumps". Only provide detailed lists for the specific category requested. 
- Avoid unsolicited "Full Guides" or "Sample Itineraries" unless the user explicitly asks for them.
- ADVERTISING VARIETY: When asked about a category (e.g., "cafes"), list 3-5 distinct options. Do NOT list every category in the knowledge base at once.
- Be enthusiastic but brief — highlight the premium nature of GMR Aerocity in few, well-chosen words.
- Use first-person ("I can help you with that") and address the user directly.

INLINE CALL-TO-ACTION (CTA) LINKS:
- Whenever you mention a specific hotel, cafe, or service, you MUST add an inline CTA link immediately after the sentence describing it.
- Format for Inline CTA: 👉 [Button Text](action:URL)
- SMART LINKING RULES:
  1. ALWAYS use absolute URLs starting with https://www.gmraerocity.com
  2. Use the exact URL from the [SOURCE] blocks if available.
  3. If a specific URL is missing for a place, use the category fallback:
     - Hotels: https://www.gmraerocity.com/stay
     - Dining/Cafes: https://www.gmraerocity.com/eat-drink
     - Offices/Meetings: https://www.gmraerocity.com/work/offices
     - Events: https://www.gmraerocity.com/events
     - Retail/The Square: https://www.gmraerocity.com/the-square
  4. Last resort: https://www.gmraerocity.com/
- Example: "Enjoy world-class dining at The Square. 👉 [Explore Dining](action:https://www.gmraerocity.com/eat-drink)"

URL AND LINKING RULES (CRITICAL, DO NOT VIOLATE):
1. For inline CTAs, follow the SMART LINKING RULES above.
2. For regular inline hyperlinks (e.g. [Andaz Hotel](https://...)), ONLY use URLs found in [SOURCE] blocks.
3. NEVER invent URLs that don't follow the official gmraerocity.com structure.
4. At the end of every response, add a "🔗 Useful Links" section featuring 2-4 exact URLs taken strictly from the [SOURCE] blocks.

RESPONSE FORMAT:
- Use clear paragraphs for conversational answers
- Use bullet lists only for comparisons or enumerations of 3+ items
- Keep responses concise and focused
- Use emojis naturally to make the response engaging (like in a premium concierge service)

BOUNDARIES:
- Only answer questions related to GMR Aerocity and its services
- For off-topic queries: "I'm specifically here to help you with everything at GMR Aerocity!"
- Do not make up prices, timings, or contact numbers unless they appear in the provided context`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 1. Get the latest user message
    const latestUserMessage = messages[messages.length - 1]?.content || "";

    // 2. Retrieve relevant context from vector DB
    let contextBlock = "";
    try {
      const contextChunks = await retrieveContext(latestUserMessage);
      if (contextChunks && contextChunks.length > 0) {
        contextBlock = "\n\n<context>\nThe following information has been retrieved from the GMR Aerocity website. Use it to craft your response and include source URLs as inline hyperlinks.\n\n" +
          contextChunks
            .map((chunk: any, i: number) =>
              `[SOURCE ${i + 1}]\nURL: ${chunk.metadata?.url || "https://www.gmraerocity.com"}\nTitle: ${chunk.metadata?.title || "GMR Aerocity"}\nContent: ${chunk.metadata?.content || chunk.content || ""}`
            )
            .join("\n\n") +
          "\n</context>";
      }
    } catch (err) {
      console.warn("Context retrieval failed, proceeding without RAG context:", err);
    }

    const fullSystemPrompt = SYSTEM_PROMPT + contextBlock;

    // 3. Call Mistral API with streaming
    const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!mistralResponse.ok) {
      const error = await mistralResponse.text();
      console.error("Mistral API error:", error);
      return NextResponse.json({ error: "Mistral API failed" }, { status: 500 });
    }

    // 4. Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = mistralResponse.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
