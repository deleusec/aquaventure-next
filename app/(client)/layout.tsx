import Header from "@/components/layout/header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="container mx-auto min-h-[calc(100vh-75px)]">{children}</main>
    </>
  );
}
