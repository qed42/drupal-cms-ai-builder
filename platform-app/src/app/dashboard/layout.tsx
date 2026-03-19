import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";

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
              <span className="px-3 py-1.5 text-sm font-medium text-white bg-white/10 rounded-md">
                Sites
              </span>
              <span className="px-3 py-1.5 text-sm text-white/40 hover:text-white/60 cursor-default rounded-md">
                Settings
              </span>
              <span className="px-3 py-1.5 text-sm text-white/40 hover:text-white/60 cursor-default rounded-md">
                Help
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm hidden sm:block">{session.user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-white/30 text-sm hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
