"use client";
import { X, Minus } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize: () => void;
}

export default function ChatHeader({ onClose, onMinimize }: ChatHeaderProps) {
  return (
    <div className="bg-[#1A3557] px-4 py-3 flex-shrink-0">
      <div className="max-w-3xl mx-auto flex items-center justify-between w-full">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <span className="text-lg">✈️</span>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1A3557]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">AeroBot</p>
            <p className="text-white/60 text-xs">GMR Aerocity Concierge</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/80 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
