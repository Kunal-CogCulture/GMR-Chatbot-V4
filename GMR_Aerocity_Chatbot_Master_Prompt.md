# GMR Aerocity Smart Assistant — Master Build Prompt
### Complete AI Coding IDE Prompt for Full-Stack Chatbot Development

---

## 🧠 PROJECT OVERVIEW

Build a **production-grade, real-time AI-powered chatbot assistant** for **GMR Aerocity Delhi** (https://www.gmraerocity.com/) — India's premier Global Business District located at Indira Gandhi International Airport. The assistant must act as a knowledgeable concierge, guide, and recommender for all services, venues, and experiences available at GMR Aerocity.

The chatbot must be:
- Embedded on the website as a **floating widget** (bottom-right corner)
- Powered by **RAG (Retrieval-Augmented Generation)** using live website content
- Capable of **inline hyperlink citations** pointing to specific GMR Aerocity pages
- **Real-time and auto-updating** when new content is added to the website
- Fully **conversational, context-aware, and multi-turn**

---

## 🏗️ TECH STACK

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Chat UI:** Custom-built floating widget component
- **Markdown Renderer:** `react-markdown` with `remark-gfm` for inline links
- **Animations:** Framer Motion for open/close widget transitions
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 20 + Express.js (or Next.js 14 API Routes)
- **Language:** TypeScript
- **API Layer:** RESTful `/api/chat` endpoint with streaming support (SSE or chunked transfer)
- **Authentication:** API key validation middleware

### AI & RAG Pipeline
- **LLM:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Embeddings:** OpenAI `text-embedding-3-small` OR Cohere `embed-english-v3.0`
- **Vector Database:** Pinecone (serverless) OR Supabase with pgvector
- **Orchestration:** LangChain.js OR direct SDK implementation
- **Web Crawler:** Firecrawl SDK OR Cheerio + Axios custom crawler

### Infrastructure
- **Deployment:** Vercel (frontend + API routes) OR Railway (backend)
- **Scheduler:** Vercel Cron Jobs OR node-cron for re-crawling
- **Environment:** `.env` with all API keys
- **Logging:** Console + optional Pino logger

---

## 🕷️ FEATURE 1 — WEBSITE CRAWLER & KNOWLEDGE INGESTION

### 1.1 Initial Full-Site Crawl

Build a crawler module (`/lib/crawler.ts`) that:

1. Starts from `https://www.gmraerocity.com/` and recursively discovers all internal links
2. Crawls and extracts clean text content from each page
3. Extracts the following metadata per page:
   - `url` — canonical page URL
   - `title` — page `<title>` or `<h1>`
   - `category` — inferred category (e.g., `hotel`, `restaurant`, `office`, `event`, `parking`, `retail`, `coworking`, `concierge`, `facility`)
   - `content` — full cleaned text body
   - `lastCrawled` — ISO timestamp
4. Chunks content into segments of **400–600 tokens** with **100-token overlap**
5. Generates embeddings for each chunk
6. Upserts all chunks into the vector database with full metadata

### Target pages to crawl (at minimum):
```
https://www.gmraerocity.com/
https://www.gmraerocity.com/about
https://www.gmraerocity.com/stay
https://www.gmraerocity.com/eat-drink
https://www.gmraerocity.com/work/offices
https://www.gmraerocity.com/work/meeting-room
https://www.gmraerocity.com/work/coworking
https://www.gmraerocity.com/the-square
https://www.gmraerocity.com/retail
https://www.gmraerocity.com/relax
https://www.gmraerocity.com/events
https://www.gmraerocity.com/parking
https://www.gmraerocity.com/concierge
https://www.gmraerocity.com/shuttle
https://www.gmraerocity.com/ipsaa
https://www.gmraerocity.com/delhi-to-agra-bus-service
https://www.gmraerocity.com/faq
https://www.gmraerocity.com/contactus
https://www.gmraerocity.com/offers
https://www.gmraerocity.com/blog
https://www.gmraerocity.com/aerocityone
```

Also crawl all sub-pages and blog posts discovered from these parent URLs.

### 1.2 Incremental Re-Crawl (Real-Time Updates)

Build a scheduler (`/lib/scheduler.ts`) that:

1. Re-crawls all known URLs **every 24 hours** via cron job
2. Computes a **content hash** (SHA-256) of each page's text
3. Compares against the stored hash in the database
4. If content has changed → **re-embeds and upserts** updated chunks only
5. Deletes stale chunks belonging to the old version of that page
6. Logs all update events with timestamps

---

## 🔍 FEATURE 2 — VECTOR SEARCH & RETRIEVAL

### 2.1 Vector Database Schema

Each stored chunk must have:
```json
{
  "id": "gmr_<url_slug>_chunk_<index>",
  "values": [/* 1536-dim embedding vector */],
  "metadata": {
    "url": "https://www.gmraerocity.com/stay",
    "title": "Stay - Hotels at GMR Aerocity",
    "category": "hotel",
    "content": "Chunk text here...",
    "chunkIndex": 0,
    "totalChunks": 4,
    "lastCrawled": "2025-10-12T08:00:00Z",
    "contentHash": "abc123..."
  }
}
```

### 2.2 Retrieval Logic

Build a retriever (`/lib/retriever.ts`) that:

1. Takes the user's query as input
2. Embeds the query using the same embedding model
3. Performs **top-K semantic search** (K = 6–8 chunks) against the vector DB
4. Optionally applies **metadata filters** (e.g., filter by `category` if the intent is clearly about hotels)
5. Returns deduplicated chunks ranked by relevance score
6. Includes a **minimum relevance threshold** (e.g., cosine similarity > 0.72) to avoid hallucination from irrelevant context

---

## 🤖 FEATURE 3 — AI CHAT ENGINE

### 3.1 System Prompt (inject into every API call)

```
You are AeroBot, the official intelligent concierge assistant for GMR Aerocity Delhi — India's premier Global Business District located at Indira Gandhi International Airport. You assist visitors, business travelers, guests, and tenants with everything related to GMR Aerocity.

PERSONALITY:
- Warm, professional, and knowledgeable — like a world-class concierge
- Enthusiastic about GMR Aerocity's offerings without being salesy
- Concise but comprehensive — never pad responses unnecessarily
- Use first-person ("I can help you with that") and address the user directly

CORE CAPABILITIES:
1. Answer questions about hotels, restaurants, cafes, retail shops, events, offices, coworking, meeting rooms, parking, concierge services, shuttle, day care, Delhi-Agra bus, and all other GMR Aerocity services
2. Make smart recommendations when asked (e.g., "best restaurant for a business dinner", "which hotel is closest to the airport terminal")
3. Help users plan their visit, day, or stay at GMR Aerocity
4. Guide users to the correct webpage for bookings, details, or contact info

CITATION RULES (MANDATORY):
- ALWAYS include inline hyperlinks using Markdown format: [text](URL)
- Every specific venue, service, offer, or page you mention MUST be linked to its GMR Aerocity URL
- Use ONLY URLs from the provided context — never fabricate URLs
- Format: "You can explore [Novotel Aerocity](https://www.gmraerocity.com/stay#novotel) for luxury stays near the airport."
- For general pages, link the section or category page
- At the end of every response, add a "🔗 Useful Links" section with 2–4 relevant page links as a quick-reference list

RESPONSE FORMAT:
- Use clear paragraphs, not bullet lists for conversational answers
- Use bullet lists only for comparisons or enumerations of 3+ items
- Keep responses under 250 words unless the user explicitly asks for detail
- For planning or recommendation queries, structure as: Overview → Options → Recommendation → CTA with link
- Never say "I don't have information" if the context has partial info — use what you have and suggest the user visit the relevant page for full details

BOUNDARIES:
- Only answer questions related to GMR Aerocity, its services, the surrounding Delhi/airport area when relevant
- For off-topic queries, politely redirect: "I'm specifically here to help you with everything at GMR Aerocity. For that, I'd be happy to help!"
- Do not make up prices, timings, or contact numbers unless they appear in the provided context
- If asked for something not in the context, say: "I don't have the latest details on that right now — please visit [our website](https://www.gmraerocity.com/) or call our concierge for the most up-to-date information."
```

### 3.2 Chat API Endpoint (`POST /api/chat`)

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What hotels are available?" },
    { "role": "assistant", "content": "GMR Aerocity has several luxury hotels..." },
    { "role": "user", "content": "Which one is best for a business traveler?" }
  ],
  "sessionId": "uuid-string"
}
```

**Server-side logic:**
1. Extract the latest user message
2. Run semantic retrieval to fetch top-K relevant chunks
3. Inject retrieved context into the Claude API call as a formatted `context` block before the conversation
4. Call Claude API with **streaming enabled** (`stream: true`)
5. Forward the streamed response chunks to the client via **Server-Sent Events (SSE)**
6. Store conversation history in server-side session cache (Redis or in-memory Map) keyed by `sessionId`

**Context injection format:**
```
<context>
The following information has been retrieved from the GMR Aerocity website to answer the user's question. Use this information to craft your response and include the source URLs as inline hyperlinks.

[SOURCE 1]
URL: https://www.gmraerocity.com/stay
Title: Stay - Hotels at GMR Aerocity
Content: {chunk text}

[SOURCE 2]
URL: https://www.gmraerocity.com/work/meeting-room
Title: Meeting Room Booking
Content: {chunk text}
...
</context>
```

### 3.3 Intent Detection (Optional Enhancement)

Build a lightweight intent classifier that pre-processes each user message and tags it with one of:
- `hotel_inquiry` | `dining_inquiry` | `work_inquiry` | `event_inquiry`
- `parking_inquiry` | `retail_inquiry` | `transport_inquiry`
- `planning_request` | `recommendation_request` | `general_inquiry`

Use this tag to:
1. Pre-filter the vector search by `category` metadata
2. Customize response tone slightly (e.g., more formal for `work_inquiry`)

---

## 💬 FEATURE 4 — CHAT WIDGET UI

### 4.1 Floating Widget Component

Build a self-contained React component (`<AeroCityChat />`) that:

**Closed State:**
- Shows a floating circular button (bottom-right, 16px margin)
- GMR Aerocity logo or airplane/building icon inside
- Pulsing animation to draw attention on first load
- Tooltip on hover: "Chat with AeroBot"

**Open State:**
- Smooth slide-up / expand animation (Framer Motion)
- Dimensions: 380px wide × 580px tall (mobile: full screen)
- Header bar with GMR Aerocity branding + "AeroBot" name + online indicator (green dot)
- Minimize button and Close button in header

### 4.2 Chat Window

- **Message bubbles:** User messages right-aligned (brand color background), assistant messages left-aligned (white/light background with subtle shadow)
- **Markdown rendering:** Full markdown support — bold, italic, bullet lists, and **clickable hyperlinks** (open in new tab with `target="_blank" rel="noopener"`)
- **Typing indicator:** Three animated dots while waiting for response
- **Streaming text:** Characters appear progressively as they stream in (typewriter effect)
- **Timestamps:** Shown on hover for each message
- **Auto-scroll:** Scroll to the latest message automatically

### 4.3 Input Area

- Multi-line text input (auto-grows up to 3 lines)
- Send button (disabled when input is empty or response is streaming)
- **Keyboard shortcut:** `Enter` to send, `Shift+Enter` for new line
- Character limit: 500 characters with live counter shown when over 400

### 4.4 Suggested Prompts (Quick Chips)

On fresh open, show 4–6 clickable suggestion chips:
```
"🏨 Hotels near the airport"
"🍽️ Best restaurants for dinner"
"💼 Book a meeting room"
"🎉 Upcoming events"
"🚗 Parking information"
"📍 Plan my visit"
```
These disappear once the first message is sent.

### 4.5 Branding & Colors

```css
--primary: #1A3557;       /* GMR deep navy */
--accent: #C8973A;        /* Gold accent */
--bg-chat: #F5F7FA;       /* Light grey chat background */
--bubble-user: #1A3557;   /* User bubble */
--bubble-bot: #FFFFFF;    /* Bot bubble */
--text-primary: #1A1A2E;
--font: 'Poppins', sans-serif;
```

### 4.6 Mobile Responsiveness

- On screens < 768px: widget opens as **full-screen overlay** with safe area insets
- Bottom input bar stays fixed above mobile keyboard
- Touch-friendly tap targets (min 44px)

---

## 🧩 FEATURE 5 — ADMIN PANEL (Optional but Recommended)

Build a simple password-protected admin page (`/admin`) with:

1. **Crawl Status Dashboard** — Shows all indexed URLs, last crawl time, chunk count, and content hash
2. **Manual Re-crawl Button** — Trigger re-crawl for specific URL or entire site
3. **Index Health** — Total chunks in vector DB, embedding model used, last update
4. **Conversation Logs** — View recent chat sessions (anonymized) for QA purposes
5. **Blocked Topics** — Add phrases or topics to a deny-list (chatbot refuses these gracefully)
6. **Test Interface** — Send test queries and see retrieved context chunks alongside the final answer

---

## 🔐 FEATURE 6 — SECURITY & PERFORMANCE

### Security
- All API keys stored in `.env` — never exposed to client
- Rate limiting: Max **20 requests per IP per minute** using `express-rate-limit`
- Input sanitization: Strip HTML/script tags from user input before processing
- CORS: Restrict API to `gmraerocity.com` origin only in production
- Session IDs: Use `nanoid` to generate — never expose internal IDs

### Performance
- **Streaming responses** so users see text immediately (no waiting for full response)
- **Cache embeddings** for identical queries within a session (MD5 hash lookup)
- **Lazy load** the chat widget JS bundle — don't block main page load
- **Connection pooling** for vector DB queries
- Vector DB queries must complete in **< 300ms** (use Pinecone serverless for speed)
- Full response latency target: **< 2 seconds** to first token

---

## 📁 PROJECT FILE STRUCTURE

```
gmr-aerocity-chatbot/
├── README.md
├── .env.example
├── package.json
├── tsconfig.json
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # Demo/embed page
│   │   ├── admin/page.tsx          # Admin panel
│   │   └── api/
│   │       ├── chat/route.ts       # Main chat endpoint (streaming)
│   │       ├── crawl/route.ts      # Trigger crawl endpoint
│   │       └── health/route.ts     # Health check
│   │
│   ├── components/
│   │   ├── ChatWidget.tsx          # Main floating widget wrapper
│   │   ├── ChatWindow.tsx          # Open chat UI
│   │   ├── MessageBubble.tsx       # Individual message with markdown
│   │   ├── TypingIndicator.tsx     # Animated dots
│   │   ├── SuggestionChips.tsx     # Quick prompt chips
│   │   └── ChatHeader.tsx          # Widget header bar
│   │
│   ├── lib/
│   │   ├── crawler.ts              # Website crawler logic
│   │   ├── chunker.ts              # Text chunking utility
│   │   ├── embedder.ts             # Embedding generation
│   │   ├── vectordb.ts             # Pinecone/Supabase connector
│   │   ├── retriever.ts            # Semantic search logic
│   │   ├── claude.ts               # Anthropic API wrapper
│   │   ├── scheduler.ts            # Cron job for re-crawling
│   │   ├── intentDetector.ts       # Intent classification
│   │   └── sessionStore.ts         # In-memory session management
│   │
│   ├── hooks/
│   │   ├── useChat.ts              # Chat state & streaming hook
│   │   └── useSession.ts           # Session ID management
│   │
│   ├── types/
│   │   ├── chat.ts                 # Message, Session types
│   │   └── knowledge.ts            # Chunk, Page, Metadata types
│   │
│   └── constants/
│       ├── siteMap.ts              # All GMR Aerocity URLs to crawl
│       └── systemPrompt.ts         # Claude system prompt
│
├── scripts/
│   ├── ingest.ts                   # One-time full ingestion script
│   └── testRetrieval.ts            # Test vector search quality
│
└── public/
    └── embed.js                    # Embeddable widget script tag
```

---

## 🚀 FEATURE 7 — EMBEDDABLE WIDGET SCRIPT

Build a standalone embed script (`/public/embed.js`) so the GMR Aerocity website team can add the chatbot with just **2 lines of HTML**:

```html
<script src="https://your-deployment.vercel.app/embed.js" defer></script>
<div id="gmr-aerocity-chat"></div>
```

The script should:
1. Dynamically inject the React bundle and CSS
2. Mount the `<AeroCityChat />` component into `#gmr-aerocity-chat`
3. Be fully isolated (use Shadow DOM or scoped CSS to avoid style conflicts with the host page)
4. Load asynchronously — must not block the main page's `load` event

---

## 📋 ENVIRONMENT VARIABLES REQUIRED

```env
# AI
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here            # For embeddings

# Vector DB (choose one)
PINECONE_API_KEY=your_key_here
PINECONE_INDEX_NAME=gmr-aerocity
PINECONE_ENVIRONMENT=us-east-1

# OR Supabase
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_KEY=your_service_key

# Crawler
FIRECRAWL_API_KEY=your_key_here         # Optional if using custom crawler

# App
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
ADMIN_PASSWORD=your_secure_password
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20
CRAWL_SCHEDULE_CRON="0 2 * * *"        # Run at 2 AM daily
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1 — Core RAG Pipeline
- [ ] Build crawler that extracts all GMR Aerocity pages
- [ ] Build chunker with 400-600 token chunks + 100 token overlap
- [ ] Set up vector database and test upsert/query
- [ ] Verify semantic search returns relevant chunks for sample queries
- [ ] Build `/api/chat` endpoint with context injection

### Phase 2 — Chat UI
- [ ] Build floating widget component
- [ ] Implement streaming response rendering
- [ ] Add markdown + hyperlink rendering
- [ ] Add suggestion chips
- [ ] Test on mobile viewport

### Phase 3 — Real-Time Updates
- [ ] Implement content hash comparison logic
- [ ] Build cron job scheduler for daily re-crawl
- [ ] Test incremental update with a changed page
- [ ] Build admin dashboard (crawl status + manual trigger)

### Phase 4 — Polish & Deploy
- [ ] Add rate limiting and security middleware
- [ ] Build embeddable widget script
- [ ] Deploy to Vercel
- [ ] End-to-end test with 20+ real user queries
- [ ] Performance test: latency < 2s, widget load < 500ms

---

## 🧪 SAMPLE TEST QUERIES TO VALIDATE

After building, test with these queries to ensure quality:

1. "What hotels are available at GMR Aerocity?"
2. "I need a meeting room for 10 people tomorrow. How do I book?"
3. "Can you recommend a good Indian restaurant for a business dinner?"
4. "How do I get from GMR Aerocity to Agra?"
5. "Is there parking available? What are the charges?"
6. "Plan a full day for a business traveler who lands at 9 AM"
7. "What coworking options do I have?"
8. "Are there any ongoing offers or promotions?"
9. "Where can I relax after a long flight?"
10. "What events are happening this month?"

**Expected behavior for each:** Relevant answer + 1–3 inline hyperlinks + a "🔗 Useful Links" section at the bottom.

---

*Built for GMR Aerocity Delhi — India's Global Business District*
*Target: https://www.gmraerocity.com/*
