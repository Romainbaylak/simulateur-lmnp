"use client";

import { Suspense } from "react";
import RapportInner from "./RapportInner";

export default function RapportPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0E8" }}>
        <div className="text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>Chargement…</div>
      </main>
    }>
      <RapportInner />
    </Suspense>
  );
}
