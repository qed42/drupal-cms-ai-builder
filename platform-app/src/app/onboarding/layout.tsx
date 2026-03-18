export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#1a1a4e] to-[#0d0d3d] flex items-center justify-center">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.7; }
          50% { transform: scaleY(1.4); opacity: 1; }
        }
      `}</style>
      {children}
    </div>
  );
}
