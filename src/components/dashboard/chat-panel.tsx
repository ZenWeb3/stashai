"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Zap } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  nickname?: string;
}

export function ChatPanel({
  messages,
  isLoading,
  isTyping,
  onSendMessage,
  nickname = "there",
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className="
        flex flex-col
        h-screen
        w-full
      "
    >
      {/* Header */}
      <header className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-full flex items-center justify-center border border-[#CCFF00]/30">
            <Zap className="w-5 h-5 text-[#CCFF00] fill-[#CCFF00]" />
          </div>
          <div>
            <h1 className="font-semibold">StashAI</h1>
            <p className="text-xs text-gray-500">Your financial assistant</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-2"
          >
            <div className="w-16 h-16 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#CCFF00]/30">
              <Zap className="w-8 h-8 text-[#CCFF00] fill-[#CCFF00]" />
            </div>

            <h2 className="text-xl font-light mb-2">Hey {nickname}! 👋</h2>

            <p className="text-gray-400 text-sm max-w-md mx-auto">
              I'm StashAI, your financial assistant. I can help you track
              income, manage savings goals, and make smarter money decisions.
            </p>

            {/* Suggestions */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "I earned ₦50,000 from a hackathon",
                "Create a goal for a new laptop",
                "Show my financial summary",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="
                    px-4 py-2
                    bg-white/5
                    border border-white/10
                    rounded-full
                    text-sm text-gray-300
                    hover:bg-white/10 hover:border-[#CCFF00]/30
                    transition-all
                  "
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  content={msg.content}
                  role={msg.role}
                  timestamp={msg.timestamp}
                />
              ))}
            </AnimatePresence>

            {/* Typing */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center">
                  <Zap size={16} className="text-[#CCFF00] fill-[#CCFF00]" />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 bg-[#CCFF00] rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/10 bg-black/30 backdrop-blur-md">
        <ChatInput
          onSend={onSendMessage}
          isLoading={isLoading || isTyping}
          placeholder="Message StashAI..."
        />
      </div>
    </div>
  );
}
