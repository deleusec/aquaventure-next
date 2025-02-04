export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex items-center justify-center h-screen w-full">
      {children}
    </main>
  );
}
