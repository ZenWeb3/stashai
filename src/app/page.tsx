"use client";
import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BalancedHero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* --- LAYER 1: THE DYNAMIC BACKGROUND --- */}
      {/* Animated Mouse Glow */}
      <motion.div 
        className="pointer-events-none absolute inset-0 z-10 opacity-30"
        style={{
          background: `radial-gradient(circle 500px at ${springX}px ${springY}px, rgba(204, 255, 0, 0.1), transparent 80%)`
        }}
      />

      {/* Masked Blueprint Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-20" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)'
        }} 
      />

      {/* Scanline Texture - reduced opacity for less eye strain */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-60" />

      {/* --- LAYER 2: THE FORMER CLEAN UI --- */}
      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="text-[#CCFF00] w-5 h-5 fill-[#CCFF00]" />
          <span className="font-bold tracking-tighter text-xl">StashAI</span>
        </div>
      <Link href="/auth" className="bg-[#CCFF00] text-black px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-1">
        Sign Up
      </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl"
        >
          {/* THE HEADLINE - Using system fonts with better fallbacks */}
          <h1 
            style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] leading-[0.9] mb-8 tracking-tighter uppercase font-light"
          >
            Stop Guessing. <br />
            <span className="text-[#CCFF00]">Start Growing.</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-tight leading-relaxed">
            The AI money coach for Gen Z hustlers with inconsistent income. <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Track your bounties, manage your runway, and grow your stash.
          </p>

          <div className="flex flex-col items-center gap-6">
           <Link href="/auth" className="bg-[#CCFF00] text-black px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              Get Started for Free <ChevronRight size={20} />
            </Link>

            <div className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.5em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
              Powered by Claude 3.5 + Opik
            </div>
          </div>
        </motion.div>
      </main>

      {/* Simple Footer Ribbon */}
      {/* <footer className="relative z-10 p-8 text-center border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em]">
          getstash.ai // Protocol_v1.0.2 // 2026
        </span>
      </footer> */}
    </div>
  );
}