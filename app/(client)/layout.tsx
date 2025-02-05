import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="container mx-auto flex-1">{children}</main>
      <Footer />
    </>
  );
}
