"use client";

import Link from "next/link";

export default function NavHeader() {
  return (
    <nav className="flex-1 flex justify-center items-center gap-4">
      <Link href="/">Home</Link>
      <Link href="/activities">Activities</Link>
      <Link href="/bookings">My Bookings</Link>
    </nav>
  );
}
