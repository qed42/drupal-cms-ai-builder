import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Top nav bar */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Product logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15 L8 7 L12 13 L16 5 L20 15" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">{BRAND.name}</span>
            </div>

            {/* Nav links */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-white bg-white/10 rounded-md">
                Sites
              </Link>
              <Link href="/dashboard/settings" className="px-3 py-1.5 text-sm text-white/40 hover:text-white/60 rounded-md flex items-center gap-1.5">
                Settings
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30">Soon</span>
              </Link>
              <Link href="/dashboard/help" className="px-3 py-1.5 text-sm text-white/40 hover:text-white/60 rounded-md flex items-center gap-1.5">
                Help
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30">Soon</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm hidden sm:block">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
