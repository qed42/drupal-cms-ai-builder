export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0a2e] via-[#1a1a4e] to-[#0d0d3d]">
      {children}
    </div>
  );
}
