"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Plus, TrendingUp, Target, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const quickActions = [
  { icon: TrendingUp, label: "Log Income", prompt: "I want to log some income" },
  { icon: Target, label: "Create Goal", prompt: "I want to create a new savings goal" },
  { icon: Sparkles, label: "Financial Tips", prompt: "Give me financial tips based on my situation" },
];

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [openActions, setOpenActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const plusButtonRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [message]);

  const submit = (text?: string) => {
    const finalMessage = text ?? message;
    if (!finalMessage.trim() || isLoading) return;

    onSend(finalMessage.trim());
    setMessage("");
    setOpenActions(false);
  };

  return (
    <div className="relative w-full">
      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-black/70 backdrop-blur-md border-t border-white/10 p-4"
        
      >
        <div className="flex items-end gap-3 w-full max-w-[720px]">
          {/* Plus Button */}
          <div className="relative" ref={plusButtonRef}>
            <button
              type="button"
              onClick={() => setOpenActions((v) => !v)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-[#CCFF00] hover:bg-white/10 transition"
            >
              <Plus size={20} />
            </button>

            {/* Quick Actions Dropdown */}
            <AnimatePresence>
              {openActions && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: -4, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="
                    absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                    w-56 bg-black/90 backdrop-blur-xl border border-white/10
                    rounded-xl shadow-lg flex flex-col z-50
                  "
                >
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => submit(action.prompt)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-300 text-sm hover:bg-white/10 transition rounded-lg"
                    >
                      <action.icon size={16} className="text-[#CCFF00]" />
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message StashAI..."
            disabled={isLoading}
            rows={1}
            className="
              flex-1 bg-white/5 text-white placeholder-gray-400 resize-none
              focus:outline-none text-sm rounded-2xl px-4 py-3
              shadow-inner
              max-h-32
            "
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="
              w-12 h-12 flex items-center justify-center rounded-xl
              bg-[#CCFF00] text-black transition hover:shadow-lg disabled:opacity-50
            "
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>

      {/* Helper Text */}
      <p className="text-[10px] text-gray-500 text-center fixed bottom-0 left-0 right-0 z-20"
         style={{ marginLeft: "var(--sidebar-width)", marginBottom: "0.5rem" }}
      >
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
