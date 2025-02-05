"use client";

import Link from "next/link";

export default function NavHeader() {
  return (
    <nav className="flex-1 flex justify-center gap-4">
      <Link href="/">Home</Link>
      <Link href="/activities">Activities</Link>
      <Link href="/my-bookings">My Bookings</Link>
    </nav>
  );
}
