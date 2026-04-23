"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white overflow-hidden"
          >
            <ChatWindow onClose={handleClose} onMinimize={handleMinimize} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized pill */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            key="minimized-pill"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="flex items-center gap-2 bg-[#1A3557] text-white px-4 py-2 rounded-full shadow-xl cursor-pointer hover:bg-[#2a4f7a] transition-colors"
            onClick={handleOpen}
          >
            <span className="text-sm font-medium">AeroBot</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Toggle Button */}
      <motion.button
        onClick={isOpen ? handleClose : handleOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-[#1A3557] shadow-xl flex items-center justify-center text-white hover:bg-[#2a4f7a] transition-colors"
        aria-label={isOpen ? "Close chat" : "Open chat with AeroBot"}
        title={isOpen ? "Close chat" : "Chat with AeroBot"}
      >
        {/* Pulse ring — only when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#1A3557] animate-ping opacity-30" />
        )}

        {/* Gold accent ring */}
        <span className="absolute inset-0 rounded-full border-2 border-[#C8973A] opacity-60" />

        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </motion.div>
      </motion.button>
    </div>
  );
}
