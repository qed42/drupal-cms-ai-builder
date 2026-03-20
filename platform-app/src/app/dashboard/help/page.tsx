export default function HelpPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 text-white/30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Help & Support</h1>
      <p className="text-white/40 text-sm max-w-md">
        Documentation, tutorials, and support resources are coming soon.
      </p>
      <span className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
        Coming Soon
      </span>
    </div>
  );
}
