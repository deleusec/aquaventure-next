import Header from "@/components/layout/header";
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="container mx-auto p-2 flex flex-col justify-between items-center">
        {children}
      </main>
    </>
  );
}
