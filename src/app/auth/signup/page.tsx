"use client";

import { Suspense } from "react";
import SignupContent from "../../../components/auth/SignupContent";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
