"use client";
export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#1A3557] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
        A
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-[#C8973A] animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-[#C8973A] animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-[#C8973A] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
