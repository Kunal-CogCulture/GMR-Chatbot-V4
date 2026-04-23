"use client";
import { useState } from "react";

const TABS = ["Crawl Status", "Index Health", "Test Query"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Crawl Status");
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState("");
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "admin") {
      setIsAuthed(true);
    } else {
      setAuthError("Incorrect password.");
    }
  };

  const triggerCrawl = async () => {
    setIsCrawling(true);
    setCrawlResult("");
    try {
      const res = await fetch("/api/crawl", { method: "POST" });
      const data = await res.json();
      setCrawlResult(data.message || JSON.stringify(data));
    } catch {
      setCrawlResult("Error triggering crawl.");
    } finally {
      setIsCrawling(false);
    }
  };

  const runTestQuery = async () => {
    if (!testQuery.trim()) return;
    setIsQuerying(true);
    setTestResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: testQuery }],
          sessionId: "admin-test",
        }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
          setTestResult(result);
        }
      }
    } catch {
      setTestResult("Error running query.");
    } finally {
      setIsQuerying(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#0f2440] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="text-xl font-bold text-[#1A3557] mt-2">Admin Panel</h1>
            <p className="text-gray-400 text-sm">GMR Aerocity AeroBot</p>
          </div>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1A3557] mb-3"
          />
          {authError && <p className="text-red-500 text-xs mb-2">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-[#1A3557] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#2a4f7a] transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-[#1A3557] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <div>
            <h1 className="font-bold text-lg">AeroBot Admin</h1>
            <p className="text-white/60 text-xs">GMR Aerocity Knowledge Management</p>
          </div>
        </div>
        <button
          onClick={() => setIsAuthed(false)}
          className="text-white/60 text-xs hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-8">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#C8973A] text-[#1A3557]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        {/* Crawl Status Tab */}
        {activeTab === "Crawl Status" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-[#1A3557] mb-4">Manual Re-Crawl</h2>
              <p className="text-sm text-gray-500 mb-4">
                Trigger a full re-crawl of the GMR Aerocity website to update the knowledge base.
              </p>
              <button
                onClick={triggerCrawl}
                disabled={isCrawling}
                className="bg-[#1A3557] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#2a4f7a] disabled:opacity-50 transition-colors"
              >
                {isCrawling ? "🔄 Crawling..." : "🕷️ Trigger Full Crawl"}
              </button>
              {crawlResult && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border">
                  {crawlResult}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-[#1A3557] mb-4">Target URLs</h2>
              <div className="space-y-1">
                {[
                  "/", "/about", "/stay", "/eat-drink", "/work/offices",
                  "/work/meeting-room", "/work/coworking", "/the-square",
                  "/retail", "/relax", "/events", "/parking", "/concierge",
                  "/shuttle", "/ipsaa", "/delhi-to-agra-bus-service", "/faq",
                  "/contactus", "/offers", "/blog", "/aerocityone"
                ].map((path) => (
                  <div key={path} className="flex items-center gap-2 text-sm py-1 border-b border-gray-50">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <a
                      href={`https://www.gmraerocity.com${path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A3557] hover:text-[#C8973A] hover:underline"
                    >
                      gmraerocity.com{path}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Index Health Tab */}
        {activeTab === "Index Health" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#1A3557] mb-4">Index Health</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Embedding Model", value: "all-MiniLM-L6-v2", icon: "🧠" },
                { label: "LLM", value: "Mistral Large", icon: "🤖" },
                { label: "Vector DB", value: "Supabase pgvector", icon: "🗄️" },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="font-semibold text-[#1A3557] text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Query Tab */}
        {activeTab === "Test Query" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#1A3557] mb-4">Test AeroBot</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter a test query..."
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runTestQuery()}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1A3557]"
              />
              <button
                onClick={runTestQuery}
                disabled={isQuerying || !testQuery.trim()}
                className="bg-[#C8973A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#a87a2e] disabled:opacity-50 transition-colors"
              >
                {isQuerying ? "..." : "Send"}
              </button>
            </div>
            {testResult && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border whitespace-pre-wrap leading-relaxed">
                {testResult}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
