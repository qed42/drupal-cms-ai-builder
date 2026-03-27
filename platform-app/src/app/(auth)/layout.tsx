import { BRAND } from "@/lib/brand";
import ShowcaseCarousel from "@/components/auth/ShowcaseCarousel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — value proposition + showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15 L8 7 L12 13 L16 5 L20 15" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">{BRAND.name}</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight">
            Your professional Drupal website, built by AI in under 5 minutes.
          </h2>

          <ShowcaseCarousel />

          <p className="text-xs text-white/30 text-center">
            Sites built by {BRAND.name}
          </p>

          <div className="pt-4 border-t border-white/10">
            <p className="text-white/40 text-sm">
              Trusted by businesses across 20+ industries
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-slate-950 p-8">
        {children}
      </div>
    </div>
  );
}
