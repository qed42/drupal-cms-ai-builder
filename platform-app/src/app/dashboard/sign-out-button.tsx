"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-white/30 text-sm hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}
