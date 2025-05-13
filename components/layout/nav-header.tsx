"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

export default function NavHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/activities", label: "Activities" },
    { href: "/bookings", label: "My Bookings" },
  ];

  return (
    <>
      <nav className="flex-1 justify-start items-center gap-4 font-light text-sm hidden lg:flex">
        <div className="p-2 relative">
          <Link href="/">Home</Link>
          {pathname === "/" && (
            <Image
              src="/dot.svg"
              alt="Dot"
              width={8}
              height={8}
              loading="lazy"
              className="absolute right-1/2 bottom-0 transform translate-x-1/2"
            />
          )}
        </div>
        <div className="p-2 relative">
          <Link href="/activities">Activities</Link>
          {pathname === "/activities" && (
            <Image
              src="/dot.svg"
              alt="Dot"
              width={8}
              height={8}
              loading="lazy"
              className="absolute right-1/2 bottom-0 transform translate-x-1/2"
            />
          )}
        </div>
        <div className="p-2 relative">
          <Link href="/bookings">My Bookings</Link>
          {pathname === "/bookings" && (
            <Image
              src="/dot.svg"
              alt="Dot"
              width={8}
              height={8}
              loading="lazy"
              className="absolute right-1/2 bottom-0 transform translate-x-1/2"
            />
          )}
        </div>
      </nav>

      <div className="lg:hidden flex-1">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-10 h-10" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Navigation links</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
