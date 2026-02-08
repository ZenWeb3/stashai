"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, statsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/dashboard"),
      ]);

      const userData = await userRes.json();
      const statsData = await statsRes.json();

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
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <Sidebar
        user={user}
        stats={stats}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Chat / Main Panel */}
      <main
        className={`
          flex-1 h-screen overflow-hidden transition-all duration-300
          ${sidebarCollapsed ? "md:ml-[80px]" : "md:ml-[280px]"}
        `}
      >
        {children}
      </main>
    </div>
  );
}