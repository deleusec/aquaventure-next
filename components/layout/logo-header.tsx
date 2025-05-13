"use client";

import Image from "next/image";
import Link from "next/link";

export default function LogoHeader() {
  return (
    <Link className="flex-1 flex items-center justify-center" href="/" passHref aria-label="Aquaventure" title="Aquaventure">
      <Image src="/aquaventure.svg" alt="Aquaventure" width={0} height={12} className="w-auto" loading="lazy"/>
    </Link>
  );
}
