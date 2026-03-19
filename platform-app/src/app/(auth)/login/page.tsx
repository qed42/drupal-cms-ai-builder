"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BRAND } from "@/lib/brand";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = callbackUrl;
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo — visible on mobile where left panel is hidden */}
      <div className="flex items-center gap-2 mb-8 lg:mb-10">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15 L8 7 L12 13 L16 5 L20 15" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white">{BRAND.name}</span>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-white">
        Welcome back
      </h1>
      <p className="mb-8 text-sm text-white/50">
        Sign in to manage your websites
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300 border border-red-500/20">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-3 font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
