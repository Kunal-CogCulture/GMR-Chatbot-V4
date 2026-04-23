# AeroBot — GMR Aerocity Smart Assistant

Production-grade RAG chatbot for [GMR Aerocity Delhi](https://www.gmraerocity.com/), embedded as a floating widget.

## ⚡ Tech Stack (Free MVP)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| LLM | Mistral Large (via Mistral AI API) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` (384-dim) |
| Vector DB | Supabase with `pgvector` |
| Crawler | Cheerio + Axios |

---

## 🚀 Setup

### 1. Prerequisites
- Node.js 20+
- A [Mistral AI](https://console.mistral.ai/) account (free tier available)
- A [Hugging Face](https://huggingface.co/) account (free)
- A [Supabase](https://supabase.com/) project (free tier)

### 2. Clone & Install
```bash
cd "GMR realtime"
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
copy .env.example .env.local
```

Edit `.env.local`:
```env
MISTRAL_API_KEY=your_mistral_api_key
HUGGING_FACE_API_KEY=your_hf_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_secure_password
```

### 4. Set Up Supabase Vector Store
Run the SQL in `supabase/schema.sql` in your **Supabase SQL Editor**:
- Enables `pgvector` extension
- Creates the `embeddings` table (384-dim vectors)
- Creates the `match_embeddings` RPC function used for semantic search

### 5. Ingest Knowledge Base
Run the crawler to populate your vector DB with GMR Aerocity content:
```bash
npm run ingest
```
This will crawl all 21 target pages, chunk them, embed them via HuggingFace, and upsert to Supabase.

### 6. Start Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** — click the floating button (bottom-right) to chat with AeroBot!

---

## 📁 Key File Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      ← Streaming chat endpoint (Mistral + RAG)
│   │   ├── crawl/route.ts     ← Manual crawl trigger
│   │   └── health/route.ts    ← Health check
│   ├── admin/page.tsx         ← Admin dashboard
│   └── page.tsx               ← Landing page
├── components/
│   ├── ChatWidget.tsx         ← Floating button + animation
│   ├── ChatWindow.tsx         ← Full chat UI
│   ├── MessageBubble.tsx      ← Markdown-rendered messages
│   ├── TypingIndicator.tsx    ← Loading dots
│   ├── SuggestionChips.tsx    ← Quick prompts
│   └── ChatHeader.tsx         ← Header bar
├── lib/
│   ├── crawler.ts             ← Cheerio page scraper
│   ├── chunker.ts             ← Text splitting utility
│   ├── embedder.ts            ← HuggingFace embeddings
│   ├── vectordb.ts            ← Supabase/pgvector client
│   └── retriever.ts           ← Semantic search
├── hooks/
│   └── useChat.ts             ← Chat state + streaming hook
├── scripts/
│   └── ingest.ts              ← One-time knowledge ingestion
└── supabase/
    └── schema.sql             ← DB setup SQL (run in Supabase)
```

---

## 🔑 API Keys (Where to Get Them)

| Key | Source | Free Tier |
|-----|--------|-----------|
| `MISTRAL_API_KEY` | [console.mistral.ai](https://console.mistral.ai/) | ✅ Yes |
| `HUGGING_FACE_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | ✅ Yes |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | [app.supabase.com](https://app.supabase.com/) → Project Settings → API | ✅ 500MB free |

---

## 🛠️ Admin Panel

Visit `/admin` (password: value of `ADMIN_PASSWORD` in `.env.local`)

- **Crawl Status** — View all indexed URLs, trigger re-crawl
- **Index Health** — Stack info and model details  
- **Test Query** — Live test AeroBot's responses

---

## 📦 Upgrading to Paid (Post-MVP)

| Component | Free MVP | Paid Upgrade |
|-----------|----------|-------------|
| LLM | Mistral Large | Claude Sonnet / GPT-4o |
| Embeddings | HF all-MiniLM | OpenAI text-embedding-3-small |
| Vector DB | Supabase free | Pinecone serverless |
| Crawler | Cheerio | Firecrawl SDK |
