"use client";
import { motion } from "framer-motion";
import { User, Zap } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp?: Date;
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-white/10 border border-white/20"
            : "bg-[#CCFF00]/10 border border-[#CCFF00]/30"
        }`}
      >
        {isUser ? (
          <User size={16} className="text-gray-400" />
        ) : (
          <Zap size={16} className="text-[#CCFF00] fill-[#CCFF00]" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[#CCFF00] text-black rounded-br-md"
            : "bg-white/5 border border-white/10 text-white rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={`text-[10px] mt-1 ${
              isUser ? "text-black/50" : "text-gray-500"
            }`}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}