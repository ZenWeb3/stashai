"use client";

import { Suspense } from "react";
import LoginContent from "../../../components/auth/LoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

