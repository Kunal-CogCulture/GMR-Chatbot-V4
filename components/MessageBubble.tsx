"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/hooks/useChat";
import { ExternalLink, ArrowRight } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Pre-process content to handle 'action:' links before ReactMarkdown sees them
  // This bypasses the default uriTransformer which blocks non-standard protocols
  const processedContent = message.content.replace(/\(action:([^)]+)\)/g, '(https://cta-redirect.internal?url=$1)');

  return (
    <div className={`flex items-start gap-3 mb-5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
          isUser ? "bg-[#C8973A] text-white" : "bg-[#1A3557] text-white"
        }`}
      >
        {isUser ? "U" : "A"}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Main Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? "bg-[#1A3557] text-white rounded-tr-sm"
              : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  const isAction = href?.includes("cta-redirect.internal");
                  let url = href || "";
                  
                  if (isAction) {
                    // Extract the actual URL from our placeholder
                    const match = href?.match(/url=([^&]+)/);
                    url = match ? decodeURIComponent(match[1]) : url;
                  }

                  // Ensure URL is absolute for CTAs
                  if (isAction && url && !url.startsWith("http")) {
                    url = `https://www.gmraerocity.com${url.startsWith("/") ? "" : "/"}${url}`;
                  }

                  if (isAction) {
                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF8EE] border border-[#C8973A]/30 text-[#1A3557] font-semibold text-xs rounded-full hover:bg-[#C8973A] hover:text-white transition-all duration-200 shadow-sm mx-1 my-0.5"
                      >
                        {children}
                        <ArrowRight size={12} />
                      </a>
                    );
                  }

                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C8973A] underline hover:text-[#a87a2e] font-medium transition-colors"
                    >
                      {children}
                    </a>
                  );
                },
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold text-[#1A3557]">{children}</strong>,
              }}
            >
              {processedContent}
            </ReactMarkdown>
          )}

          {/* Timestamp */}
          <p className={`text-[10px] mt-2 opacity-40 ${isUser ? "text-white" : "text-gray-400"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}
