"use client";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import SuggestionChips from "./SuggestionChips";
import ChatHeader from "./ChatHeader";

interface ChatWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

export default function ChatWindow({ onClose, onMinimize }: ChatWindowProps) {
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(true);
  const [leadData, setLeadData] = useState({ name: "", email: "", phone: "" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (!showLeadForm) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, showLeadForm]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed, leadData.name); // Pass the name
    setInput("");
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadData.name && leadData.email && leadData.phone) {
      setShowLeadForm(false);
      // Optional: Send lead to backend here
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = !showLeadForm && messages.length === 0;
  const charCount = input.length;

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA] overflow-hidden relative">
      <ChatHeader onClose={onClose} onMinimize={onMinimize} />

      {showLeadForm ? (
        /* Lead Collection Form Overlay */
        <div className="flex-1 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 my-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg rotate-3 p-2">
                <img 
                  src="https://www.gmraerocity.com/wp-content/themes/gmr-aerocity/images/gmr-aerocity.svg" 
                  alt="GMR Aerocity" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-xl font-bold text-[#1A3557]">Welcome to AeroAI Concierge</h2>
              <p className="text-gray-500 mt-1 text-xs">Please share your details to begin.</p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C8973A] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C8973A] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 ml-1">Contact Number</label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={leadData.phone}
                  onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C8973A] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1A3557] text-white py-3.5 rounded-xl font-bold text-sm shadow-xl hover:bg-[#2a4f7a] transition-all active:scale-95 mt-2"
              >
                Start Conversation
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">GMR Aerocity Smart Assistant</p>
          </div>
        </div>
      ) : (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-3xl mx-auto px-4 pt-4 w-full">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-4 p-4 shadow-sm border border-gray-50">
                    <img 
                      src="https://www.gmraerocity.com/wp-content/themes/gmr-aerocity/images/gmr-aerocity.svg" 
                      alt="GMR Aerocity" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xl text-gray-700 font-semibold">Hello {leadData.name.split(' ')[0]}! I'm your AeroAI Concierge</p>
                  <p className="text-gray-400 mt-2">Your official GMR Aerocity assistant. How can I help you today?</p>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Suggestion Chips */}
          {showSuggestions && (
            <div className="max-w-3xl mx-auto w-full">
              <SuggestionChips onSelect={(text) => { 
                sendMessage(text, leadData.name); // Pass the name
                setInput(""); // Ensure input is cleared
              }} />
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-100 px-4 py-6 flex-shrink-0">
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-[#1A3557] transition-colors shadow-sm">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  maxLength={500}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about GMR Aerocity..."
                  className="flex-1 bg-transparent resize-none text-base text-gray-800 placeholder-gray-400 outline-none leading-relaxed max-h-48"
                  style={{ height: "24px" }}
                />
                <div className="flex items-center gap-3 pb-1">
                  {charCount > 400 && (
                    <span className={`text-xs ${charCount >= 500 ? "text-red-500" : "text-gray-400"}`}>
                      {charCount}/500
                    </span>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-[#1A3557] flex items-center justify-center text-white hover:bg-[#2a4f7a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-gray-300 mt-4">Powered by GMR Aerocity × AeroAI Concierge</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
