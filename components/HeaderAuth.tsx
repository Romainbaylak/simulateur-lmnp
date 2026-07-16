"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HeaderAuth({ dark = true }: { dark?: boolean }) {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="w-24 h-8 rounded" style={{ background: "rgba(255,255,255,0.1)" }} />;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard"
          className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
          style={{
            color: dark ? "#F5F0E8" : "#1A1612",
            border: dark ? "1px solid rgba(245,240,232,0.3)" : "1px solid rgba(26,22,18,0.2)",
            borderRadius: 6,
          }}>
          {user.firstName ?? "Mon compte"}
        </Link>
        <UserButton afterSignOutUrl="/" appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal" fallbackRedirectUrl="/">
        <button
          className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
          style={{
            color: dark ? "#F5F0E8" : "#1A1612",
            border: dark ? "1px solid rgba(245,240,232,0.3)" : "1px solid rgba(26,22,18,0.2)",
            borderRadius: 6,
          }}>
          Se connecter
        </button>
      </SignInButton>
    </div>
  );
}
