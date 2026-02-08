"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, ChatPanel } from "@/components/dashboard";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Stats {
  totalIncome: number;
  incomeCount: number;
  totalSaved: number;
  activeGoals: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch user and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/dashboard"),
        ]);

        const userData = await userRes.json();
        const statsData = await statsRes.json();

        console.log("🔵 User data:", userData); // Debug
        console.log("🔵 User metadata:", userData.data?.user?.user_metadata); // Debug

        if (userData.success) {
          setUser(userData.data.user);
        } else {
          router.push("/auth/signin");
          return;
        }

        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            message: m.content,
          })),
        }),
      });

      const data = await res.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.data?.message || "Sorry, I couldn't process that.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Refresh stats after potential changes
      const statsRes = await fetch("/api/dashboard");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, something went wrong. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} stats={stats} onLogout={handleLogout}>
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        nickname={user?.user_metadata?.nickname}
      />
    </DashboardLayout>
  );
}
