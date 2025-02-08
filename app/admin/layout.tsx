import { NavigationSidebar } from "@/components/layout/admin/nav-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[260px_1fr] max-h-screen">
      <NavigationSidebar />
      <div className="flex flex-col w-full h-screen overflow-auto">
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-6xl p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
