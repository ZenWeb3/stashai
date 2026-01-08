import React from "react";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-xl font-bold text-black"
          >
            StashAI
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-black hover:text-gray-900 font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-black hover:text-gray-900 font-medium transition-colors"
            >
              How it Works
            </Link>

            <Link href="/login">
              <button className="px-6 py-2 border-2 text-black border-black rounded-lg font-semibold cursor-pointer ">
                Login
              </button>
            </Link>
          </div>

          <div className="md:hidden">
            <Link href="/login">
              <button className="px-4 py-2 border-2 border-gray-900 rounded-lg font-semibold text-sm">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
