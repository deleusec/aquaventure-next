"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavHeader() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 flex justify-start items-center gap-4 font-light text-sm">
      <div className="p-2 relative">
        <Link href="/">Home</Link>
        {pathname === "/" && (
          <Image
            src="/dot.svg"
            alt="Dot"
            width={8}
            height={8}
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
            className="absolute right-1/2 bottom-0 transform translate-x-1/2"
          />
        )}
      </div>
      <div className="p-2 relative">
        <Link href="/my-bookings">My Bookings</Link>
        {pathname === "/my-bookings" && (
          <Image
            src="/dot.svg"
            alt="Dot"
            width={8}
            height={8}
            className="absolute right-1/2 bottom-0 transform translate-x-1/2"
          />
        )}
      </div>
    </nav>
  );
}
