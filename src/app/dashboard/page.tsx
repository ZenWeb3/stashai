"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, User, Bot, Menu, X, Plus, TrendingUp, Wallet, Target, Settings, LogOut, Paperclip, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey! 👋 I'm yourStashAI. I'm here to help you track your income, manage your expenses, and grow your stash. What would you like to work on today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm analyzing your request... This is where I'd provide personalized financial advice based on your input. Connect me to your actual AI backend to unlock the full experience!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const quickActions = [
    { icon: TrendingUp, label: 'Track Income', action: 'I want to track my income' },
    { icon: Wallet, label: 'Manage Budget', action: 'Help me create a budget' },
    { icon: Target, label: 'Set Goals', action: 'I want to set financial goals' },
  ];

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex font-sans relative overflow-hidden">
      
      {/* Background Effects */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} 
      />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar Content */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed lg:relative w-80 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="text-[#CCFF00] w-6 h-6 fill-[#CCFF00]" />
                    <span className="font-bold tracking-tighter text-xl">StashAI</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <button className="w-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] px-4 py-3 rounded-lg font-semibold text-sm hover:bg-[#CCFF00]/20 transition-all flex items-center justify-center gap-2">
                  <Plus size={18} />
                  New Conversation
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Recent Chats
                </div>
                {['Budget Review - Today', 'Income Tracking - Yesterday', 'Savings Goal - 2 days ago'].map((chat, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
                  >
                    {chat}
                  </button>
                ))}
              </div>

              {/* User Profile & Settings */}
              <div className="p-4 border-t border-white/10 space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">
                  <Settings size={18} className="text-gray-400" />
                  <span>Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-red-400">
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#CCFF00]/20 flex items-center justify-center">
                <Bot size={18} className="text-[#CCFF00]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Stash AI</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="font-mono text-[10px] text-gray-600 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={12} className="text-[#CCFF00]" />
            Claude 3.5
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#CCFF00]/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-[#CCFF00]" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-2xl px-5 py-3 ${
                    message.sender === 'user' 
                      ? 'bg-[#CCFF00] text-black' 
                      : 'bg-white/5 border border-white/10 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-[#CCFF00]/20 flex items-center justify-center">
                <Bot size={18} className="text-[#CCFF00]" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions (shown when chat is empty or at start) */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputMessage(action.action);
                    inputRef.current?.focus();
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <action.icon size={24} className="text-[#CCFF00]" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl p-6">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3">
              <button
                type="button"
                className="p-3 hover:bg-white/10 rounded-lg transition-colors mb-1"
                title="Attach file"
              >
                <Paperclip size={20} className="text-gray-400" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your finances..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-5 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-[#CCFF00] text-black p-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-1"
              >
                <Send size={20} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              StashAI can make mistakes. Always verify important financial decisions.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}