"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Home, Settings, Users } from "lucide-react";

interface SidebarLink {
  title: string;
  label?: string;
  icon: React.ReactNode;
  href: string;
}

const sidebarLinks: SidebarLink[] = [
  {
    title: "Dashboard",
    icon: <Home className="w-4 h-4" />,
    href: "/admin",
  },
  {
    title: "Activities",
    icon: <Activity className="w-4 h-4" />,
    href: "/admin/activities",
  },
  {
    title: "Users",
    icon: <Users className="w-4 h-4" />,
    href: "/admin/users",
  },
  {
    title: "Settings",
    icon: <Settings className="w-4 h-4" />,
    href: "/admin/settings",
  },
];

export function NavigationSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold tracking-tight">Administration</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {sidebarLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === link.href && "bg-secondary"
              )}
              asChild
            >
              <Link href={link.href}>
                {link.icon}
                <span className="ml-2">{link.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
