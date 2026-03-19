import { BRAND } from "@/lib/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — value proposition */}
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

          <div className="space-y-4">
            {[
              { title: "Tell us about your business", desc: "Answer a few quick questions about your goals and brand." },
              { title: "AI generates your site", desc: "Content, layout, and design — tailored to your industry." },
              { title: "Launch and customize", desc: "Edit with a visual builder. Your site is live instantly." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-brand-300">{i + 1}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

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
